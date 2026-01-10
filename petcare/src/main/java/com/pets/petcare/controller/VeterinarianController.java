package com.pets.petcare.controller;

import com.pets.petcare.dto.VetSearchRequest;
import com.pets.petcare.entity.Veterinarian;
import com.pets.petcare.service.VeterinarianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veterinarians")
@CrossOrigin(origins = "*")
public class VeterinarianController {

    @Autowired
    private VeterinarianService veterinarianService;

    /**
     * Get all veterinarians
     */
    @GetMapping
    public ResponseEntity<List<Veterinarian>> getAllVeterinarians() {
        return ResponseEntity.ok(veterinarianService.findAll());
    }

    /**
     * Get veterinarian by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Veterinarian> getVeterinarianById(@PathVariable Long id) {
        return ResponseEntity.ok(veterinarianService.getVeterinarianById(id));
    }

    /**
     * Search veterinarians by specialty, location, and teleconsult availability
     */
    @PostMapping("/search")
    public ResponseEntity<List<Veterinarian>> searchVeterinarians(@RequestBody VetSearchRequest request) {
        return ResponseEntity.ok(veterinarianService.searchVeterinarians(request));
    }

    /**
     * Find vets by specialization
     */
    @GetMapping("/specialty/{specialization}")
    public ResponseEntity<List<Veterinarian>> findBySpecialization(@PathVariable String specialization) {
        return ResponseEntity.ok(veterinarianService.findBySpecialization(specialization));
    }

    /**
     * Find vets by location
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<Veterinarian>> findByLocation(@PathVariable String location) {
        return ResponseEntity.ok(veterinarianService.findByLocation(location));
    }

    /**
     * Find vets available for teleconsult
     */
    @GetMapping("/teleconsult")
    public ResponseEntity<List<Veterinarian>> findTeleconsultVets() {
        return ResponseEntity.ok(veterinarianService.findTeleconsultVets());
    }

    /**
     * Search vets with available slots
     */
    @PostMapping("/search-with-availability")
    public ResponseEntity<List<com.pets.petcare.dto.VetWithSlotsResponse>> searchVetsWithAvailability(
            @RequestBody com.pets.petcare.dto.VetAvailabilitySearchRequest request) {
        return ResponseEntity.ok(veterinarianService.searchVetsWithAvailability(request));
    }
}
