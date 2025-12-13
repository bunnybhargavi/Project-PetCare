package com.pets.petcare.dto;

import com.pets.petcare.entity.AppointmentSlot.SlotType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SlotRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private SlotType supportedType;
    private Integer capacity; // For future: how many appointments this slot can handle
}
