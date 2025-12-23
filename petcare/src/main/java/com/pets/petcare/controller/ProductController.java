package com.pets.petcare.controller;

import com.pets.petcare.dto.ProductRequest;
import com.pets.petcare.dto.ProductResponse;
import com.pets.petcare.entity.Product;
import com.pets.petcare.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProductController {
    
    private final ProductService productService;
    
    /**
     * Create a new product (Vendor only)
     */
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {
        
        log.info("Creating product: {}", request.getTitle());
        ProductResponse response = productService.createProduct(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Get all active products
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        log.info("Fetching all active products");
        List<ProductResponse> products = productService.getAllActiveProducts();
        return ResponseEntity.ok(products);
    }
    
    /**
     * Search products with filters
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam(required = false) Product.ProductCategory category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching products with filters");
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.searchProducts(
                category, minPrice, maxPrice, searchTerm, pageable);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get products by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(
            @PathVariable Product.ProductCategory category) {
        
        log.info("Fetching products by category: {}", category);
        List<ProductResponse> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get product by ID
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long productId) {
        log.info("Fetching product by ID: {}", productId);
        ProductResponse product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }
    
    /**
     * Get products by vendor (Vendor only)
     */
    @GetMapping("/vendor/my-products")
    public ResponseEntity<List<ProductResponse>> getMyProducts(Authentication authentication) {
        log.info("Fetching products for vendor: {}", authentication.getName());
        List<ProductResponse> products = productService.getProductsByVendor(authentication.getName());
        return ResponseEntity.ok(products);
    }
    
    /**
     * Update product (Vendor only)
     */
    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {
        
        log.info("Updating product ID: {}", productId);
        ProductResponse response = productService.updateProduct(productId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete product (Vendor only)
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId,
            Authentication authentication) {
        
        log.info("Deleting product ID: {}", productId);
        productService.deleteProduct(productId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Update stock quantity (Vendor only)
     */
    @PatchMapping("/{productId}/stock")
    public ResponseEntity<Void> updateStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        
        log.info("Updating stock for product ID: {} to quantity: {}", productId, quantity);
        productService.updateStock(productId, quantity);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get vendor statistics (Vendor only)
     */
    @GetMapping("/vendor/stats")
    public ResponseEntity<ProductService.VendorStats> getVendorStats(Authentication authentication) {
        log.info("Fetching vendor statistics for: {}", authentication.getName());
        ProductService.VendorStats stats = productService.getVendorStats(authentication.getName());
        return ResponseEntity.ok(stats);
    }
}