package com.pets.petcare.dto;

import com.pets.petcare.entity.Appointment;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for the three-step booking flow
 */
public class BookingFlowRequest {

    // Step 1: Select Vet
    @NotNull(message = "Veterinarian ID is required")
    private Long veterinarianId;

    // Step 2: Choose Slot
    @NotNull(message = "Slot ID is required")
    private Long slotId;

    // Step 3: Confirm Booking
    @NotNull(message = "Pet ID is required")
    private Long petId;

    @NotNull(message = "Appointment type is required")
    private Appointment.AppointmentType type;

    private String reason; // Reason for visit
    private String specialRequests; // Any special requests or notes
    private Boolean emergencyBooking = false; // Is this an emergency booking?
    
    // Contact preferences
    private String preferredContactMethod; // EMAIL, SMS, PHONE
    private String alternateContactNumber;
    
    // Confirmation details
    private Boolean agreedToTerms = false;
    private Boolean confirmedPetDetails = false;
    private Boolean confirmedAppointmentDetails = false;

    // Default constructor
    public BookingFlowRequest() {}

    // Getters and Setters
    public Long getVeterinarianId() {
        return veterinarianId;
    }

    public void setVeterinarianId(Long veterinarianId) {
        this.veterinarianId = veterinarianId;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public Appointment.AppointmentType getType() {
        return type;
    }

    public void setType(Appointment.AppointmentType type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public Boolean getEmergencyBooking() {
        return emergencyBooking;
    }

    public void setEmergencyBooking(Boolean emergencyBooking) {
        this.emergencyBooking = emergencyBooking;
    }

    public String getPreferredContactMethod() {
        return preferredContactMethod;
    }

    public void setPreferredContactMethod(String preferredContactMethod) {
        this.preferredContactMethod = preferredContactMethod;
    }

    public String getAlternateContactNumber() {
        return alternateContactNumber;
    }

    public void setAlternateContactNumber(String alternateContactNumber) {
        this.alternateContactNumber = alternateContactNumber;
    }

    public Boolean getAgreedToTerms() {
        return agreedToTerms;
    }

    public void setAgreedToTerms(Boolean agreedToTerms) {
        this.agreedToTerms = agreedToTerms;
    }

    public Boolean getConfirmedPetDetails() {
        return confirmedPetDetails;
    }

    public void setConfirmedPetDetails(Boolean confirmedPetDetails) {
        this.confirmedPetDetails = confirmedPetDetails;
    }

    public Boolean getConfirmedAppointmentDetails() {
        return confirmedAppointmentDetails;
    }

    public void setConfirmedAppointmentDetails(Boolean confirmedAppointmentDetails) {
        this.confirmedAppointmentDetails = confirmedAppointmentDetails;
    }
}