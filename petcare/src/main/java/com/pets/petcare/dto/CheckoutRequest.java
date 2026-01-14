package com.pets.petcare.dto;

import com.pets.petcare.entity.Order;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CheckoutRequest {
    // Shipping Information
    @NotBlank(message = "Shipping name is required")
    @Size(max = 255, message = "Shipping name must not exceed 255 characters")
    private String shippingName;
    
    @NotBlank(message = "Shipping address is required")
    @Size(max = 500, message = "Shipping address must not exceed 500 characters")
    private String shippingAddress;
    
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String shippingCity;
    
    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    private String shippingState;
    
    @NotBlank(message = "ZIP code is required")
    @Pattern(regexp = "^[0-9]{5,6}$", message = "ZIP code must be 5-6 digits")
    private String shippingZipCode;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String shippingPhone;
    
    // Payment Information
    @NotNull(message = "Payment method is required")
    private Order.PaymentMethod paymentMethod;
    
    // Optional fields
    private String paymentTransactionId;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}