package com.pets.petcare.dto;

import com.pets.petcare.entity.Appointment.AppointmentType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    @NotNull(message = "Pet ID is required")
    private Long petId;
    
    @NotNull(message = "Veterinarian ID is required")
    private Long veterinarianId;
    
    // Slot ID is optional - can book without specific slot
    private Long slotId;
    
    // DateTime is optional when booking with slot (slot time will be used)
    // Only required for direct booking without slot
    private LocalDateTime dateTime;
    
    @NotNull(message = "Appointment type is required")
    private AppointmentType type;
    
    // Make reason optional but validate length if provided
    @Size(min = 5, max = 500, message = "Reason must be between 5 and 500 characters when provided")
    private String reason;
    
    // Helper method to validate the request
    public boolean isValid() {
        // Must have either a valid slot ID OR a valid future dateTime
        boolean hasValidSlot = slotId != null && slotId > 0;
        boolean hasValidDateTime = dateTime != null && dateTime.isAfter(LocalDateTime.now());
        
        System.out.println("=== Appointment Request Validation ===");
        System.out.println("slotId: " + slotId);
        System.out.println("dateTime: " + dateTime);
        System.out.println("hasValidSlot: " + hasValidSlot);
        System.out.println("hasValidDateTime: " + hasValidDateTime);
        System.out.println("petId: " + petId);
        System.out.println("veterinarianId: " + veterinarianId);
        System.out.println("type: " + type);
        
        if (!hasValidSlot && !hasValidDateTime) {
            System.out.println("VALIDATION FAILED: No valid slot or dateTime");
            return false;
        }
        
        // If reason is provided, it must meet length requirements
        if (reason != null && !reason.trim().isEmpty() && (reason.trim().length() < 5 || reason.trim().length() > 500)) {
            System.out.println("VALIDATION FAILED: Invalid reason length");
            return false;
        }
        
        System.out.println("VALIDATION PASSED");
        return true;
    }
}
