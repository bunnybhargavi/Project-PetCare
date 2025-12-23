package com.pets.petcare.repository;

import com.pets.petcare.entity.Product;
import com.pets.petcare.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find active products
    List<Product> findByIsActiveTrueOrderByCreatedAtDesc();
    
    // Find products by category
    List<Product> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(Product.ProductCategory category);
    
    // Find products by vendor
    List<Product> findByVendorAndIsActiveTrueOrderByCreatedAtDesc(User vendor);
    
    // Find all products by vendor (including inactive)
    List<Product> findByVendorOrderByCreatedAtDesc(User vendor);
    
    // Search products by title or description
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Product> searchProducts(@Param("searchTerm") String searchTerm);
    
    // Find products by price range
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "p.price >= :minPrice AND p.price <= :maxPrice " +
           "ORDER BY p.createdAt DESC")
    List<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                                   @Param("maxPrice") BigDecimal maxPrice);
    
    // Advanced search with filters
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<Product> findProductsWithFilters(@Param("category") Product.ProductCategory category,
                                          @Param("minPrice") BigDecimal minPrice,
                                          @Param("maxPrice") BigDecimal maxPrice,
                                          @Param("searchTerm") String searchTerm,
                                          Pageable pageable);
    
    // Find products with low stock
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stockQuantity <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);
    
    // Count products by vendor
    long countByVendorAndIsActiveTrue(User vendor);
    
    // Admin statistics methods
    long countByIsActive(Boolean isActive);
    long countByStockQuantityLessThan(Integer threshold);
    long countByVendorId(Long vendorId);
    long countByVendorIdAndIsActive(Long vendorId, Boolean isActive);
    long countByVendorIdAndStockQuantityLessThan(Long vendorId, Integer threshold);
}