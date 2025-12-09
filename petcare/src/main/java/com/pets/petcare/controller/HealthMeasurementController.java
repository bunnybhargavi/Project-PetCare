package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.service.HealthMeasurementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pets/{petId}/measurements")
@RequiredArgsConstructor
public class HealthMeasurementController {
    
    private final HealthMeasurementService measurementService;
    
    @GetMapping
    public ResponseEntity<List<HealthMeasurementResponse>> getPetMeasurements(@PathVariable Long petId) {
        return ResponseEntity.ok(measurementService.getPetMeasurements(petId));
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<HealthMeasurementResponse>> getRecentMeasurements(@PathVariable Long petId) {
        return ResponseEntity.ok(measurementService.getRecentMeasurements(petId));
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<HealthMeasurementResponse>> getMeasurementsByDateRange(
            @PathVariable Long petId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(measurementService.getMeasurementsByDateRange(petId, start, end));
    }
    
    @PostMapping
    public ResponseEntity<HealthMeasurementResponse> addMeasurement(
            @PathVariable Long petId, @Valid @RequestBody HealthMeasurementRequest request) {
        return ResponseEntity.ok(measurementService.addMeasurement(petId, request));
    }
    
    @PutMapping("/{measurementId}")
    public ResponseEntity<HealthMeasurementResponse> updateMeasurement(
            @PathVariable Long measurementId, @Valid @RequestBody HealthMeasurementRequest request) {
        return ResponseEntity.ok(measurementService.updateMeasurement(measurementId, request));
    }
    
    @DeleteMapping("/{measurementId}")
    public ResponseEntity<Void> deleteMeasurement(@PathVariable Long measurementId) {
        measurementService.deleteMeasurement(measurementId);
        return ResponseEntity.noContent().build();
    }
}
