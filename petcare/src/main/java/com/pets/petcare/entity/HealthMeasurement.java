package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * HealthMeasurement Entity - Tracks weight, temperature trends
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
    
    private Double weight; // in kg
    
    private Double temperature; // in Celsius
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
