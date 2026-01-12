package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * HealthMeasurement Entity - Tracks dynamic health measurements based on vet requirements
 */
@Entity
@Table(name = "health_measurements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthMeasurement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;
    
    @Column(nullable = false)
    private LocalDate measurementDate;
    
    // Standard measurements
    private Double weight; // in kg
    private Double temperature; // in Celsius
    
    // Dynamic measurement fields
    private String measurementType; // e.g., "Blood Pressure", "Heart Rate", "Blood Sugar"
    private String value; // flexible value field
    private String unit; // e.g., "mmHg", "bpm", "mg/dL"
    
    // Additional health indicators
    private Double heartRate; // bpm
    private String bloodPressure; // e.g., "120/80"
    private Double bloodSugar; // mg/dL
    private Double respiratoryRate; // breaths per minute
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    // Vet who recorded this measurement
    @Column(name = "recorded_by_vet_id")
    private Long recordedByVetId;
    
    private String vetName;
}
