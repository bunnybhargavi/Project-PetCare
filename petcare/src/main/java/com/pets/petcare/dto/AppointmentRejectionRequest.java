package com.pets.petcare.dto;

/**
 * DTO for appointment rejection requests
 */
public class AppointmentRejectionRequest {
    private String rejectionReason;

    public AppointmentRejectionRequest() {}

    public AppointmentRejectionRequest(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}