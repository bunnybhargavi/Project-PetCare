package com.pets.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class VetSearchRequest {
    @Size(max = 100, message = "Specialization must not exceed 100 characters")
    private String specialization;
    
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;
    
    private Boolean teleconsultOnly = false;
    
    private Boolean hasAvailability = false;
    
    @Future(message = "Availability date must be in the future")
    private LocalDate availabilityDate;
    
    @Pattern(regexp = "^(distance|rating|availability|price|experience)$", 
             message = "Sort by must be one of: distance, rating, availability, price, experience")
    private String sortBy = "rating";
    
    @DecimalMin(value = "0.0", message = "Max distance cannot be negative")
    @DecimalMax(value = "1000.0", message = "Max distance cannot exceed 1000 km")
    private Double maxDistance;
    
    @DecimalMin(value = "0.0", message = "Min rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Min rating cannot exceed 5.0")
    private Double minRating;
    
    @DecimalMin(value = "0.00", message = "Max price cannot be negative")
    @Digits(integer = 6, fraction = 2, message = "Max price must have at most 6 digits and 2 decimal places")
    private Double maxPrice;
    
    @Min(value = 0, message = "Years of experience cannot be negative")
    @Max(value = 50, message = "Years of experience cannot exceed 50")
    private Integer minYearsOfExperience;
}