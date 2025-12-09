package com.pets.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * HealthMeasurementRequest - Add health vitals
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthMeasurementRequest {
    
    @NotNull(message = "Measurement date is required")
    private LocalDate measurementDate;
    
    @Positive(message = "Weight must be positive")
    private Double weight; // in kg
    
    @DecimalMin(value = "35.0", message = "Temperature seems too low")
    @DecimalMax(value = "45.0", message = "Temperature seems too high")
    private Double temperature; // in Celsius
    
    @Size(max = 500)
    private String notes;
}
