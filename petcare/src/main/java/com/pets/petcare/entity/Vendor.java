package com.pets.petcare.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Vendor Entity - Business vendors selling products
 */
@Entity
@Table(name = "vendors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "contact_name", nullable = false)
    private String contactName;

    @Column(unique = true, nullable = false)
    private String email;

    // Removed password field - using OTP authentication instead

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String city;
    private String state;

    @Column(name = "zip_code")
    private String zipCode;

    @Column(name = "business_license")
    private String businessLicense;

    @Column(name = "tax_id")
    private String taxId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VendorStatus status = VendorStatus.PENDING;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Product> products;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum VendorStatus {
        PENDING,
        APPROVED,
        SUSPENDED,
        REJECTED
    }

    // Helper methods
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (address != null) sb.append(address);
        if (city != null) sb.append(", ").append(city);
        if (state != null) sb.append(", ").append(state);
        if (zipCode != null) sb.append(" ").append(zipCode);
        return sb.toString();
    }

    public boolean isActive() {
        return status == VendorStatus.APPROVED;
    }
}