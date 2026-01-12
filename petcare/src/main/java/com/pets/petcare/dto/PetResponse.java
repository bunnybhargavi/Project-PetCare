package com.pets.petcare.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PetResponse - Pet data returned to frontend
 */
public class PetResponse {
    
    private Long id;
    private Long ownerId;
    private String name;
    private String species;
    private String breed;
    private LocalDate dateOfBirth;
    private String gender;
    private String photo;
    private String microchipId;
    private String notes;
    private BigDecimal weight; // Added weight field
    
    // UI Helper fields
    private String healthStatus; // HEALTHY, DUE_SOON, OVERDUE, UNDER_TREATMENT
    private Integer walkStreak;
    private Integer age; // Calculated age in years
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public PetResponse() {}

    // Builder pattern implementation
    public static PetResponseBuilder builder() {
        return new PetResponseBuilder();
    }

    public static class PetResponseBuilder {
        private Long id;
        private Long ownerId;
        private String name;
        private String species;
        private String breed;
        private LocalDate dateOfBirth;
        private String gender;
        private String photo;
        private String microchipId;
        private String notes;
        private BigDecimal weight; // Added weight field
        private String healthStatus;
        private Integer walkStreak;
        private Integer age;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public PetResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PetResponseBuilder ownerId(Long ownerId) {
            this.ownerId = ownerId;
            return this;
        }

        public PetResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public PetResponseBuilder species(String species) {
            this.species = species;
            return this;
        }

        public PetResponseBuilder breed(String breed) {
            this.breed = breed;
            return this;
        }

        public PetResponseBuilder dateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }

        public PetResponseBuilder gender(String gender) {
            this.gender = gender;
            return this;
        }

        public PetResponseBuilder photo(String photo) {
            this.photo = photo;
            return this;
        }

        public PetResponseBuilder microchipId(String microchipId) {
            this.microchipId = microchipId;
            return this;
        }

        public PetResponseBuilder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public PetResponseBuilder weight(BigDecimal weight) {
            this.weight = weight;
            return this;
        }

        public PetResponseBuilder healthStatus(String healthStatus) {
            this.healthStatus = healthStatus;
            return this;
        }

        public PetResponseBuilder walkStreak(Integer walkStreak) {
            this.walkStreak = walkStreak;
            return this;
        }

        public PetResponseBuilder age(Integer age) {
            this.age = age;
            return this;
        }

        public PetResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PetResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public PetResponse build() {
            PetResponse response = new PetResponse();
            response.id = this.id;
            response.ownerId = this.ownerId;
            response.name = this.name;
            response.species = this.species;
            response.breed = this.breed;
            response.dateOfBirth = this.dateOfBirth;
            response.gender = this.gender;
            response.photo = this.photo;
            response.microchipId = this.microchipId;
            response.notes = this.notes;
            response.weight = this.weight; // Added weight field
            response.healthStatus = this.healthStatus;
            response.walkStreak = this.walkStreak;
            response.age = this.age;
            response.createdAt = this.createdAt;
            response.updatedAt = this.updatedAt;
            return response;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getMicrochipId() {
        return microchipId;
    }

    public void setMicrochipId(String microchipId) {
        this.microchipId = microchipId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public Integer getWalkStreak() {
        return walkStreak;
    }

    public void setWalkStreak(Integer walkStreak) {
        this.walkStreak = walkStreak;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
