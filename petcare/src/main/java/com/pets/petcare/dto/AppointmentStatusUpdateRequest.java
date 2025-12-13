package com.pets.petcare.dto;

import com.pets.petcare.entity.Appointment.AppointmentStatus;
import lombok.Data;

@Data
public class AppointmentStatusUpdateRequest {
    private AppointmentStatus status;
    private String notes;
    private String prescription;
}
