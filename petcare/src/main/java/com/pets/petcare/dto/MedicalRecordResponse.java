package com.pets.petcare.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MedicalRecordResponse - Medical record data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponse {
    
    private Long id;
    private Long petId;
    private String petName;
    private LocalDate visitDate;
    private String recordType;
    private String vetName;
    private String diagnosis;
    private String treatment;
    private String prescriptions;
    private String attachmentUrl;
    private String notes;
    private LocalDateTime createdAt;
}
