package com.pets.petcare.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VetSearchRequest {
    private String specialization;
    private String location;
    private Boolean teleconsultOnly; // Renamed for clarity
    private Boolean hasAvailability; // Filter by availability
    private LocalDate availabilityDate; // Specific date for availability check
    private String sortBy; // "distance", "rating", "availability", "price"
    private String sortOrder; // "asc", "desc"
    private Double maxDistance; // Maximum distance in kilometers
    private Double minRating; // Minimum rating filter
    private Double maxPrice; // Maximum consultation fee
    private Integer yearsOfExperience; // Minimum years of experience
}
