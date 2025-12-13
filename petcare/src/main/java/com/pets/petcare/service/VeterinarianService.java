package com.pets.petcare.service;

import com.pets.petcare.dto.VetSearchRequest;
import com.pets.petcare.entity.User;
import com.pets.petcare.entity.Veterinarian;
import com.pets.petcare.entity.User.Role;
import com.pets.petcare.repository.UserRepository;
import com.pets.petcare.repository.VeterinarianRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VeterinarianService {

    private final VeterinarianRepository veterinarianRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public VeterinarianService(VeterinarianRepository veterinarianRepository, UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.veterinarianRepository = veterinarianRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        if (veterinarianRepository.count() == 0) {
            initVet("vet@example.com", "Dr. Emily Parker", "Small Animal Medicine", "VET-12345");
            initVet("vet2@example.com", "Dr. House", "Dermatology", "VET-99999");
        }
    }

    private void initVet(String email, String name, String specialization, String license) {
        try {
            if (userRepository.findByEmail(email).isPresent())
                return;

            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPassword(passwordEncoder.encode("password"));
            user.setPhone("1234567890"); // Placeholder
            user.setRole(Role.VET);
            user.setIsVerified(true);
            user = userRepository.save(user);

            Veterinarian vet = new Veterinarian();
            vet.setUser(user);
            vet.setClinicName("PetCare Clinic");
            vet.setSpecialization(specialization);
            vet.setLicenseNumber(license);
            vet.setAvailableForTeleconsult(true);
            vet.setConsultationFee(50.0);
            vet.setQualifications("DVM");
            vet.setBio("Experienced veterinarian dedicated to pet health.");
            vet.setWorkingHours("Mon-Fri: 9AM-5PM");
            vet.setClinicAddress("123 Vet Street");

            veterinarianRepository.save(vet);
            System.out.println("Initialized Vet: " + email);
        } catch (Exception e) {
            System.err.println("Failed to init vet: " + e.getMessage());
        }
    }

    public List<Veterinarian> findAll() {
        return veterinarianRepository.findAll();
    }

    /**
     * Search veterinarians by specialty, location, and teleconsult availability
     */
    public List<Veterinarian> searchVeterinarians(VetSearchRequest request) {
        return veterinarianRepository.searchVeterinarians(
                request.getSpecialization(),
                request.getLocation(),
                request.getTeleconsultAvailable());
    }

    /**
     * Get veterinarian by ID
     */
    public Veterinarian getVeterinarianById(Long id) {
        return veterinarianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));
    }

    /**
     * Find vets by specialization
     */
    public List<Veterinarian> findBySpecialization(String specialization) {
        return veterinarianRepository.findBySpecializationContainingIgnoreCase(specialization);
    }

    /**
     * Find vets by location
     */
    public List<Veterinarian> findByLocation(String location) {
        return veterinarianRepository.findByClinicAddressContainingIgnoreCase(location);
    }

    /**
     * Find vets available for teleconsult
     */
    public List<Veterinarian> findTeleconsultVets() {
        return veterinarianRepository.findByAvailableForTeleconsult(true);
    }
}
