package com.pets.petcare.repository;

import com.pets.petcare.entity.MedicalRecord;
import com.pets.petcare.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPetOrderByVisitDateDesc(Pet pet);
    List<MedicalRecord> findByPetIdOrderByVisitDateDesc(Long petId);
    List<MedicalRecord> findByPetAndRecordType(Pet pet, MedicalRecord.RecordType type);
    List<MedicalRecord> findByPetAndVisitDateBetween(Pet pet, LocalDate start, LocalDate end);
}