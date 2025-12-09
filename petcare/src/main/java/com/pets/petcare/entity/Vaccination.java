package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Vaccination Entity - Tracks pet vaccinations
 */
@Entity
@Table(name = "vaccinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vaccination {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;
    
    @Column(nullable = false)
    private String vaccineName;
    
    @Column(nullable = false)
    private LocalDate dateGiven;
    
    private LocalDate nextDueDate;
    
    private String batchNumber;
    
    private String veterinarianName;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}