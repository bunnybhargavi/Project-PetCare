package com.pets.petcare.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * VaccinationResponse - Vaccination data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationResponse {
    
    private Long id;
    private Long petId;
    private String petName;
    private String vaccineName;
    private LocalDate dateGiven;
    private LocalDate nextDueDate;
    private String batchNumber;
    private String veterinarianName;
    private String notes;
    private Boolean isOverdue; // Calculated
    private Integer daysUntilDue; // Calculated
    private LocalDateTime createdAt;
}