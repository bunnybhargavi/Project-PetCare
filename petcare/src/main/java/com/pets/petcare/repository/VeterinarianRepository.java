package com.pets.petcare.repository;

import com.pets.petcare.entity.Veterinarian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VeterinarianRepository extends JpaRepository<Veterinarian, Long> {
    Optional<Veterinarian> findByUserId(Long userId);

    // Search by specialization
    List<Veterinarian> findBySpecializationContainingIgnoreCase(String specialization);

    // Search by location (clinic address)
    List<Veterinarian> findByClinicAddressContainingIgnoreCase(String location);

    // Find vets available for teleconsult
    List<Veterinarian> findByAvailableForTeleconsult(Boolean available);

    // Combined search
    @Query("SELECT v FROM Veterinarian v WHERE " +
            "(:specialization IS NULL OR LOWER(v.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) AND " +
            "(:location IS NULL OR LOWER(v.clinicAddress) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:teleconsult IS NULL OR v.availableForTeleconsult = :teleconsult)")
    List<Veterinarian> searchVeterinarians(
            @Param("specialization") String specialization,
            @Param("location") String location,
            @Param("teleconsult") Boolean teleconsult);
}
