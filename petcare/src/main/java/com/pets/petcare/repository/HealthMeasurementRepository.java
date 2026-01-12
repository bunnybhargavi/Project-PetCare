package com.pets.petcare.repository;

import com.pets.petcare.entity.HealthMeasurement;
import com.pets.petcare.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface HealthMeasurementRepository extends JpaRepository<HealthMeasurement, Long> {
    List<HealthMeasurement> findByPetOrderByMeasurementDateDesc(Pet pet);
    List<HealthMeasurement> findByPetIdOrderByMeasurementDateDesc(Long petId);
    List<HealthMeasurement> findTop10ByPetIdOrderByMeasurementDateDesc(Long petId);
    List<HealthMeasurement> findByPetAndMeasurementDateBetween(Pet pet, LocalDate start, LocalDate end);
    
    @Query("SELECT DISTINCT h.measurementType FROM HealthMeasurement h WHERE h.recordedByVetId = :vetId AND h.measurementType IS NOT NULL")
    List<String> findDistinctMeasurementTypesByVetId(@Param("vetId") Long vetId);
}
