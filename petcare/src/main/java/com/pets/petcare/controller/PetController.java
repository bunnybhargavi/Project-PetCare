package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.service.PetService;
import com.pets.petcare.util.InputSanitizer;
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
    private final InputSanitizer inputSanitizer;
    
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
            
            // Sanitize input
            request.setName(inputSanitizer.sanitizeAndValidate(request.getName(), 100));
            request.setSpecies(inputSanitizer.sanitizeAndValidate(request.getSpecies(), 50));
            if (request.getBreed() != null) {
                request.setBreed(inputSanitizer.sanitizeAndValidate(request.getBreed(), 100));
            }
            if (request.getMicrochipId() != null) {
                request.setMicrochipId(inputSanitizer.sanitizeAndValidate(request.getMicrochipId(), 50));
            }
            if (request.getNotes() != null) {
                request.setNotes(inputSanitizer.sanitizeAndValidate(request.getNotes(), 1000));
            }
            
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
        // Sanitize input
        request.setName(inputSanitizer.sanitizeAndValidate(request.getName(), 100));
        request.setSpecies(inputSanitizer.sanitizeAndValidate(request.getSpecies(), 50));
        if (request.getBreed() != null) {
            request.setBreed(inputSanitizer.sanitizeAndValidate(request.getBreed(), 100));
        }
        if (request.getMicrochipId() != null) {
            request.setMicrochipId(inputSanitizer.sanitizeAndValidate(request.getMicrochipId(), 50));
        }
        if (request.getNotes() != null) {
            request.setNotes(inputSanitizer.sanitizeAndValidate(request.getNotes(), 1000));
        }
        
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
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "File is required", null));
        }
        
        // Validate file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "File size must not exceed 10MB", null));
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Only image files are allowed", null));
        }
        
        String photoUrl = petService.uploadPetPhoto(petId, file);
        return ResponseEntity.ok(new ApiResponse<>(true, "Photo uploaded successfully", photoUrl));
    }
    
    /**
     * Search pets
     * GET /api/pets/search?q=query
     */
    @GetMapping("/search")
    public ResponseEntity<List<PetResponse>> searchPets(@RequestParam String q) {
        // Sanitize search query
        String sanitizedQuery = inputSanitizer.sanitizeAndValidate(q, 100);
        List<PetResponse> pets = petService.searchPets(sanitizedQuery);
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
