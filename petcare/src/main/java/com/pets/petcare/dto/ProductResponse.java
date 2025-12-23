package com.pets.petcare.dto;

import com.pets.petcare.entity.Product;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private Product.ProductCategory category;
    private String imageUrl;
    private Boolean isActive;
    private String tags;
    private String brand;
    private Double rating;
    private Integer reviewCount;
    private String vendorName;
    private Long vendorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}