package com.pets.petcare.repository;

import com.pets.petcare.entity.Product;
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
    List<Product> findByActiveTrue();
    Page<Product> findByActiveTrue(Pageable pageable);

    // Find by category
    List<Product> findByCategoryAndActiveTrue(Product.Category category);
    Page<Product> findByCategoryAndActiveTrue(Product.Category category, Pageable pageable);

    // Search by title or description
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    // Find by price range
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                                   @Param("maxPrice") BigDecimal maxPrice, 
                                   Pageable pageable);

    // Find by category and price range
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category = :category AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByCategoryAndPriceRange(@Param("category") Product.Category category,
                                              @Param("minPrice") BigDecimal minPrice,
                                              @Param("maxPrice") BigDecimal maxPrice,
                                              Pageable pageable);

    // Find in stock products
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock > 0")
    Page<Product> findInStockProducts(Pageable pageable);

    // Find featured/top rated products
    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.rating DESC, p.reviewCount DESC")
    Page<Product> findFeaturedProducts(Pageable pageable);

    // Find by SKU
    Product findBySkuAndActiveTrue(String sku);

    // Admin methods for statistics
    long countByActive(Boolean active);
    long countByActiveTrue();
    long countByActiveFalse();
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.stock < :threshold")
    long countByStockLessThan(@Param("threshold") Integer threshold);
    
    // Vendor-specific methods
    @Query("SELECT COUNT(p) FROM Product p WHERE p.vendor.id = :vendorId AND p.active = true")
    Long countActiveByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT p FROM Product p WHERE p.vendor.id = :vendorId AND p.active = true")
    List<Product> findByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT p FROM Product p WHERE p.vendor.id = :vendorId AND p.active = true")
    Page<Product> findByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.vendor.id = :vendorId")
    List<Product> findAllByVendorId(@Param("vendorId") Long vendorId);
}