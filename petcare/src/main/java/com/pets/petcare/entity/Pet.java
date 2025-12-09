package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
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
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public enum Gender {
        MALE, FEMALE, UNKNOWN
    }
    
    public enum HealthStatus {
        HEALTHY,        // Green ring
        DUE_SOON,       // Yellow ring - vaccination due
        OVERDUE,        // Red ring - checkup overdue
        UNDER_TREATMENT // Orange ring
    }
}