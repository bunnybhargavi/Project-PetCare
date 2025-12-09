package com.pets.petcare.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * HealthMeasurementResponse - Health measurement data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthMeasurementResponse {
    
    private Long id;
    private Long petId;
    private String petName;
    private LocalDate measurementDate;
    private Double weight;
    private Double temperature;
    private String notes;
    private LocalDateTime createdAt;
}
