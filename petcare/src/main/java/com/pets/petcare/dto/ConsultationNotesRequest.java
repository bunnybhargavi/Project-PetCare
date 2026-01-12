package com.pets.petcare.dto;

/**
 * DTO for adding consultation notes after teleconsultation
 */
public class ConsultationNotesRequest {
    private Long vetId;
    private String notes;
    private String diagnosis;
    private String prescription;

    // Constructors
    public ConsultationNotesRequest() {}

    public ConsultationNotesRequest(Long vetId, String notes, String diagnosis, String prescription) {
        this.vetId = vetId;
        this.notes = notes;
        this.diagnosis = diagnosis;
        this.prescription = prescription;
    }

    // Getters and Setters
    public Long getVetId() {
        return vetId;
    }

    public void setVetId(Long vetId) {
        this.vetId = vetId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getPrescription() {
        return prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }
}