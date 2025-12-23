package com.pets.petcare.service;

import com.pets.petcare.dto.ProductRequest;
import com.pets.petcare.dto.ProductResponse;
import com.pets.petcare.entity.Product;
import com.pets.petcare.entity.User;
import com.pets.petcare.exception.ResourceNotFoundException;
import com.pets.petcare.repository.ProductRepository;
import com.pets.petcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    /**
     * Create a new product
     */
    public ProductResponse createProduct(ProductRequest request, String vendorEmail) {
        log.info("Creating product: {} by vendor: {}", request.getTitle(), vendorEmail);
        
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        
        Product product = new Product();
        product.setVendor(vendor);
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setTags(request.getTags());
        product.setBrand(request.getBrand());
        product.setIsActive(true);
        
        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getId());
        
        return convertToResponse(savedProduct);
    }
    
    /**
     * Get all active products
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllActiveProducts() {
        log.info("Fetching all active products");
        List<Product> products = productRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        return products.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get products by category
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Product.ProductCategory category) {
        log.info("Fetching products by category: {}", category);
        List<Product> products = productRepository.findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(category);
        return products.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Search products with filters
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(Product.ProductCategory category,
                                                BigDecimal minPrice,
                                                BigDecimal maxPrice,
                                                String searchTerm,
                                                Pageable pageable) {
        log.info("Searching products with filters - category: {}, minPrice: {}, maxPrice: {}, searchTerm: {}", 
                category, minPrice, maxPrice, searchTerm);
        
        Page<Product> products = productRepository.findProductsWithFilters(
                category, minPrice, maxPrice, searchTerm, pageable);
        
        return products.map(this::convertToResponse);
    }
    
    /**
     * Get product by ID
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long productId) {
        log.info("Fetching product by ID: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        return convertToResponse(product);
    }
    
    /**
     * Get products by vendor
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByVendor(String vendorEmail) {
        log.info("Fetching products by vendor: {}", vendorEmail);
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        
        List<Product> products = productRepository.findByVendorOrderByCreatedAtDesc(vendor);
        return products.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Update product
     */
    public ProductResponse updateProduct(Long productId, ProductRequest request, String vendorEmail) {
        log.info("Updating product ID: {} by vendor: {}", productId, vendorEmail);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        // Verify vendor ownership
        if (!product.getVendor().getEmail().equals(vendorEmail)) {
            throw new RuntimeException("You can only update your own products");
        }
        
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setTags(request.getTags());
        product.setBrand(request.getBrand());
        
        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully: {}", updatedProduct.getId());
        
        return convertToResponse(updatedProduct);
    }
    
    /**
     * Delete product (soft delete by setting isActive to false)
     */
    public void deleteProduct(Long productId, String vendorEmail) {
        log.info("Deleting product ID: {} by vendor: {}", productId, vendorEmail);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        // Verify vendor ownership
        if (!product.getVendor().getEmail().equals(vendorEmail)) {
            throw new RuntimeException("You can only delete your own products");
        }
        
        product.setIsActive(false);
        productRepository.save(product);
        log.info("Product soft deleted successfully: {}", productId);
    }
    
    /**
     * Update stock quantity
     */
    public void updateStock(Long productId, Integer quantity) {
        log.info("Updating stock for product ID: {} to quantity: {}", productId, quantity);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        product.setStockQuantity(quantity);
        productRepository.save(product);
        log.info("Stock updated successfully for product: {}", productId);
    }
    
    /**
     * Reduce stock quantity (for orders)
     */
    public void reduceStock(Long productId, Integer quantity) {
        log.info("Reducing stock for product ID: {} by quantity: {}", productId, quantity);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity() + ", Required: " + quantity);
        }
        
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
        log.info("Stock reduced successfully for product: {}", productId);
    }
    
    /**
     * Get vendor statistics
     */
    @Transactional(readOnly = true)
    public VendorStats getVendorStats(String vendorEmail) {
        log.info("Fetching vendor statistics for: {}", vendorEmail);
        
        User vendor = userRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        
        long totalProducts = productRepository.countByVendorAndIsActiveTrue(vendor);
        List<Product> lowStockProducts = productRepository.findLowStockProducts(5);
        
        return VendorStats.builder()
                .totalProducts(totalProducts)
                .lowStockCount(lowStockProducts.size())
                .build();
    }
    
    /**
     * Convert Product entity to ProductResponse DTO
     */
    private ProductResponse convertToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .isActive(product.getIsActive())
                .tags(product.getTags())
                .brand(product.getBrand())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .vendorName(product.getVendor().getName())
                .vendorId(product.getVendor().getId())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
    
    /**
     * Get all products for admin (including inactive)
     */
    @Transactional(readOnly = true)
    public List<Product> getAllProductsForAdmin() {
        log.info("Fetching all products for admin");
        return productRepository.findAll();
    }
    
    /**
     * Update product status (admin only)
     */
    public Product updateProductStatus(Long productId, Boolean isActive) {
        log.info("Updating product status - ID: {}, isActive: {}", productId, isActive);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        
        product.setIsActive(isActive);
        return productRepository.save(product);
    }
    
    /**
     * Vendor Statistics DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class VendorStats {
        private long totalProducts;
        private long lowStockCount;
    }
}