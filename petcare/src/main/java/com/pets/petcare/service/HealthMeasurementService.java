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
 * HealthMeasurementService - Tracks weight, temperature trends
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HealthMeasurementService {
    
    private final HealthMeasurementRepository measurementRepository;
    private final PetRepository petRepository;
    
    /**
     * Get all measurements for a pet
     */
    public List<HealthMeasurementResponse> getPetMeasurements(Long petId) {
        petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        return measurementRepository.findByPetIdOrderByMeasurementDateDesc(petId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get measurements by date range (for charts)
     */
    public List<HealthMeasurementResponse> getMeasurementsByDateRange(
            Long petId, LocalDate startDate, LocalDate endDate) {
        
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        return measurementRepository
                .findByPetAndMeasurementDateBetween(pet, startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get recent measurements (last 30 days) - for dashboard chart
     */
    public List<HealthMeasurementResponse> getRecentMeasurements(Long petId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        
        return getMeasurementsByDateRange(petId, startDate, endDate);
    }
    
    /**
     * Add new measurement
     */
    @Transactional
    public HealthMeasurementResponse addMeasurement(Long petId, HealthMeasurementRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        HealthMeasurement measurement = new HealthMeasurement();
        measurement.setPet(pet);
        measurement.setMeasurementDate(request.getMeasurementDate());
        measurement.setWeight(request.getWeight());
        measurement.setTemperature(request.getTemperature());
        measurement.setNotes(request.getNotes());
        
        measurement = measurementRepository.save(measurement);
        
        log.info("Health measurement added for pet: {}", pet.getName());
        
        return mapToResponse(measurement);
    }
    
    /**
     * Update measurement
     */
    @Transactional
    public HealthMeasurementResponse updateMeasurement(
            Long measurementId, HealthMeasurementRequest request) {
        
        HealthMeasurement measurement = measurementRepository.findById(measurementId)
                .orElseThrow(() -> new RuntimeException("Measurement not found"));
        
        measurement.setMeasurementDate(request.getMeasurementDate());
        measurement.setWeight(request.getWeight());
        measurement.setTemperature(request.getTemperature());
        measurement.setNotes(request.getNotes());
        
        measurement = measurementRepository.save(measurement);
        
        return mapToResponse(measurement);
    }
    
    /**
     * Delete measurement
     */
    @Transactional
    public void deleteMeasurement(Long measurementId) {
        measurementRepository.deleteById(measurementId);
        log.info("Measurement deleted: ID {}", measurementId);
    }
    
    /**
     * Get latest weight (for dashboard display)
     */
    public Double getLatestWeight(Long petId) {
        List<HealthMeasurement> measurements = measurementRepository
                .findByPetIdOrderByMeasurementDateDesc(petId);
        
        if (!measurements.isEmpty() && measurements.get(0).getWeight() != null) {
            return measurements.get(0).getWeight();
        }
        
        return null;
    }
    
    /**
     * Map entity to response DTO
     */
    private HealthMeasurementResponse mapToResponse(HealthMeasurement m) {
        return HealthMeasurementResponse.builder()
                .id(m.getId())
                .petId(m.getPet().getId())
                .petName(m.getPet().getName())
                .measurementDate(m.getMeasurementDate())
                .weight(m.getWeight())
                .temperature(m.getTemperature())
                .notes(m.getNotes())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
