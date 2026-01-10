package com.pets.petcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthMeasurementRequest {
    
    @NotNull(message = "Vet ID is required")
    private Long vetId;
    
    @NotBlank(message = "Measurement type is required")
    private String measurementType;
    
    @NotBlank(message = "Value is required")
    private String value;
    
    private String unit;
    
    private String notes;
    
    private LocalDate measurementDate; // Add measurement date field
    
    // Optional specific measurement fields
    private Double weight;
    private Double temperature;
    private Double heartRate;
    private String bloodPressure;
    private Double bloodSugar;
    private Double respiratoryRate;
}