package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * AppointmentHistory Entity - Tracks status transitions and changes in appointments
 */
@Entity
@Table(name = "appointment_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Appointment.AppointmentStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Appointment.AppointmentStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String reason; // Reason for status change

    @Column(name = "changed_by_user_id")
    private Long changedByUserId; // Who made the change (vet or owner)

    @Column(name = "changed_by_role")
    private String changedByRole; // VET, OWNER, SYSTEM

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime changedAt;

    @Column(columnDefinition = "TEXT")
    private String notes; // Additional notes about the change
}