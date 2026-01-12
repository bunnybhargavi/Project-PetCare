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
    private String orderNumber;
    private Order.OrderStatus status;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private Integer totalItems;
    
    // Shipping Information
    private String shippingName;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingZipCode;
    private String shippingPhone;
    
    // Payment Information
    private Order.PaymentMethod paymentMethod;
    private Order.PaymentStatus paymentStatus;
    private String paymentTransactionId;
    
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private ProductResponse product;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}