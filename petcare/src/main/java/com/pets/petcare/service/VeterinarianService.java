package com.pets.petcare.service;

import com.pets.petcare.dto.VetSearchRequest;
import com.pets.petcare.dto.VetAvailabilitySearchRequest;
import com.pets.petcare.dto.VetWithSlotsResponse;
import com.pets.petcare.dto.SlotResponse;
import com.pets.petcare.entity.User;
import com.pets.petcare.entity.Veterinarian;
import com.pets.petcare.entity.AppointmentSlot;
import com.pets.petcare.entity.User.Role;
import com.pets.petcare.repository.UserRepository;
import com.pets.petcare.repository.VeterinarianRepository;
import com.pets.petcare.repository.AppointmentSlotRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VeterinarianService {

    private final VeterinarianRepository veterinarianRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private AppointmentSlotRepository slotRepository;

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
                request.getTeleconsultOnly());
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

    /**
     * Search vets with their available slots
     */
    public List<VetWithSlotsResponse> searchVetsWithAvailability(VetAvailabilitySearchRequest request) {
        // First, search for vets based on criteria
        List<Veterinarian> vets = veterinarianRepository.searchVeterinarians(
                request.getSpecialization(),
                request.getLocation(),
                request.getTeleconsultAvailable());

        // For each vet, get their available slots
        return vets.stream().map(vet -> {
            VetWithSlotsResponse response = new VetWithSlotsResponse(vet);

            // Get available slots
            List<AppointmentSlot> slots;
            if (request.getDate() != null) {
                // Get slots for specific date
                LocalDateTime startOfDay = request.getDate().atStartOfDay();
                LocalDateTime endOfDay = request.getDate().atTime(23, 59, 59);
                slots = slotRepository.findByVeterinarianIdAndStartTimeBetween(
                        vet.getId(), startOfDay, endOfDay);
            } else {
                // Get all upcoming available slots
                slots = slotRepository.findByVeterinarianIdAndStatusAndStartTimeAfter(
                        vet.getId(),
                        AppointmentSlot.SlotStatus.AVAILABLE,
                        LocalDateTime.now());
            }

            // Filter by appointment type if specified
            if (request.getAppointmentType() != null && !request.getAppointmentType().isEmpty()) {
                AppointmentSlot.SlotType requestedType = AppointmentSlot.SlotType.valueOf(request.getAppointmentType());
                slots = slots.stream()
                        .filter(slot -> slot.getMode() == AppointmentSlot.SlotType.BOTH ||
                                slot.getMode() == requestedType)
                        .filter(slot -> slot.getBookedCount() < slot.getCapacity()) // Has capacity
                        .collect(Collectors.toList());
            } else {
                // Just filter by capacity
                slots = slots.stream()
                        .filter(slot -> slot.getBookedCount() < slot.getCapacity())
                        .collect(Collectors.toList());
            }

            // Convert slots to SlotResponse DTOs
            List<SlotResponse> slotResponses = slots.stream().map(slot -> {
                SlotResponse slotResp = new SlotResponse();
                slotResp.setId(slot.getId());
                slotResp.setVeterinarianId(vet.getId());
                slotResp.setVeterinarianName(vet.getUser().getName());
                slotResp.setClinicName(vet.getClinicName());
                slotResp.setStartTime(slot.getStartTime());
                slotResp.setEndTime(slot.getEndTime());
                slotResp.setStatus(slot.getStatus());
                slotResp.setMode(slot.getMode());
                slotResp.setCapacity(slot.getCapacity());
                slotResp.setBookedCount(slot.getBookedCount());
                slotResp.setAvailableSpots(slot.getCapacity() - slot.getBookedCount());
                return slotResp;
            }).collect(Collectors.toList());

            response.setAvailableSlots(slotResponses);
            return response;
        }).filter(vetResp -> !vetResp.getAvailableSlots().isEmpty()) // Only return vets with available slots
                .collect(Collectors.toList());
    }
}
