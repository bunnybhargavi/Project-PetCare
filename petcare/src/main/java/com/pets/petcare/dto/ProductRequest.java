package com.pets.petcare.dto;

import com.pets.petcare.entity.Product;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank(message = "Product title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Price must have at most 8 digits and 2 decimal places")
    private BigDecimal price;
    
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock cannot be negative")
    @Max(value = 999999, message = "Stock cannot exceed 999999")
    private Integer stock;
    
    @NotNull(message = "Category is required")
    private Product.Category category;
    
    private List<String> images;
    
    private Boolean active = true;
    
    @DecimalMin(value = "0.00", message = "Discount percentage cannot be negative")
    @DecimalMax(value = "100.00", message = "Discount percentage cannot exceed 100%")
    @Digits(integer = 3, fraction = 2, message = "Discount percentage must have at most 3 digits and 2 decimal places")
    private BigDecimal discountPercentage = BigDecimal.ZERO;
    
    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;
    
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;
}