package com.pets.petcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for vet search results with availability information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VetSearchResponse {
    private Long id;
    private String name;
    private String clinicName;
    private String specialization;
    private String clinicAddress;
    private String profilePhoto;
    private Integer yearsOfExperience;
    private String qualifications;
    private String bio;
    private String workingHours;
    private Boolean availableForTeleconsult;
    private Double consultationFee;
    private Double rating; // Average rating (to be implemented)
    private Integer totalReviews; // Total number of reviews (to be implemented)
    private Double distanceKm; // Distance from search location (to be implemented)
    private List<AvailableSlotInfo> availableSlots;
    private LocalDateTime earliestAvailability;
    private Integer totalAvailableSlots;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailableSlotInfo {
        private Long slotId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String mode; // TELECONSULT, IN_CLINIC, BOTH
        private Integer availableCapacity; // capacity - bookedCount
        private Integer totalCapacity;
    }
}