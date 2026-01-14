package com.pets.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VendorLoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    // OTP field for login completion - optional for initiate step, required for complete step
    // Validation will be handled programmatically in the service layer
    private String otp;
    
    // Helper method to validate OTP when required
    public boolean isValidOtp() {
        return otp != null && otp.matches("^[0-9]{6}$");
    }
}