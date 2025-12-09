package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Reminder Entity - Vaccination & checkup reminders
 */
@Entity
@Table(name = "reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reminder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;
    
    @Column(nullable = false)
    private String title;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReminderType type;
    
    @Column(nullable = false)
    private LocalDate dueDate;
    
    private Boolean isRecurring = false;
    
    private String repeatRule; // e.g., "YEARLY", "MONTHLY"
    
    @Enumerated(EnumType.STRING)
    private ReminderStatus status = ReminderStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private Boolean emailSent = false;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    public enum ReminderType {
        VACCINATION,
        CHECKUP,
        MEDICATION,
        GROOMING,
        DEWORMING,
        CUSTOM
    }
    
    public enum ReminderStatus {
        PENDING,
        COMPLETED,
        OVERDUE,
        CANCELLED
    }
}