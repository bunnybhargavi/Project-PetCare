package com.pets.petcare.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartResponse {
    
    private Long id;
    private Long userId;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private int itemCount;
    
    @Data
    @Builder
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productTitle;
        private BigDecimal productPrice;
        private String productImageUrl;
        private Integer quantity;
        private Integer stockQuantity;
    }
}