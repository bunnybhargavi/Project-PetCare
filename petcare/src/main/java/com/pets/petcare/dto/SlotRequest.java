package com.pets.petcare.dto;

import com.pets.petcare.entity.AppointmentSlot;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SlotRequest {
    @NotNull(message = "Start time is required")
    @Future(message = "Slot must be scheduled for a future date")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
    
    @NotNull(message = "Slot mode is required")
    private AppointmentSlot.SlotType mode; // TELECONSULT, IN_CLINIC, BOTH
    
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 50, message = "Capacity cannot exceed 50")
    private Integer capacity = 1;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    @Size(max = 500, message = "Clinic address must not exceed 500 characters")
    private String clinicAddress;
    
    @DecimalMin(value = "0.00", message = "Consultation fee cannot be negative")
    @Digits(integer = 6, fraction = 2, message = "Consultation fee must have at most 6 digits and 2 decimal places")
    private Double consultationFee;
}