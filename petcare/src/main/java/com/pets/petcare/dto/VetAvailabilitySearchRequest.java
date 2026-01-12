package com.pets.petcare.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VetAvailabilitySearchRequest {
    private String specialization;
    private String location;
    private Boolean teleconsultAvailable;
    private LocalDate date; // Search for vets with availability on a specific date
    private String appointmentType; // VIDEO or IN_CLINIC
}
