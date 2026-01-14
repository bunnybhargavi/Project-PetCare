package com.pets.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PayPalPaymentRequest {
    @NotBlank(message = "PayPal payment ID is required")
    private String paymentId;
    
    @NotBlank(message = "Payer ID is required")
    private String payerId;
    
    @NotNull(message = "Order ID is required")
    private Long orderId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Amount must have at most 8 digits and 2 decimal places")
    private BigDecimal amount;
    
    @Size(max = 3, message = "Currency code must not exceed 3 characters")
    private String currency = "INR";
}