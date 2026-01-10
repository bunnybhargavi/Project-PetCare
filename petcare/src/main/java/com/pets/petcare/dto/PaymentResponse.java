package com.pets.petcare.dto;

import com.pets.petcare.entity.Payment;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    
    private Long id;
    private Long orderId;
    private String paypalPaymentId;
    private String paypalPayerId;
    private BigDecimal amount;
    private String currency;
    private Payment.PaymentStatus status;
    private String paymentMethod;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // PayPal specific fields for frontend
    private String paypalClientId;
    private String approvalUrl;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    public static PaymentResponse fromEntity(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .paypalPaymentId(payment.getPaypalPaymentId())
                .paypalPayerId(payment.getPaypalPayerId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .orderNumber(payment.getOrder().getOrderNumber())
                .customerName(payment.getOrder().getShippingName())
                .customerEmail(payment.getOrder().getUser().getEmail())
                .customerPhone(payment.getOrder().getShippingPhone())
                .build();
    }
}