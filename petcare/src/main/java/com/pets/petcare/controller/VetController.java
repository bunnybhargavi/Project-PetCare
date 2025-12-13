package com.pets.petcare.controller;

import com.pets.petcare.dto.VetResponse;
import com.pets.petcare.entity.Veterinarian;
import com.pets.petcare.service.VeterinarianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vets")
public class VetController {

    private final VeterinarianService veterinarianService;

    public VetController(VeterinarianService veterinarianService) {
        this.veterinarianService = veterinarianService;
    }

    @GetMapping
    public ResponseEntity<List<VetResponse>> listAll() {
        List<VetResponse> response = veterinarianService.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<VetResponse>> search(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "specialization", required = false) String specialization) {
        List<VetResponse> response = veterinarianService.findAll().stream()
                .map(this::mapToResponse)
                .filter(v -> {
                    boolean ok = true;
                    if (city != null && !city.isBlank())
                        ok &= (v.getCity() != null
                                && v.getCity().toLowerCase().contains(city.toLowerCase()));
                    if (specialization != null && !specialization.isBlank())
                        ok &= (v.getSpecialization() != null && v.getSpecialization().equalsIgnoreCase(specialization));
                    return ok;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private VetResponse mapToResponse(Veterinarian vet) {
        return VetResponse.builder()
                .id(vet.getId())
                .name(vet.getUser().getName())
                .clinicName(vet.getClinicName())
                .specialization(vet.getSpecialization())
                .city(vet.getClinicAddress())
                .contactPhone(vet.getUser().getPhone())
                .rating(4.8)
                .build();
    }
}
