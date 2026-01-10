package com.pets.petcare.dto;

import com.pets.petcare.entity.Vendor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VendorResponse {
    private Long id;
    private String businessName;
    private String contactName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String businessLicense;
    private String taxId;
    private Vendor.VendorStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String fullAddress;
    private boolean active;
    
    // Statistics (populated by service when needed)
    private Long totalProducts;
    private Long pendingOrders;
    private Long completedOrders;
    private Double totalSales;
    
    public static VendorResponse fromEntity(Vendor vendor) {
        VendorResponse response = new VendorResponse();
        response.setId(vendor.getId());
        response.setBusinessName(vendor.getBusinessName());
        response.setContactName(vendor.getContactName());
        response.setEmail(vendor.getEmail());
        response.setPhone(vendor.getPhone());
        response.setAddress(vendor.getAddress());
        response.setCity(vendor.getCity());
        response.setState(vendor.getState());
        response.setZipCode(vendor.getZipCode());
        response.setBusinessLicense(vendor.getBusinessLicense());
        response.setTaxId(vendor.getTaxId());
        response.setStatus(vendor.getStatus());
        response.setCreatedAt(vendor.getCreatedAt());
        response.setUpdatedAt(vendor.getUpdatedAt());
        response.setFullAddress(vendor.getFullAddress());
        response.setActive(vendor.isActive());
        return response;
    }
}