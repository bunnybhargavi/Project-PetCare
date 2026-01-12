package com.pets.petcare.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Pet Entity - Digital Passport for Pets
 */
@Entity
@Table(name = "pets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owner relationship
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private PetOwner owner;

    // Basic Info
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String species; // Dog, Cat, Bird, etc.

    private String breed;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String photo; // Profile photo URL

    private String microchipId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Health Status Ring Color (for UI)
    @Enumerated(EnumType.STRING)
    private HealthStatus healthStatus = HealthStatus.HEALTHY;

    // Activity Tracking
    private Integer walkStreak = 0; // Gamification: days walked consecutively

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Cascade delete relationships
    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @lombok.ToString.Exclude
    private java.util.List<Appointment> appointments;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @lombok.ToString.Exclude
    private java.util.List<MedicalRecord> medicalRecords;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @lombok.ToString.Exclude
    private java.util.List<Vaccination> vaccinations;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @lombok.ToString.Exclude
    private java.util.List<HealthMeasurement> healthMeasurements;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @lombok.ToString.Exclude
    private java.util.List<Reminder> reminders;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private BigDecimal weight;

    public enum Gender {
        MALE, FEMALE, UNKNOWN
    }

    public enum HealthStatus {
        HEALTHY, // Green ring
        DUE_SOON, // Yellow ring - vaccination due
        OVERDUE, // Red ring - checkup overdue
        UNDER_TREATMENT // Orange ring
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
}