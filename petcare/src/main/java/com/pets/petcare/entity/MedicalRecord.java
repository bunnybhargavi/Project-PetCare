package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MedicalRecord Entity - Pet's medical history
 */
@Entity
@Table(name = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;
    
    @Column(nullable = false)
    private LocalDate visitDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordType recordType;
    
    private String vetName;
    
    private String diagnosis;
    
    @Column(columnDefinition = "TEXT")
    private String treatment;
    
    @Column(columnDefinition = "TEXT")
    private String prescriptions;
    
    private String attachmentUrl; // PDF reports
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    public enum RecordType {
        CHECKUP,
        VACCINATION,
        SURGERY,
        EMERGENCY,
        TREATMENT,
        LAB_TEST
    }
}
