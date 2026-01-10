package com.pets.petcare.dto;

import com.pets.petcare.entity.Veterinarian;
import lombok.Data;
import java.util.List;

@Data
public class VetWithSlotsResponse {
    private Long id;
    private String name;
    private String clinicName;
    private String specialization;
    private String clinicAddress;
    private String profilePhoto;
    private Integer yearsOfExperience;
    private String qualifications;
    private String bio;
    private Boolean availableForTeleconsult;
    private Double consultationFee;
    private List<SlotResponse> availableSlots;

    public VetWithSlotsResponse(Veterinarian vet) {
        this.id = vet.getId();
        this.name = vet.getUser().getName();
        this.clinicName = vet.getClinicName();
        this.specialization = vet.getSpecialization();
        this.clinicAddress = vet.getClinicAddress();
        this.profilePhoto = vet.getProfilePhoto();
        this.yearsOfExperience = vet.getYearsOfExperience();
        this.qualifications = vet.getQualifications();
        this.bio = vet.getBio();
        this.availableForTeleconsult = vet.getAvailableForTeleconsult();
        this.consultationFee = vet.getConsultationFee();
    }
}
