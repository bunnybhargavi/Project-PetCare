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

    // Find vets with available slots on a specific date
    @Query("SELECT DISTINCT v FROM Veterinarian v " +
            "JOIN AppointmentSlot s ON s.veterinarian.id = v.id " +
            "WHERE s.status = 'AVAILABLE' " +
            "AND s.bookedCount < s.capacity " +
            "AND DATE(s.startTime) = DATE(:date)")
    List<Veterinarian> findVetsWithAvailableSlotsOnDate(@Param("date") java.time.LocalDate date);

    // Find vets with available slots in date range
    @Query("SELECT DISTINCT v FROM Veterinarian v " +
            "JOIN AppointmentSlot s ON s.veterinarian.id = v.id " +
            "WHERE s.status = 'AVAILABLE' " +
            "AND s.bookedCount < s.capacity " +
            "AND s.startTime BETWEEN :startDate AND :endDate")
    List<Veterinarian> findVetsWithAvailableSlotsInRange(
            @Param("startDate") java.time.LocalDateTime startDate,
            @Param("endDate") java.time.LocalDateTime endDate);

    // Advanced search with availability filter
    @Query("SELECT DISTINCT v FROM Veterinarian v " +
            "LEFT JOIN AppointmentSlot s ON s.veterinarian.id = v.id " +
            "WHERE (:specialization IS NULL OR LOWER(v.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) " +
            "AND (:location IS NULL OR LOWER(v.clinicAddress) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:teleconsult IS NULL OR v.availableForTeleconsult = :teleconsult) " +
            "AND (:hasAvailability = false OR (s.status = 'AVAILABLE' AND s.bookedCount < s.capacity AND s.startTime >= :fromDate))")
    List<Veterinarian> advancedSearchVeterinarians(
            @Param("specialization") String specialization,
            @Param("location") String location,
            @Param("teleconsult") Boolean teleconsult,
            @Param("hasAvailability") Boolean hasAvailability,
            @Param("fromDate") java.time.LocalDateTime fromDate);

    // Find all vets with complete profiles
    @Query("SELECT v FROM Veterinarian v WHERE v.profileComplete = true")
    List<Veterinarian> findVetsWithCompleteProfiles();
}
