package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * AppointmentSlot Entity - Represents availability of a Veterinarian
 */
@Entity
@Table(name = "appointment_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinarian_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Veterinarian veterinarian;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status = SlotStatus.AVAILABLE;

    // What kind of appointment is this slot suitable for?
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotType mode = SlotType.BOTH;

    @Column(nullable = false)
    private Integer capacity = 1; // How many appointments this slot can handle

    @Column(nullable = false)
    private Integer bookedCount = 0; // Current number of bookings

    public enum SlotStatus {
        AVAILABLE,
        BOOKED,
        CANCELLED
    }

    public enum SlotType {
        TELECONSULT,
        IN_CLINIC,
        BOTH
    }
}
