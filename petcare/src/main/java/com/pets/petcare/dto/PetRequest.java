package com.pets.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * PetRequest - Data for creating/updating a pet
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetRequest {
    
    @NotBlank(message = "Pet name is required")
    @Size(min = 1, max = 100)
    private String name;
    
    @NotBlank(message = "Species is required")
    private String species; // Dog, Cat, Bird, Rabbit, etc.
    
    private String breed;
    
    private LocalDate dateOfBirth;
    
    @NotNull(message = "Gender is required")
    private String gender; // MALE, FEMALE, UNKNOWN
    
    private String microchipId;
    
    @Size(max = 1000)
    private String notes;
}
