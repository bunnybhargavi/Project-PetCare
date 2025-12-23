package com.pets.petcare.dto;

import com.pets.petcare.entity.Order;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private String shippingAddress;
    private String paymentId;
    private String trackingNumber;
    private List<OrderItemResponse> orderItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productTitle;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal price;
    }
}