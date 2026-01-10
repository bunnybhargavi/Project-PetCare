package com.pets.petcare.dto;

import com.pets.petcare.entity.Order;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VendorOrderResponse {
    private Long orderId;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private Order.OrderStatus orderStatus;
    private Order.PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<VendorOrderItemResponse> items;
    
    @Data
    public static class VendorOrderItemResponse {
        private Long orderItemId;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}