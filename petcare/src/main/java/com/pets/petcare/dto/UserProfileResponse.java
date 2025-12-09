package com.pets.petcare.dto;

public class UserProfileResponse {
    // User basic info
    private Long userId;
    private String email;
    private String name;
    private String phone;
    private String role;
    private Boolean isActive;
    // Common display fields
    private String address;
    private String profilePhoto;

    // Pet Owner specific fields
    private Long ownerId;
    private String ownerAddress;
    private String ownerProfilePhoto;
    private String preferences;
    private String emergencyContact;

    // Veterinarian specific fields
    private Long vetId;
    private String clinicName;
    private String specialization;
    private String clinicAddress;
    private String vetProfilePhoto;
    private String licenseNumber;
    private Integer yearsOfExperience;
    private String qualifications;
    private String bio;
    private String workingHours;
    private Boolean availableForTeleconsult;
    private Double consultationFee;

    // Constructors
    public UserProfileResponse() {
    }

    public UserProfileResponse(Long userId, String email, String name, String phone, String role,
            Boolean isActive, Long ownerId, String ownerAddress, String ownerProfilePhoto,
            String preferences, String emergencyContact, Long vetId, String clinicName,
            String specialization, String clinicAddress, String vetProfilePhoto,
            String licenseNumber, Integer yearsOfExperience, String qualifications,
            String bio, String workingHours, Boolean availableForTeleconsult,
            Double consultationFee) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.isActive = isActive;
        this.address = ownerAddress != null ? ownerAddress : clinicAddress;
        this.profilePhoto = ownerProfilePhoto != null ? ownerProfilePhoto : vetProfilePhoto;
        this.ownerId = ownerId;
        this.ownerAddress = ownerAddress;
        this.ownerProfilePhoto = ownerProfilePhoto;
        this.preferences = preferences;
        this.emergencyContact = emergencyContact;
        this.vetId = vetId;
        this.clinicName = clinicName;
        this.specialization = specialization;
        this.clinicAddress = clinicAddress;
        this.vetProfilePhoto = vetProfilePhoto;
        this.licenseNumber = licenseNumber;
        this.yearsOfExperience = yearsOfExperience;
        this.qualifications = qualifications;
        this.bio = bio;
        this.workingHours = workingHours;
        this.availableForTeleconsult = availableForTeleconsult;
        this.consultationFee = consultationFee;
    }

    // Builder pattern support
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long userId;
        private String email;
        private String name;
        private String phone;
        private String role;
        private Boolean isActive;
        private String address;
        private String profilePhoto;
        private Long ownerId;
        private String ownerAddress;
        private String ownerProfilePhoto;
        private String preferences;
        private String emergencyContact;
        private Long vetId;
        private String clinicName;
        private String specialization;
        private String clinicAddress;
        private String vetProfilePhoto;
        private String licenseNumber;
        private Integer yearsOfExperience;
        private String qualifications;
        private String bio;
        private String workingHours;
        private Boolean availableForTeleconsult;
        private Double consultationFee;

        public Builder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder isActive(Boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder profilePhoto(String profilePhoto) {
            this.profilePhoto = profilePhoto;
            return this;
        }

        public Builder ownerId(Long ownerId) {
            this.ownerId = ownerId;
            return this;
        }

        public Builder ownerAddress(String ownerAddress) {
            this.ownerAddress = ownerAddress;
            return this;
        }

        public Builder ownerProfilePhoto(String ownerProfilePhoto) {
            this.ownerProfilePhoto = ownerProfilePhoto;
            return this;
        }

        public Builder preferences(String preferences) {
            this.preferences = preferences;
            return this;
        }

        public Builder emergencyContact(String emergencyContact) {
            this.emergencyContact = emergencyContact;
            return this;
        }

        public Builder vetId(Long vetId) {
            this.vetId = vetId;
            return this;
        }

        public Builder clinicName(String clinicName) {
            this.clinicName = clinicName;
            return this;
        }

        public Builder specialization(String specialization) {
            this.specialization = specialization;
            return this;
        }

        public Builder clinicAddress(String clinicAddress) {
            this.clinicAddress = clinicAddress;
            return this;
        }

        public Builder vetProfilePhoto(String vetProfilePhoto) {
            this.vetProfilePhoto = vetProfilePhoto;
            return this;
        }

        public Builder licenseNumber(String licenseNumber) {
            this.licenseNumber = licenseNumber;
            return this;
        }

        public Builder yearsOfExperience(Integer yearsOfExperience) {
            this.yearsOfExperience = yearsOfExperience;
            return this;
        }

        public Builder qualifications(String qualifications) {
            this.qualifications = qualifications;
            return this;
        }

        public Builder bio(String bio) {
            this.bio = bio;
            return this;
        }

        public Builder workingHours(String workingHours) {
            this.workingHours = workingHours;
            return this;
        }

        public Builder availableForTeleconsult(Boolean availableForTeleconsult) {
            this.availableForTeleconsult = availableForTeleconsult;
            return this;
        }

        public Builder consultationFee(Double consultationFee) {
            this.consultationFee = consultationFee;
            return this;
        }

        public UserProfileResponse build() {
            UserProfileResponse response = new UserProfileResponse(userId, email, name, phone, role, isActive, ownerId,
                    ownerAddress, ownerProfilePhoto, preferences, emergencyContact, vetId,
                    clinicName, specialization, clinicAddress, vetProfilePhoto, licenseNumber,
                    yearsOfExperience, qualifications, bio, workingHours, availableForTeleconsult,
                    consultationFee);
            // Prefer explicitly set address/photo if provided; fall back to derived values
            if (this.address != null) {
                response.setAddress(this.address);
            }
            if (this.profilePhoto != null) {
                response.setProfilePhoto(this.profilePhoto);
            }
            return response;
        }
    }

    // Getters (abbreviated for space, all 23 fields)
    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public String getAddress() {
        return address;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public String getOwnerAddress() {
        return ownerAddress;
    }

    public String getOwnerProfilePhoto() {
        return ownerProfilePhoto;
    }

    public String getPreferences() {
        return preferences;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public Long getVetId() {
        return vetId;
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

    public String getVetProfilePhoto() {
        return vetProfilePhoto;
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

    // Setters (abbreviated for space, all 23 fields)
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public void setOwnerAddress(String ownerAddress) {
        this.ownerAddress = ownerAddress;
    }

    public void setOwnerProfilePhoto(String ownerProfilePhoto) {
        this.ownerProfilePhoto = ownerProfilePhoto;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public void setVetId(Long vetId) {
        this.vetId = vetId;
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

    public void setVetProfilePhoto(String vetProfilePhoto) {
        this.vetProfilePhoto = vetProfilePhoto;
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
