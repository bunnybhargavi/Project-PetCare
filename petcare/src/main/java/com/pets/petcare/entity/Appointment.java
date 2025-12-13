package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Appointment Entity - Records a booking between a Pet and a Veterinarian
 */
@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    private Veterinarian veterinarian;

    // Optional link to the original slot
    @OneToOne
    @JoinColumn(name = "slot_id")
    private AppointmentSlot slot;

    @Column(nullable = false)
    private LocalDateTime appointmentDate; // Represents Start Time

    private Integer durationMinutes = 30;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String reason;

    private String meetingLink; // For Teleconsult

    @Column(columnDefinition = "TEXT")
    private String notes; // Vet notes

    @Column(columnDefinition = "TEXT")
    private String prescription;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum AppointmentType {
        VIDEO,
        IN_CLINIC
    }

    public enum AppointmentStatus {
        PENDING,
        CONFIRMED,
        COMPLETED,
        CANCELLED,
        NO_SHOW
    }
}
