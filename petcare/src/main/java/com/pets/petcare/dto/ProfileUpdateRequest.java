package com.pets.petcare.dto;

import jakarta.validation.constraints.*;

public class ProfileUpdateRequest {

    // Common fields
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    // Pet Owner specific fields
    private String address;
    private String preferences;
    private String emergencyContact;

    // Veterinarian specific fields
    private String clinicName;
    private String specialization;
    private String clinicAddress;
    private String licenseNumber;
    private Integer yearsOfExperience;
    private String qualifications;
    private String bio;
    private String workingHours;
    private Boolean availableForTeleconsult;
    private Double consultationFee;

    // Constructors
    public ProfileUpdateRequest() {
    }

    public ProfileUpdateRequest(String name, String phone, String address, String preferences,
            String emergencyContact, String clinicName, String specialization,
            String clinicAddress, String licenseNumber, Integer yearsOfExperience,
            String qualifications, String bio, String workingHours,
            Boolean availableForTeleconsult, Double consultationFee) {
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.preferences = preferences;
        this.emergencyContact = emergencyContact;
        this.clinicName = clinicName;
        this.specialization = specialization;
        this.clinicAddress = clinicAddress;
        this.licenseNumber = licenseNumber;
        this.yearsOfExperience = yearsOfExperience;
        this.qualifications = qualifications;
        this.bio = bio;
        this.workingHours = workingHours;
        this.availableForTeleconsult = availableForTeleconsult;
        this.consultationFee = consultationFee;
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getPreferences() {
        return preferences;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public String getClinicName() {
        return clinicName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getClinicAddress() {
        return clinicAddress;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public String getQualifications() {
        return qualifications;
    }

    public String getBio() {
        return bio;
    }

    public String getWorkingHours() {
        return workingHours;
    }

    public Boolean getAvailableForTeleconsult() {
        return availableForTeleconsult;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public void setClinicAddress(String clinicAddress) {
        this.clinicAddress = clinicAddress;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setWorkingHours(String workingHours) {
        this.workingHours = workingHours;
    }

    public void setAvailableForTeleconsult(Boolean availableForTeleconsult) {
        this.availableForTeleconsult = availableForTeleconsult;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }
}
