package com.pets.petcare.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationRequest {
    
    @NotBlank(message = "PayPal payment ID is required")
    private String paypalPaymentId;
    
    @NotBlank(message = "PayPal payer ID is required")
    private String payerId;
}