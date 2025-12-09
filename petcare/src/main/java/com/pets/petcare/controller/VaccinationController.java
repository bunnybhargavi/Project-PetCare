package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.service.VaccinationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pets/{petId}/vaccinations")
@RequiredArgsConstructor
public class VaccinationController {
    
    private final VaccinationService vaccinationService;
    
    @GetMapping
    public ResponseEntity<List<VaccinationResponse>> getPetVaccinations(@PathVariable Long petId) {
        return ResponseEntity.ok(vaccinationService.getPetVaccinations(petId));
    }
    
    @PostMapping
    public ResponseEntity<VaccinationResponse> addVaccination(
            @PathVariable Long petId, @Valid @RequestBody VaccinationRequest request) {
        return ResponseEntity.ok(vaccinationService.addVaccination(petId, request));
    }
    
    @PutMapping("/{vaccinationId}")
    public ResponseEntity<VaccinationResponse> updateVaccination(
            @PathVariable Long vaccinationId, @Valid @RequestBody VaccinationRequest request) {
        return ResponseEntity.ok(vaccinationService.updateVaccination(vaccinationId, request));
    }
    
    @DeleteMapping("/{vaccinationId}")
    public ResponseEntity<Void> deleteVaccination(@PathVariable Long vaccinationId) {
        vaccinationService.deleteVaccination(vaccinationId);
        return ResponseEntity.noContent().build();
    }
}
