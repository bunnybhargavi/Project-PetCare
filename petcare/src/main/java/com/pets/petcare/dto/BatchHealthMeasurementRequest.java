package com.pets.petcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchHealthMeasurementRequest {
    
    @NotNull(message = "Vet ID is required")
    private Long vetId;
    
    @Valid
    @NotNull(message = "Measurements list is required")
    private List<SingleMeasurement> measurements;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SingleMeasurement {
        private String measurementType;
        private String value;
        private String unit;
        private String notes;
        
        // Specific measurement fields
        private Double weight;
        private Double temperature;
        private Double heartRate;
        private String bloodPressure;
        private Double bloodSugar;
        private Double respiratoryRate;
    }
}