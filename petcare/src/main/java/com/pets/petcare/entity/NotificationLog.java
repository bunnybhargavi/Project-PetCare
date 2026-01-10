package com.pets.petcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * NotificationLog Entity - Tracks notification delivery status and failures
 */
@Entity
@Table(name = "notification_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment; // Optional - for appointment-related notifications

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    @Column(nullable = false)
    private String recipient; // Email address or phone number

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String errorMessage; // If delivery failed

    @Column(nullable = false)
    private Integer retryCount = 0;

    @Column(nullable = false)
    private Integer maxRetries = 3;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime sentAt;

    private LocalDateTime deliveredAt;

    public enum NotificationType {
        BOOKING_CONFIRMATION,
        BOOKING_ALERT,
        REMINDER_24H,
        REMINDER_1H,
        DAILY_SCHEDULE_DIGEST,
        CANCELLATION_NOTICE,
        STATUS_UPDATE
    }

    public enum NotificationChannel {
        EMAIL,
        SMS,
        PUSH
    }

    public enum DeliveryStatus {
        PENDING,
        SENT,
        DELIVERED,
        FAILED,
        CANCELLED
    }
}