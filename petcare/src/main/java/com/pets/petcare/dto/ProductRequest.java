package com.pets.petcare.dto;

import com.pets.petcare.entity.Product;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Product.Category category;
    private List<String> images;
    private Boolean active = true;
    private BigDecimal discountPercentage = BigDecimal.ZERO;
    private String brand;
    private String sku;
}