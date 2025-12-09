package com.pets.petcare.dto;

import jakarta.validation.constraints.*;

/**
 * RegisterRequest - Data sent from frontend during registration
 *
 * PURPOSE: Captures user registration information
 * Validates input before processing
 */
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email; // Must be valid email

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name; // 2-100 characters

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone; // Exactly 10 digits

    @NotBlank(message = "Role is required")
    private String role; // OWNER or VET

    // OTP field for registration completion
    @Size(min = 6, max = 6, message = "OTP must be 6 digits")
    private String otp; // 6-digit code (required for register/complete)

    // Vet-specific fields (optional for owners)
    private String clinicName;
    private String specialization;

    // Constructors
    public RegisterRequest() {
    }

    public RegisterRequest(String email, String name, String phone, String role, String otp,
            String clinicName, String specialization) {
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.otp = otp;
        this.clinicName = clinicName;
        this.specialization = specialization;
    }

    // Getters
    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public String getOtp() {
        return otp;
    }

    public String getClinicName() {
        return clinicName;
    }

    public String getSpecialization() {
        return specialization;
    }

    // Setters
    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
}
