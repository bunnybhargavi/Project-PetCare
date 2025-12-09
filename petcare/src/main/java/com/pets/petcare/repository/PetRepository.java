package com.pets.petcare.repository;

import com.pets.petcare.entity.Pet;
import com.pets.petcare.entity.PetOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwner(PetOwner owner);
    List<Pet> findByOwnerId(Long ownerId);
    List<Pet> findByNameContainingIgnoreCaseOrSpeciesContainingIgnoreCaseOrBreedContainingIgnoreCase(
        String name, String species, String breed
    );
}
