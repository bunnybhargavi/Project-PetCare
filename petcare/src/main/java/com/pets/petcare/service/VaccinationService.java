package com.pets.petcare.service;

import com.pets.petcare.dto.*;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VaccinationService {
    
    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;
    
    public List<VaccinationResponse> getPetVaccinations(Long petId) {
        petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        return vaccinationRepository.findByPetIdOrderByDateGivenDesc(petId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public VaccinationResponse addVaccination(Long petId, VaccinationRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));
        
        Vaccination vaccination = new Vaccination();
        vaccination.setPet(pet);
        vaccination.setVaccineName(request.getVaccineName());
        vaccination.setDateGiven(request.getDateGiven());
        vaccination.setNextDueDate(request.getNextDueDate());
        vaccination.setBatchNumber(request.getBatchNumber());
        vaccination.setVeterinarianName(request.getVeterinarianName());
        vaccination.setNotes(request.getNotes());
        
        vaccination = vaccinationRepository.save(vaccination);
        log.info("Vaccination added for pet: {}", pet.getName());
        
        return mapToResponse(vaccination);
    }
    
    @Transactional
    public VaccinationResponse updateVaccination(Long vaccinationId, VaccinationRequest request) {
        Vaccination vaccination = vaccinationRepository.findById(vaccinationId)
                .orElseThrow(() -> new RuntimeException("Vaccination not found"));
        
        vaccination.setVaccineName(request.getVaccineName());
        vaccination.setDateGiven(request.getDateGiven());
        vaccination.setNextDueDate(request.getNextDueDate());
        vaccination.setBatchNumber(request.getBatchNumber());
        vaccination.setVeterinarianName(request.getVeterinarianName());
        vaccination.setNotes(request.getNotes());
        
        vaccination = vaccinationRepository.save(vaccination);
        return mapToResponse(vaccination);
    }
    
    @Transactional
    public void deleteVaccination(Long vaccinationId) {
        vaccinationRepository.deleteById(vaccinationId);
    }
    
    private VaccinationResponse mapToResponse(Vaccination v) {
        LocalDate nextDue = v.getNextDueDate();
        Integer daysUntil = null;
        Boolean isOverdue = false;
        
        if (nextDue != null) {
            daysUntil = (int) ChronoUnit.DAYS.between(LocalDate.now(), nextDue);
            isOverdue = daysUntil < 0;
        }
        
        return VaccinationResponse.builder()
                .id(v.getId())
                .petId(v.getPet().getId())
                .petName(v.getPet().getName())
                .vaccineName(v.getVaccineName())
                .dateGiven(v.getDateGiven())
                .nextDueDate(v.getNextDueDate())
                .batchNumber(v.getBatchNumber())
                .veterinarianName(v.getVeterinarianName())
                .notes(v.getNotes())
                .isOverdue(isOverdue)
                .daysUntilDue(daysUntil)
                .createdAt(v.getCreatedAt())
                .build();
    }
}