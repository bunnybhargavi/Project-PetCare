package com.pets.petcare.repository;

import com.pets.petcare.entity.Veterinarian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VeterinarianRepository extends JpaRepository<Veterinarian, Long> {
    
    // Find veterinarian by user ID
    Optional<Veterinarian> findByUserId(Long userId);
    
    // Check if veterinarian exists for user
    boolean existsByUserId(Long userId);
    
    // Find by specialization
    List<Veterinarian> findBySpecializationContainingIgnoreCase(String specialization);
    
    // Find vets available for teleconsult
    List<Veterinarian> findByAvailableForTeleconsult(Boolean available);
    
    // Delete by user ID
    void deleteByUserId(Long userId);
}
