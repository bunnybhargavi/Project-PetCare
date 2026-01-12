package com.pets.petcare.controller;

import com.pets.petcare.dto.ApiResponse;
import com.pets.petcare.dto.VetSearchRequest;
import com.pets.petcare.dto.VetSearchResponse;
import com.pets.petcare.service.VetSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller for veterinarian search and discovery
 */
@RestController
@RequestMapping("/api/vets")
@CrossOrigin(origins = "*")
public class VetSearchController {

    @Autowired
    private VetSearchService vetSearchService;

    /**
     * Advanced search for veterinarians
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<VetSearchResponse>>> searchVeterinarians(
            @RequestBody VetSearchRequest request) {
        try {
            List<VetSearchResponse> results = vetSearchService.searchVeterinarians(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Search completed successfully", results));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Search failed: " + e.getMessage(), null));
        }
    }

    /**
     * Find veterinarians by specialization
     */
    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<VetSearchResponse>>> findBySpecialization(
            @PathVariable String specialization) {
        try {
            List<VetSearchResponse> results = vetSearchService.findBySpecialization(specialization);
            return ResponseEntity.ok(new ApiResponse<>(true, "Vets found by specialization", results));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Search failed: " + e.getMessage(), null));
        }
    }

    /**
     * Find veterinarians by location
     */
    @GetMapping("/location")
    public ResponseEntity<ApiResponse<List<VetSearchResponse>>> findByLocation(
            @RequestParam String location) {
        try {
            List<VetSearchResponse> results = vetSearchService.findByLocation(location);
            return ResponseEntity.ok(new ApiResponse<>(true, "Vets found by location", results));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Search failed: " + e.getMessage(), null));
        }
    }

    /**
     * Find veterinarians with availability on specific date
     */
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VetSearchResponse>>> findWithAvailability(
            @RequestParam String date) {
        try {
            LocalDate searchDate = LocalDate.parse(date);
            List<VetSearchResponse> results = vetSearchService.findWithAvailabilityOnDate(searchDate);
            return ResponseEntity.ok(new ApiResponse<>(true, "Vets with availability found", results));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Search failed: " + e.getMessage(), null));
        }
    }

    /**
     * Find veterinarians available for teleconsult
     */
    @GetMapping("/teleconsult")
    public ResponseEntity<ApiResponse<List<VetSearchResponse>>> findAvailableForTeleconsult() {
        try {
            List<VetSearchResponse> results = vetSearchService.findAvailableForTeleconsult();
            return ResponseEntity.ok(new ApiResponse<>(true, "Teleconsult vets found", results));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Search failed: " + e.getMessage(), null));
        }
    }

    /**
     * Get detailed vet information with available slots
     */
    @GetMapping("/{vetId}/details")
    public ResponseEntity<ApiResponse<VetSearchResponse>> getVetDetails(@PathVariable Long vetId) {
        try {
            VetSearchResponse result = vetSearchService.getVetWithSlots(vetId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Vet details retrieved", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to get vet details: " + e.getMessage(), null));
        }
    }

    /**
     * Get available slots for a specific vet on a specific date
     */
    @GetMapping("/{vetId}/slots")
    public ResponseEntity<ApiResponse<List<VetSearchResponse.AvailableSlotInfo>>> getVetSlots(
            @PathVariable Long vetId,
            @RequestParam String date) {
        try {
            LocalDate searchDate = LocalDate.parse(date);
            List<VetSearchResponse.AvailableSlotInfo> slots = vetSearchService.getVetSlotsForDate(vetId, searchDate);
            return ResponseEntity.ok(new ApiResponse<>(true, "Slots retrieved successfully", slots));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to get slots: " + e.getMessage(), null));
        }
    }
}