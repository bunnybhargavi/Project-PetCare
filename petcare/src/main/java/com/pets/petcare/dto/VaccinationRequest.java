package com.pets.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * VaccinationRequest - Add/Update vaccination record
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VaccinationRequest {
    
    @NotBlank(message = "Vaccine name is required")
    private String vaccineName;
    
    @NotNull(message = "Date given is required")
    private LocalDate dateGiven;
    
    private LocalDate nextDueDate;
    
    private String batchNumber;
    
    private String veterinarianName;
    
    @Size(max = 500)
    private String notes;
}
