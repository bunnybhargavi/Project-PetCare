package com.pets.petcare.dto;

import jakarta.validation.constraints.*;

/**
 * LoginRequest - Data sent during login
 * Requires only email for OTP-based authentication
 */
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // Constructors
    public LoginRequest() {
    }

    public LoginRequest(String email) {
        this.email = email;
    }

    // Getters
    public String getEmail() {
        return email;
    }

    // Setters
    public void setEmail(String email) {
        this.email = email;
    }
}
