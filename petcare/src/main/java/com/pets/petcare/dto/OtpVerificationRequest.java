package com.pets.petcare.dto;

import jakarta.validation.constraints.*;

/**
 * OtpVerificationRequest - User submits OTP for verification
 */
public class OtpVerificationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP is required")
    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    private String otp; // 6-digit code

    // Constructors
    public OtpVerificationRequest() {
    }

    public OtpVerificationRequest(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }

    // Getters
    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    // Setters
    public void setEmail(String email) {
        this.email = email;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
