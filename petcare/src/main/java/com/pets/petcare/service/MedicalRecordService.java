package com.pets.petcare.service;

import com.pets.petcare.dto.*;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * MedicalRecordService - Manages pet medical history
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PetRepository petRepository;

    /**
     * Get all medical records for a pet
     */
    public List<MedicalRecordResponse> getPetMedicalRecords(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        List<MedicalRecord> records = medicalRecordRepository
                .findByPetIdOrderByVisitDateDesc(petId);

        return records.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get medical records by type
     */
    public List<MedicalRecordResponse> getRecordsByType(Long petId, String type) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        MedicalRecord.RecordType recordType = MedicalRecord.RecordType.valueOf(type);

        List<MedicalRecord> records = medicalRecordRepository
                .findByPetAndRecordType(pet, recordType);

        return records.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get medical records by date range
     */
    public List<MedicalRecordResponse> getRecordsByDateRange(
            Long petId, LocalDate startDate, LocalDate endDate) {

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        List<MedicalRecord> records = medicalRecordRepository
                .findByPetAndVisitDateBetween(pet, startDate, endDate);

        return records.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Add new medical record
     */
    @Transactional
    public MedicalRecordResponse addMedicalRecord(Long petId, MedicalRecordRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        MedicalRecord record = new MedicalRecord();
        record.setPet(pet);
        record.setVisitDate(request.getVisitDate());
        record.setRecordType(MedicalRecord.RecordType.valueOf(request.getRecordType()));
        record.setVetName(request.getVetName());
        record.setDiagnosis(request.getDiagnosis());
        record.setTreatment(request.getTreatment());
        record.setPrescriptions(request.getPrescriptions());
        record.setNotes(request.getNotes());

        record = medicalRecordRepository.save(record);

        log.info("Medical record added for pet: {}", pet.getName());

        return mapToResponse(record);
    }

    /**
     * Update medical record
     */
    @Transactional
    public MedicalRecordResponse updateMedicalRecord(
            Long recordId, MedicalRecordRequest request) {

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));

        record.setVisitDate(request.getVisitDate());
        record.setRecordType(MedicalRecord.RecordType.valueOf(request.getRecordType()));
        record.setVetName(request.getVetName());
        record.setDiagnosis(request.getDiagnosis());
        record.setTreatment(request.getTreatment());
        record.setPrescriptions(request.getPrescriptions());
        record.setNotes(request.getNotes());

        record = medicalRecordRepository.save(record);

        log.info("Medical record updated: ID {}", recordId);

        return mapToResponse(record);
    }

    /**
     * Delete medical record
     */
    @Transactional
    public void deleteMedicalRecord(Long recordId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Medical record not found"));

        medicalRecordRepository.delete(record);
        log.info("Medical record deleted: ID {}", recordId);
    }

    /**
     * Map MedicalRecord entity to Response DTO
     */
    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .petId(record.getPet().getId())
                .petName(record.getPet().getName())
                .visitDate(record.getVisitDate())
                .recordType(record.getRecordType().name())
                .vetName(record.getVetName())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .prescriptions(record.getPrescriptions())
                .attachmentUrl(record.getAttachmentUrl())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
