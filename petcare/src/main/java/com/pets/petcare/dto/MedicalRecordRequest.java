package com.pets.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * MedicalRecordRequest - Add/Update medical record
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordRequest {
    
    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;
    
    @NotBlank(message = "Record type is required")
    private String recordType; // CHECKUP, VACCINATION, SURGERY, EMERGENCY, TREATMENT, LAB_TEST
    
    private String vetName;
    
    @Size(max = 500)
    private String diagnosis;
    
    @Size(max = 1000)
    private String treatment;
    
    @Size(max = 1000)
    private String prescriptions;
    
    @Size(max = 1000)
    private String notes;
}