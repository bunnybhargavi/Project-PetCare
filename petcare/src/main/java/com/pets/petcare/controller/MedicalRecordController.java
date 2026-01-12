package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.service.MedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pets/{petId}/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {
    
    private final MedicalRecordService medicalRecordService;
    
    @GetMapping
    public ResponseEntity<List<MedicalRecordResponse>> getPetMedicalRecords(@PathVariable Long petId) {
        return ResponseEntity.ok(medicalRecordService.getPetMedicalRecords(petId));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<MedicalRecordResponse>> getRecordsByType(
            @PathVariable Long petId, @PathVariable String type) {
        return ResponseEntity.ok(medicalRecordService.getRecordsByType(petId, type));
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<MedicalRecordResponse>> getRecordsByDateRange(
            @PathVariable Long petId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(medicalRecordService.getRecordsByDateRange(petId, start, end));
    }
    
    @PostMapping
    public ResponseEntity<MedicalRecordResponse> addMedicalRecord(
            @PathVariable Long petId, @Valid @RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(medicalRecordService.addMedicalRecord(petId, request));
    }
    
    @PutMapping("/{recordId}")
    public ResponseEntity<MedicalRecordResponse> updateMedicalRecord(
            @PathVariable Long recordId, @Valid @RequestBody MedicalRecordRequest request) {
        return ResponseEntity.ok(medicalRecordService.updateMedicalRecord(recordId, request));
    }

    /**
     * Upload or replace an attachment for a medical record (PDF/report image)
     * POST /api/pets/{petId}/medical-records/{recordId}/attachment
     */
    @PostMapping("/{recordId}/attachment")
    public ResponseEntity<MedicalRecordResponse> uploadAttachment(
            @PathVariable Long recordId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(medicalRecordService.uploadAttachment(recordId, file));
    }
    
    @DeleteMapping("/{recordId}")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable Long recordId) {
        medicalRecordService.deleteMedicalRecord(recordId);
        return ResponseEntity.noContent().build();
    }
}