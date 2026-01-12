package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * PetController - REST API for pet management
 * Base URL: /api/pets
 */
@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
@Slf4j
public class PetController {
    
    private final PetService petService;
    
    /**
     * Get all pets for current user
     * GET /api/pets
     */
    @GetMapping
    public ResponseEntity<List<PetResponse>> getMyPets(Authentication auth) {
        String email = auth.getName();
        List<PetResponse> pets = petService.getMyPets(email);
        return ResponseEntity.ok(pets);
    }
    
    /**
     * Get single pet by ID
     * GET /api/pets/{petId}
     */
    @GetMapping("/{petId}")
    public ResponseEntity<PetResponse> getPetById(@PathVariable Long petId) {
        PetResponse pet = petService.getPetById(petId);
        return ResponseEntity.ok(pet);
    }
    
    /**
     * Create new pet
     * POST /api/pets
     */
    @PostMapping
    public ResponseEntity<?> createPet(
            @Valid @RequestBody PetRequest request,
            Authentication auth
    ) {
        try {
            String email = auth.getName();
            PetResponse pet = petService.createPet(email, request);
            return ResponseEntity.ok(pet);
        } catch (Exception e) {
            log.error("Error creating pet: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to create pet: " + e.getMessage(), null));
        }
    }
    
    /**
     * Update pet
     * PUT /api/pets/{petId}
     */
    @PutMapping("/{petId}")
    public ResponseEntity<PetResponse> updatePet(
            @PathVariable Long petId,
            @Valid @RequestBody PetRequest request
    ) {
        PetResponse pet = petService.updatePet(petId, request);
        return ResponseEntity.ok(pet);
    }
    
    /**
     * Delete pet
     * DELETE /api/pets/{petId}
     */
    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deletePet(@PathVariable Long petId) {
        petService.deletePet(petId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Upload pet photo
     * POST /api/pets/{petId}/photo
     */
    @PostMapping("/{petId}/photo")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(
            @PathVariable Long petId,
            @RequestParam("file") MultipartFile file
    ) {
        String photoUrl = petService.uploadPetPhoto(petId, file);
        return ResponseEntity.ok(new ApiResponse<>(true, "Photo uploaded successfully", photoUrl));
    }
    
    /**
     * Search pets
     * GET /api/pets/search?q=query
     */
    @GetMapping("/search")
    public ResponseEntity<List<PetResponse>> searchPets(@RequestParam String q) {
        List<PetResponse> pets = petService.searchPets(q);
        return ResponseEntity.ok(pets);
    }
    
    /**
     * Increment walk streak
     * POST /api/pets/{petId}/walk
     */
    @PostMapping("/{petId}/walk")
    public ResponseEntity<ApiResponse<String>> incrementWalkStreak(@PathVariable Long petId) {
        petService.incrementWalkStreak(petId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Walk streak updated!", "Walk streak incremented"));
    }
}
