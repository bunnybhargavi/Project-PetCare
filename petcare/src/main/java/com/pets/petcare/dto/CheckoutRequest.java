package com.pets.petcare.dto;

import com.pets.petcare.entity.Order;
import lombok.Data;

@Data
public class CheckoutRequest {
    // Shipping Information
    private String shippingName;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingZipCode;
    private String shippingPhone;
    
    // Payment Information
    private Order.PaymentMethod paymentMethod;
    private String paymentTransactionId;
    
    private String notes;
}