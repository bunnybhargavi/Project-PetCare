package com.pets.petcare.dto;

import com.pets.petcare.entity.AppointmentSlot;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SlotResponse {
    private Long id;
    private Long veterinarianId;
    private String veterinarianName;
    private String clinicName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentSlot.SlotStatus status;
    private AppointmentSlot.SlotType mode;
    private Integer capacity;
    private Integer bookedCount;
    private Integer availableSpots;
}
