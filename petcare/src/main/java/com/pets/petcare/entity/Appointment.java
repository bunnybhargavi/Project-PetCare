package com.pets.petcare.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "appointments", "medicalRecords", "vaccinations",
            "healthMeasurements", "reminders" })
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "appointments", "user" })
    private Veterinarian veterinarian;

    // Optional link to the original slot
    @OneToOne
    @JoinColumn(name = "slot_id")
    private AppointmentSlot slot;

    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
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
    private String clinicAddress; // For IN_CLINIC appointments

    @Column(columnDefinition = "TEXT")
    private String parkingInfo; // Parking information for IN_CLINIC

    private String directionsUrl; // Google Maps or similar directions URL

    @Column(columnDefinition = "TEXT")
    private String notes; // Vet notes

    @Column(columnDefinition = "TEXT")
    private String prescription;

    @Column(name = "reference_number", unique = true)
    private String referenceNumber;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum AppointmentType {
        TELECONSULT,
        IN_CLINIC,
        VIDEO
    }

    public enum AppointmentStatus {
        PENDING,
        CONFIRMED,
        COMPLETED,
        CANCELLED,
        NO_SHOW
    }
}
