package com.pets.petcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for booking confirmation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmationResponse {
    private Long appointmentId;
    private String referenceNumber;
    private String status;
    private LocalDateTime appointmentDateTime;
    private String appointmentType;
    
    // Vet details
    private String vetName;
    private String clinicName;
    private String clinicAddress;
    private String vetPhone;
    private String vetEmail;
    
    // Pet details
    private String petName;
    private String petSpecies;
    
    // Meeting details
    private String meetingLink; // For video consultations
    private String meetingInstructions;
    
    // Clinic details (for in-clinic appointments)
    private String clinicDirections;
    private String parkingInformation;
    private String clinicInstructions;
    
    // Preparation instructions
    private String preparationInstructions;
    private String documentsTobring;
    
    // Cancellation policy
    private String cancellationPolicy;
    private LocalDateTime cancellationDeadline;
    
    // Contact information
    private String supportPhone;
    private String supportEmail;
    
    // Reminder settings
    private Boolean reminderEnabled;
    private String reminderSchedule;
}