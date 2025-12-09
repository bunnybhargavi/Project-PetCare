package com.pets.petcare.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PetResponse - Pet data returned to frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PetResponse {
    
    private Long id;
    private Long ownerId;
    private String name;
    private String species;
    private String breed;
    private LocalDate dateOfBirth;
    private String gender;
    private String photo;
    private String microchipId;
    private String notes;
    
    // UI Helper fields
    private String healthStatus; // HEALTHY, DUE_SOON, OVERDUE, UNDER_TREATMENT
    private Integer walkStreak;
    private Integer age; // Calculated age in years
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
