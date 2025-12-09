package com.pets.petcare.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_tokens")
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email; // The user's email for whom the OTP was generated

    @Column(nullable = false)
    private String otp; // The OTP code

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OtpType type; // REGISTRATION or LOGIN

    @Column(nullable = false)
    private LocalDateTime expiryTime; // When the OTP expires

    @Column(nullable = false)
    private Boolean isUsed = false; // Track if OTP has been used

    @Column(nullable = false)
    private LocalDateTime createdAt; // Timestamp when OTP was created

    // Constructors
    public OtpToken() {
    }

    public OtpToken(String email, String otp, OtpType type, LocalDateTime expiryTime,
            Boolean isUsed, LocalDateTime createdAt) {
        this.email = email;
        this.otp = otp;
        this.type = type;
        this.expiryTime = expiryTime;
        this.isUsed = isUsed;
        this.createdAt = createdAt;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getOtp() {
        return otp;
    }

    public OtpType getType() {
        return type;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public Boolean getIsUsed() {
        return isUsed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public void setType(OtpType type) {
        this.type = type;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public void setIsUsed(Boolean isUsed) {
        this.isUsed = isUsed;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }

    /**
     * Enum for OTP type
     * REGISTRATION: OTP for user registration
     * LOGIN: OTP for user login
     */
    public enum OtpType {
        REGISTRATION,
        LOGIN
    }
}
