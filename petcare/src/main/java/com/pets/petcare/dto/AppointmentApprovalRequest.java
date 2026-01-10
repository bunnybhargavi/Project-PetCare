package com.pets.petcare.dto;

/**
 * DTO for appointment approval requests
 */
public class AppointmentApprovalRequest {
    private String vetNotes;

    public AppointmentApprovalRequest() {}

    public AppointmentApprovalRequest(String vetNotes) {
        this.vetNotes = vetNotes;
    }

    public String getVetNotes() {
        return vetNotes;
    }

    public void setVetNotes(String vetNotes) {
        this.vetNotes = vetNotes;
    }
}