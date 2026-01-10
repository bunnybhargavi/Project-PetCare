package com.pets.petcare.service;

import com.pets.petcare.dto.ProductRequest;
import com.pets.petcare.dto.ProductResponse;
import com.pets.petcare.entity.Product;
import com.pets.petcare.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * Get all active products with pagination
     */
    public Page<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products = productRepository.findByActiveTrue(pageable);
        
        // Debug logging to help identify visibility issues
        log.info("Loading products - Total active products found: {}", products.getTotalElements());
        log.info("Vendor products in result: {}", 
            products.getContent().stream()
                .filter(p -> p.getVendor() != null)
                .count());
        log.info("Admin products in result: {}", 
            products.getContent().stream()
                .filter(p -> p.getVendor() == null)
                .count());
        
        return products.map(this::mapToResponse);
    }

    /**
     * Get products by category
     */
    public Page<ProductResponse> getProductsByCategory(Product.Category category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByCategoryAndActiveTrue(category, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Search products
     */
    public Page<ProductResponse> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rating").descending());
        return productRepository.searchProducts(query, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Filter products by price range
     */
    public Page<ProductResponse> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, 
                                                        int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("price").ascending());
        return productRepository.findByPriceRange(minPrice, maxPrice, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Filter products by category and price range
     */
    public Page<ProductResponse> getProductsByCategoryAndPriceRange(Product.Category category,
                                                                   BigDecimal minPrice, 
                                                                   BigDecimal maxPrice,
                                                                   int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("price").ascending());
        return productRepository.findByCategoryAndPriceRange(category, minPrice, maxPrice, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get featured products
     */
    public Page<ProductResponse> getFeaturedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findFeaturedProducts(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Get product by ID
     */
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    /**
     * Create new product (Admin only)
     */
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = new Product();
        mapRequestToEntity(request, product);
        
        Product savedProduct = productRepository.save(product);
        log.info("Product created: {} with ID: {}", savedProduct.getTitle(), savedProduct.getId());
        
        return mapToResponse(savedProduct);
    }

    /**
     * Update product (Admin only)
     */
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        mapRequestToEntity(request, product);
        Product updatedProduct = productRepository.save(product);
        
        log.info("Product updated: {} with ID: {}", updatedProduct.getTitle(), updatedProduct.getId());
        
        return mapToResponse(updatedProduct);
    }

    /**
     * Delete product (Admin only)
     */
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setActive(false); // Soft delete
        productRepository.save(product);
        
        log.info("Product soft deleted: {} with ID: {}", product.getTitle(), product.getId());
    }

    /**
     * Get all categories
     */
    public List<Product.Category> getAllCategories() {
        return List.of(Product.Category.values());
    }

    /**
     * Map ProductRequest to Product entity
     */
    private void mapRequestToEntity(ProductRequest request, Product product) {
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImages(request.getImages());
        product.setActive(request.getActive());
        product.setDiscountPercentage(request.getDiscountPercentage());
        product.setBrand(request.getBrand());
        product.setSku(request.getSku());
    }

    /**
     * Map Product entity to ProductResponse
     */
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountedPrice(product.getDiscountedPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .categoryDisplayName(product.getCategory().getDisplayName())
                .images(product.getImages())
                .active(product.getActive())
                .discountPercentage(product.getDiscountPercentage())
                .brand(product.getBrand())
                .sku(product.getSku())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .inStock(product.isInStock())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                // Vendor information
                .vendorId(product.getVendor() != null ? product.getVendor().getId() : null)
                .vendorName(product.getVendor() != null ? product.getVendor().getContactName() : null)
                .vendorBusinessName(product.getVendor() != null ? product.getVendor().getBusinessName() : null)
                .build();
    }

    // Admin methods for AdminService compatibility
    
    /**
     * Get all products for admin management
     */
    public List<Product> getAllProductsForAdmin() {
        return productRepository.findAll();
    }

    /**
     * Update product status (activate/deactivate)
     */
    @Transactional
    public Product updateProductStatus(Long productId, Boolean isActive) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        product.setActive(isActive);
        return productRepository.save(product);
    }
}