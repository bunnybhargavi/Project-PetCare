package com.pets.petcare.dto;

import com.pets.petcare.entity.Appointment.AppointmentType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    private Long petId;
    private Long veterinarianId;
    private Long slotId;
    private LocalDateTime dateTime;
    private AppointmentType type;
    private String reason;
}
