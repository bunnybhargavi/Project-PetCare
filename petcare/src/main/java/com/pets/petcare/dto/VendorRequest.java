package com.pets.petcare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VendorRequest {
    
    @NotBlank(message = "Business name is required")
    @Size(max = 255, message = "Business name must not exceed 255 characters")
    private String businessName;
    
    @NotBlank(message = "Contact name is required")
    @Size(max = 255, message = "Contact name must not exceed 255 characters")
    private String contactName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    // OTP field for verification during registration completion
    // Note: Validation is handled in service layer to allow conditional validation
    private String otp;
    
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String businessLicense;
    private String taxId;
}