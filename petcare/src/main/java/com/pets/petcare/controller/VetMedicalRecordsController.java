package com.pets.petcare.controller;

import com.pets.petcare.entity.*;
import com.pets.petcare.service.VetMedicalRecordsService;
import com.pets.petcare.dto.ConsultationNotesRequest;
import com.pets.petcare.dto.HealthMeasurementRequest;
import com.pets.petcare.dto.BatchHealthMeasurementRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * VetMedicalRecordsController - API endpoints for vets to access pet medical records
 */
@RestController
@RequestMapping("/api/vet/medical-records")
@CrossOrigin(origins = "*")
public class VetMedicalRecordsController {

    @Autowired
    private VetMedicalRecordsService vetMedicalRecordsService;

    /**
     * Get complete medical history for a pet
     * GET /api/vet/medical-records/pet/{petId}/complete?vetId={vetId}
     */
    @GetMapping("/pet/{petId}/complete")
    public ResponseEntity<VetMedicalRecordsService.PetMedicalSummary> getCompleteMedicalHistory(
            @PathVariable Long petId,
            @RequestParam Long vetId) {
        VetMedicalRecordsService.PetMedicalSummary summary = 
            vetMedicalRecordsService.getCompleteMedicalHistory(petId, vetId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get medical records by type
     * GET /api/vet/medical-records/pet/{petId}/records?vetId={vetId}&type={type}
     */
    @GetMapping("/pet/{petId}/records")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsByType(
            @PathVariable Long petId,
            @RequestParam Long vetId,
            @RequestParam(required = false) String type) {
        List<MedicalRecord> records = vetMedicalRecordsService.getMedicalRecordsByType(petId, vetId, type);
        return ResponseEntity.ok(records);
    }

    /**
     * Get vaccination history
     * GET /api/vet/medical-records/pet/{petId}/vaccinations?vetId={vetId}
     */
    @GetMapping("/pet/{petId}/vaccinations")
    public ResponseEntity<List<Vaccination>> getVaccinationHistory(
            @PathVariable Long petId,
            @RequestParam Long vetId) {
        List<Vaccination> vaccinations = vetMedicalRecordsService.getVaccinationHistory(petId, vetId);
        return ResponseEntity.ok(vaccinations);
    }

    /**
     * Get recent health measurements
     * GET /api/vet/medical-records/pet/{petId}/health-measurements?vetId={vetId}
     */
    @GetMapping("/pet/{petId}/health-measurements")
    public ResponseEntity<List<HealthMeasurement>> getRecentHealthMeasurements(
            @PathVariable Long petId,
            @RequestParam Long vetId) {
        List<HealthMeasurement> measurements = vetMedicalRecordsService.getRecentHealthMeasurements(petId, vetId, 10);
        return ResponseEntity.ok(measurements);
    }

    /**
     * Add consultation notes after teleconsultation
     * POST /api/vet/medical-records/consultation-notes/{appointmentId}
     */
    @PostMapping("/consultation-notes/{appointmentId}")
    public ResponseEntity<MedicalRecord> addConsultationNotes(
            @PathVariable Long appointmentId,
            @RequestBody ConsultationNotesRequest request) {
        MedicalRecord record = vetMedicalRecordsService.addConsultationNotes(
            appointmentId, 
            request.getVetId(), 
            request.getNotes(), 
            request.getDiagnosis(), 
            request.getPrescription()
        );
        return ResponseEntity.ok(record);
    }

    /**
     * Add custom health measurement
     * POST /api/vet/medical-records/pet/{petId}/health-measurement
     */
    @PostMapping("/pet/{petId}/health-measurement")
    public ResponseEntity<HealthMeasurement> addHealthMeasurement(
            @PathVariable Long petId,
            @RequestBody HealthMeasurementRequest request) {
        HealthMeasurement measurement = vetMedicalRecordsService.addHealthMeasurement(
            petId, 
            request.getVetId(),
            request.getMeasurementType(),
            request.getValue(),
            request.getUnit(),
            request.getNotes()
        );
        return ResponseEntity.ok(measurement);
    }

    /**
     * Add multiple health measurements at once
     * POST /api/vet/medical-records/pet/{petId}/health-measurements/batch
     */
    @PostMapping("/pet/{petId}/health-measurements/batch")
    public ResponseEntity<List<HealthMeasurement>> addMultipleHealthMeasurements(
            @PathVariable Long petId,
            @RequestBody BatchHealthMeasurementRequest request) {
        List<HealthMeasurement> measurements = vetMedicalRecordsService.addMultipleHealthMeasurements(
            petId, 
            request.getVetId(),
            request.getMeasurements()
        );
        return ResponseEntity.ok(measurements);
    }

    /**
     * Get available measurement types for a vet's practice
     * GET /api/vet/medical-records/measurement-types?vetId={vetId}
     */
    @GetMapping("/measurement-types")
    public ResponseEntity<List<String>> getAvailableMeasurementTypes(@RequestParam Long vetId) {
        List<String> measurementTypes = vetMedicalRecordsService.getAvailableMeasurementTypes(vetId);
        return ResponseEntity.ok(measurementTypes);
    }
}