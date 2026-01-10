package com.pets.petcare.dto;

import com.pets.petcare.entity.Product;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private Integer stock;
    private Product.Category category;
    private String categoryDisplayName;
    private List<String> images;
    private Boolean active;
    private BigDecimal discountPercentage;
    private String brand;
    private String sku;
    private Double rating;
    private Integer reviewCount;
    private Boolean inStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Vendor information
    private Long vendorId;
    private String vendorName;
    private String vendorBusinessName;
    
    public static ProductResponse fromEntity(Product product) {
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
}