package com.pets.petcare.service;

import com.pets.petcare.dto.VetSearchRequest;
import com.pets.petcare.dto.VetSearchResponse;
import com.pets.petcare.entity.AppointmentSlot;
import com.pets.petcare.entity.Veterinarian;
import com.pets.petcare.repository.AppointmentSlotRepository;
import com.pets.petcare.repository.VeterinarianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for veterinarian search and discovery functionality
 */
@Service
public class VetSearchService {

    @Autowired
    private VeterinarianRepository veterinarianRepository;

    @Autowired
    private AppointmentSlotRepository slotRepository;

    /**
     * Advanced search for veterinarians with filters and availability
     */
    public List<VetSearchResponse> searchVeterinarians(VetSearchRequest request) {
        LocalDateTime fromDate = request.getAvailabilityDate() != null
                ? request.getAvailabilityDate().atStartOfDay()
                : LocalDateTime.now();

        List<Veterinarian> vets = veterinarianRepository.advancedSearchVeterinarians(
                request.getSpecialization(),
                request.getLocation(),
                request.getTeleconsultOnly(),
                request.getHasAvailability(),
                fromDate);

        return vets.stream()
                .map(this::convertToSearchResponse)
                .sorted((v1, v2) -> {
                    // Sort by earliest availability, then by rating (when implemented)
                    if (v1.getEarliestAvailability() != null && v2.getEarliestAvailability() != null) {
                        return v1.getEarliestAvailability().compareTo(v2.getEarliestAvailability());
                    }
                    if (v1.getEarliestAvailability() != null)
                        return -1;
                    if (v2.getEarliestAvailability() != null)
                        return 1;
                    return v1.getName().compareTo(v2.getName());
                })
                .collect(Collectors.toList());
    }

    /**
     * Find veterinarians by specialization
     */
    public List<VetSearchResponse> findBySpecialization(String specialization) {
        List<Veterinarian> vets = veterinarianRepository.findBySpecializationContainingIgnoreCase(specialization);
        return vets.stream()
                .map(this::convertToSearchResponse)
                .collect(Collectors.toList());
    }

    /**
     * Find veterinarians by location
     */
    public List<VetSearchResponse> findByLocation(String location) {
        List<Veterinarian> vets = veterinarianRepository.findByClinicAddressContainingIgnoreCase(location);
        return vets.stream()
                .map(this::convertToSearchResponse)
                .collect(Collectors.toList());
    }

    /**
     * Find veterinarians with availability on specific date
     */
    public List<VetSearchResponse> findWithAvailabilityOnDate(LocalDate date) {
        List<Veterinarian> vets = veterinarianRepository.findVetsWithAvailableSlotsOnDate(date);
        return vets.stream()
                .map(this::convertToSearchResponse)
                .collect(Collectors.toList());
    }

    /**
     * Find veterinarians available for teleconsult
     */
    public List<VetSearchResponse> findAvailableForTeleconsult() {
        List<Veterinarian> vets = veterinarianRepository.findByAvailableForTeleconsult(true);
        return vets.stream()
                .map(this::convertToSearchResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get detailed vet information with all available slots
     */
    public VetSearchResponse getVetWithSlots(Long vetId) {
        Veterinarian vet = veterinarianRepository.findById(vetId)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));

        return convertToSearchResponse(vet);
    }

    /**
     * Get available slots for a specific vet on a specific date
     */
    public List<VetSearchResponse.AvailableSlotInfo> getVetSlotsForDate(Long vetId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        List<AppointmentSlot> slots = slotRepository.findByVeterinarianIdAndStartTimeBetween(vetId, startOfDay,
                endOfDay);

        return slots.stream()
                .filter(slot -> slot.getStatus() == AppointmentSlot.SlotStatus.AVAILABLE)
                .filter(slot -> slot.getBookedCount() < slot.getCapacity())
                .map(this::convertToSlotInfo)
                .collect(Collectors.toList());
    }

    /**
     * Convert Veterinarian entity to VetSearchResponse DTO
     */
    private VetSearchResponse convertToSearchResponse(Veterinarian vet) {
        VetSearchResponse response = new VetSearchResponse();
        response.setId(vet.getId());
        response.setName(vet.getUser().getName());
        response.setClinicName(vet.getClinicName());
        response.setSpecialization(vet.getSpecialization());
        response.setClinicAddress(vet.getClinicAddress());
        response.setProfilePhoto(vet.getProfilePhoto());
        response.setYearsOfExperience(vet.getYearsOfExperience());
        response.setQualifications(vet.getQualifications());
        response.setBio(vet.getBio());
        response.setWorkingHours(vet.getWorkingHours());
        response.setAvailableForTeleconsult(vet.getAvailableForTeleconsult());
        response.setConsultationFee(vet.getConsultationFee());

        // TODO: Implement rating system
        response.setRating(4.5); // Placeholder
        response.setTotalReviews(25); // Placeholder
        response.setDistanceKm(5.2); // Placeholder - implement geolocation

        // Get available slots
        List<AppointmentSlot> availableSlots = slotRepository.findByVeterinarianIdAndStatusAndStartTimeAfter(
                vet.getId(),
                AppointmentSlot.SlotStatus.AVAILABLE,
                LocalDateTime.now());

        List<VetSearchResponse.AvailableSlotInfo> slotInfos = availableSlots.stream()
                .filter(slot -> slot.getBookedCount() < slot.getCapacity())
                .limit(10) // Limit to next 10 available slots
                .map(this::convertToSlotInfo)
                .collect(Collectors.toList());

        response.setAvailableSlots(slotInfos);
        response.setTotalAvailableSlots(slotInfos.size());

        if (!slotInfos.isEmpty()) {
            response.setEarliestAvailability(slotInfos.get(0).getStartTime());
        }

        return response;
    }

    /**
     * Convert AppointmentSlot to AvailableSlotInfo
     */
    private VetSearchResponse.AvailableSlotInfo convertToSlotInfo(AppointmentSlot slot) {
        VetSearchResponse.AvailableSlotInfo info = new VetSearchResponse.AvailableSlotInfo();
        info.setSlotId(slot.getId());
        info.setStartTime(slot.getStartTime());
        info.setEndTime(slot.getEndTime());
        info.setMode(slot.getMode().toString());
        info.setAvailableCapacity(slot.getCapacity() - slot.getBookedCount());
        info.setTotalCapacity(slot.getCapacity());
        return info;
    }
}