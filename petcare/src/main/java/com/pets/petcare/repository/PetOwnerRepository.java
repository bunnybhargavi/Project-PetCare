package com.pets.petcare.repository;

import com.pets.petcare.entity.PetOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PetOwnerRepository extends JpaRepository<PetOwner, Long> {
    
    // Find pet owner by user ID
    Optional<PetOwner> findByUserId(Long userId);
    
    // Check if pet owner exists for user
    boolean existsByUserId(Long userId);
    
    // Delete by user ID
    void deleteByUserId(Long userId);
}
