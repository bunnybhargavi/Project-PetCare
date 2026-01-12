package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * NotificationPreference Entity - Stores user notification preferences
 */
@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Email notification preferences
    @Column(nullable = false)
    private Boolean emailBookingConfirmation = true;

    @Column(nullable = false)
    private Boolean email24HourReminder = true;

    @Column(nullable = false)
    private Boolean email1HourReminder = true;

    @Column(nullable = false)
    private Boolean emailDailyScheduleDigest = true;

    @Column(nullable = false)
    private Boolean emailNewBookingAlert = true;

    @Column(nullable = false)
    private Boolean emailCancellationNotice = true;

    // SMS notification preferences (for future implementation)
    @Column(nullable = false)
    private Boolean smsBookingConfirmation = false;

    @Column(nullable = false)
    private Boolean sms24HourReminder = false;

    @Column(nullable = false)
    private Boolean sms1HourReminder = false;

    // Push notification preferences (for future mobile app)
    @Column(nullable = false)
    private Boolean pushBookingConfirmation = true;

    @Column(nullable = false)
    private Boolean pushReminders = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}