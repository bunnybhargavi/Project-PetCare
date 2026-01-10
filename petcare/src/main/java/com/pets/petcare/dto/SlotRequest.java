package com.pets.petcare.dto;

import com.pets.petcare.entity.AppointmentSlot.SlotType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SlotRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private SlotType mode;
    private Integer capacity = 1; // How many appointments this slot can handle
    private LocalDateTime date; // For creating multiple slots on a specific date
    private String timeSlots; // Comma-separated time slots (e.g., "09:00,10:00,11:00")
}
