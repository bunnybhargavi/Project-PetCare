package com.pets.petcare.service;

import com.pets.petcare.dto.*;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * PetService - Complete pet management service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PetService {
    
    private final PetRepository petRepository;
    private final PetOwnerRepository petOwnerRepository;
    private final UserRepository userRepository;
    private final VaccinationRepository vaccinationRepository;
    
    private static final String UPLOAD_DIR = "uploads/pets/";
    
    /**
     * Get all pets for current user
     */
    public List<PetResponse> getMyPets(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        PetOwner owner = petOwnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Pet owner profile not found"));
        
        List<Pet> pets = petRepository.findByOwner(owner);
        
        return pets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get single pet by ID
     */
    public PetResponse getPetById(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        return mapToResponse(pet);
    }
    
    /**
     * Create new pet
     */
    @Transactional
    public PetResponse createPet(String email, PetRequest request) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get or create PetOwner profile
            PetOwner owner = petOwnerRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        log.info("Creating PetOwner profile for user: {}", email);
                        PetOwner newOwner = new PetOwner();
                        newOwner.setUser(user);
                        return petOwnerRepository.save(newOwner);
                    });
            
            Pet pet = new Pet();
            pet.setOwner(owner);
            pet.setName(request.getName());
            pet.setSpecies(request.getSpecies());
            pet.setBreed(request.getBreed());
            pet.setDateOfBirth(request.getDateOfBirth());
            
            // Validate and set gender
            if (request.getGender() != null) {
                try {
                    pet.setGender(Pet.Gender.valueOf(request.getGender().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid gender value: " + request.getGender() + 
                        ". Valid values are: MALE, FEMALE, UNKNOWN");
                }
            } else {
                pet.setGender(Pet.Gender.UNKNOWN);
            }
            
            pet.setMicrochipId(request.getMicrochipId());
            pet.setNotes(request.getNotes());
            pet.setHealthStatus(Pet.HealthStatus.HEALTHY);
            pet.setWalkStreak(0);
            
            pet = petRepository.save(pet);
            
            log.info("Pet created: {} for owner: {}", pet.getName(), email);
            
            return mapToResponse(pet);
        } catch (Exception e) {
            log.error("Error creating pet for user {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to create pet: " + e.getMessage());
        }
    }
    
    /**
     * Update pet
     */
    @Transactional
    public PetResponse updatePet(Long petId, PetRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        pet.setName(request.getName());
        pet.setSpecies(request.getSpecies());
        pet.setBreed(request.getBreed());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setGender(Pet.Gender.valueOf(request.getGender()));
        pet.setMicrochipId(request.getMicrochipId());
        pet.setNotes(request.getNotes());
        
        pet = petRepository.save(pet);
        
        log.info("Pet updated: {}", pet.getName());
        
        return mapToResponse(pet);
    }
    
    /**
     * Delete pet
     */
    @Transactional
    public void deletePet(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        petRepository.delete(pet);
        log.info("Pet deleted: {}", pet.getName());
    }
    
    /**
     * Upload pet photo
     */
    @Transactional
    public String uploadPetPhoto(Long petId, MultipartFile file) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            String photoUrl = "/uploads/pets/" + filename;
            pet.setPhoto(photoUrl);
            petRepository.save(pet);
            
            log.info("Photo uploaded for pet: {}", pet.getName());
            return photoUrl;
            
        } catch (IOException e) {
            log.error("Failed to upload pet photo", e);
            throw new RuntimeException("Failed to upload pet photo");
        }
    }
    
    /**
     * Update health status based on vaccinations
     */
    @Transactional
    public void updateHealthStatus(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        // Check overdue vaccinations
        List<Vaccination> overdueVaccinations = vaccinationRepository
                .findByPetAndNextDueDateBefore(pet, LocalDate.now());
        
        if (!overdueVaccinations.isEmpty()) {
            pet.setHealthStatus(Pet.HealthStatus.OVERDUE);
        } else {
            // Check upcoming vaccinations (within 30 days)
            List<Vaccination> upcomingVaccinations = vaccinationRepository
                    .findByNextDueDateBetween(
                            LocalDate.now(),
                            LocalDate.now().plusDays(30)
                    );
            
            if (!upcomingVaccinations.isEmpty()) {
                pet.setHealthStatus(Pet.HealthStatus.DUE_SOON);
            } else {
                pet.setHealthStatus(Pet.HealthStatus.HEALTHY);
            }
        }
        
        petRepository.save(pet);
    }
    
    /**
     * Increment walk streak
     */
    @Transactional
    public void incrementWalkStreak(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        pet.setWalkStreak(pet.getWalkStreak() + 1);
        petRepository.save(pet);
        
        log.info("Walk streak updated for {}: {} days", pet.getName(), pet.getWalkStreak());
    }
    
    /**
     * Search pets
     */
    public List<PetResponse> searchPets(String query) {
        List<Pet> pets = petRepository
                .findByNameContainingIgnoreCaseOrSpeciesContainingIgnoreCaseOrBreedContainingIgnoreCase(
                        query, query, query
                );
        
        return pets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Map Pet entity to PetResponse DTO
     */
    private PetResponse mapToResponse(Pet pet) {
        return PetResponse.builder()
                .id(pet.getId())
                .ownerId(pet.getOwner().getId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .dateOfBirth(pet.getDateOfBirth())
                .gender(pet.getGender().name())
                .photo(pet.getPhoto())
                .microchipId(pet.getMicrochipId())
                .notes(pet.getNotes())
                .weight(pet.getWeight()) // Added weight field
                .healthStatus(pet.getHealthStatus().name())
                .walkStreak(pet.getWalkStreak())
                .age(calculateAge(pet.getDateOfBirth()))
                .createdAt(pet.getCreatedAt())
                .updatedAt(pet.getUpdatedAt())
                .build();
    }
    
    /**
     * Calculate pet age in years
     */
    private Integer calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) return null;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
}
