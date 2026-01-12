package com.pets.petcare.service;

import com.pets.petcare.entity.*;
import com.pets.petcare.repository.NotificationLogRepository;
import com.pets.petcare.repository.NotificationPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Enhanced notification service with queue-based delivery and preference
 * management
 */
@Service
public class NotificationService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter
            .ofPattern("MMM dd, yyyy 'at' hh:mm a");

    /**
     * Send booking confirmation notification to pet owner
     */
    @Async
    @Transactional
    public CompletableFuture<Void> sendBookingConfirmation(Appointment appointment) {
        User owner = appointment.getPet().getOwner().getUser();

        if (!shouldSendNotification(owner.getId(), "emailBookingConfirmation")) {
            return CompletableFuture.completedFuture(null);
        }

        String subject = "Appointment Confirmed - " + appointment.getReferenceNumber();
        String content = buildBookingConfirmationContent(appointment);

        return sendNotificationAsync(
                owner,
                appointment,
                NotificationLog.NotificationType.BOOKING_CONFIRMATION,
                subject,
                content);
    }

    /**
     * Send booking alert to veterinarian
     */
    @Async
    @Transactional
    public CompletableFuture<Void> sendBookingAlert(Appointment appointment) {
        User vet = appointment.getVeterinarian().getUser();

        if (!shouldSendNotification(vet.getId(), "emailNewBookingAlert")) {
            return CompletableFuture.completedFuture(null);
        }

        String subject = "New Appointment Booking - " + appointment.getReferenceNumber();
        String content = buildBookingAlertContent(appointment);

        return sendNotificationAsync(
                vet,
                appointment,
                NotificationLog.NotificationType.BOOKING_ALERT,
                subject,
                content);
    }

    /**
     * Send 24-hour reminder to pet owner
     */
    @Async
    @Transactional
    public CompletableFuture<Void> send24HourReminder(Appointment appointment) {
        User owner = appointment.getPet().getOwner().getUser();

        if (!shouldSendNotification(owner.getId(), "email24HourReminder")) {
            return CompletableFuture.completedFuture(null);
        }

        String subject = "Appointment Reminder - Tomorrow at " +
                appointment.getAppointmentDate().format(DateTimeFormatter.ofPattern("hh:mm a"));
        String content = build24HourReminderContent(appointment);

        return sendNotificationAsync(
                owner,
                appointment,
                NotificationLog.NotificationType.REMINDER_24H,
                subject,
                content);
    }

    /**
     * Send 1-hour reminder to pet owner
     */
    @Async
    @Transactional
    public CompletableFuture<Void> send1HourReminder(Appointment appointment) {
        User owner = appointment.getPet().getOwner().getUser();

        if (!shouldSendNotification(owner.getId(), "email1HourReminder")) {
            return CompletableFuture.completedFuture(null);
        }

        String subject = "Appointment Starting Soon - " + appointment.getReferenceNumber();
        String content = build1HourReminderContent(appointment);

        return sendNotificationAsync(
                owner,
                appointment,
                NotificationLog.NotificationType.REMINDER_1H,
                subject,
                content);
    }

    /**
     * Send daily schedule digest to veterinarian
     */
    @Async
    @Transactional
    public CompletableFuture<Void> sendDailyScheduleDigest(User vet, List<Appointment> todayAppointments) {
        if (!shouldSendNotification(vet.getId(), "emailDailyScheduleDigest")) {
            return CompletableFuture.completedFuture(null);
        }

        String subject = "Daily Schedule - " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
        String content = buildDailyScheduleContent(todayAppointments);

        return sendNotificationAsync(
                vet,
                null, // No specific appointment
                NotificationLog.NotificationType.DAILY_SCHEDULE_DIGEST,
                subject,
                content);
    }

    /**
     * Send cancellation notice
     */
    @Async
    @Transactional
    public CompletableFuture<Void> sendCancellationNotice(Appointment appointment, User recipient) {
        if (!shouldSendNotification(recipient.getId(), "emailCancellationNotice")) {
            return CompletableFuture.completedFuture(null);
        }

        String subject = "Appointment Cancelled - " + appointment.getReferenceNumber();
        String content = buildCancellationContent(appointment);

        return sendNotificationAsync(
                recipient,
                appointment,
                NotificationLog.NotificationType.CANCELLATION_NOTICE,
                subject,
                content);
    }

    /**
     * Retry failed notifications
     */
    @Transactional
    public void retryFailedNotifications() {
        List<NotificationLog> failedNotifications = notificationLogRepository.findFailedNotificationsForRetry();

        for (NotificationLog notification : failedNotifications) {
            try {
                boolean success = emailService.sendEmail(
                        notification.getRecipient(),
                        notification.getSubject(),
                        notification.getContent());

                notification.setRetryCount(notification.getRetryCount() + 1);

                if (success) {
                    notification.setStatus(NotificationLog.DeliveryStatus.SENT);
                    notification.setSentAt(LocalDateTime.now());
                } else if (notification.getRetryCount() >= notification.getMaxRetries()) {
                    notification.setStatus(NotificationLog.DeliveryStatus.FAILED);
                    notification.setErrorMessage("Max retries exceeded");
                }

                notificationLogRepository.save(notification);
            } catch (Exception e) {
                notification.setRetryCount(notification.getRetryCount() + 1);
                notification.setErrorMessage(e.getMessage());

                if (notification.getRetryCount() >= notification.getMaxRetries()) {
                    notification.setStatus(NotificationLog.DeliveryStatus.FAILED);
                }

                notificationLogRepository.save(notification);
            }
        }
    }

    /**
     * Check if notification should be sent based on user preferences
     */
    private boolean shouldSendNotification(Long userId, String preferenceField) {
        return preferenceRepository.findByUserId(userId)
                .map(pref -> {
                    try {
                        return (Boolean) pref.getClass().getDeclaredField(preferenceField).get(pref);
                    } catch (Exception e) {
                        return true; // Default to sending if preference not found
                    }
                })
                .orElse(true); // Default to sending if no preferences set
    }

    /**
     * Send notification asynchronously and log the attempt
     */
    private CompletableFuture<Void> sendNotificationAsync(User user, Appointment appointment,
            NotificationLog.NotificationType type, String subject, String content) {

        // Create notification log entry
        NotificationLog log = new NotificationLog();
        log.setUser(user);
        log.setAppointment(appointment);
        log.setType(type);
        log.setChannel(NotificationLog.NotificationChannel.EMAIL);
        log.setRecipient(user.getEmail());
        log.setSubject(subject);
        log.setContent(content);
        log.setStatus(NotificationLog.DeliveryStatus.PENDING);

        NotificationLog savedLog = notificationLogRepository.save(log);

        return CompletableFuture.runAsync(() -> {
            try {
                boolean success = emailService.sendEmail(user.getEmail(), subject, content);

                savedLog.setStatus(
                        success ? NotificationLog.DeliveryStatus.SENT : NotificationLog.DeliveryStatus.FAILED);
                savedLog.setSentAt(LocalDateTime.now());

                if (!success) {
                    savedLog.setErrorMessage("Email delivery failed");
                }

                notificationLogRepository.save(savedLog);
            } catch (Exception e) {
                savedLog.setStatus(NotificationLog.DeliveryStatus.FAILED);
                savedLog.setErrorMessage(e.getMessage());
                notificationLogRepository.save(savedLog);
            }
        });
    }

    // Content builders for different notification types

    private String buildBookingConfirmationContent(Appointment appointment) {
        StringBuilder content = new StringBuilder();
        content.append("Dear ").append(appointment.getPet().getOwner().getUser().getName()).append(",\n\n");
        content.append("Your appointment has been confirmed!\n\n");
        content.append("Appointment Details:\n");
        content.append("Reference Number: ").append(appointment.getReferenceNumber()).append("\n");
        content.append("Date & Time: ").append(appointment.getAppointmentDate().format(DATETIME_FORMATTER))
                .append("\n");
        content.append("Pet: ").append(appointment.getPet().getName()).append("\n");
        content.append("Veterinarian: ").append(appointment.getVeterinarian().getUser().getName()).append("\n");
        content.append("Clinic: ").append(appointment.getVeterinarian().getClinicName()).append("\n");
        content.append("Type: ").append(appointment.getType()).append("\n");

        if (appointment.getType() == Appointment.AppointmentType.TELECONSULT && appointment.getMeetingLink() != null) {
            content.append("Video Meeting Link: ").append(appointment.getMeetingLink()).append("\n");
        } else if (appointment.getType() == Appointment.AppointmentType.IN_CLINIC) {
            content.append("Clinic Address: ").append(appointment.getVeterinarian().getClinicAddress()).append("\n");
        }

        if (appointment.getReason() != null) {
            content.append("Reason: ").append(appointment.getReason()).append("\n");
        }

        content.append("\nPlease arrive 10 minutes early for in-clinic appointments.\n");
        content.append("For video consultations, test your connection beforehand.\n\n");
        content.append("Best regards,\nPetCare Team");

        return content.toString();
    }

    private String buildBookingAlertContent(Appointment appointment) {
        StringBuilder content = new StringBuilder();
        content.append("Dear Dr. ").append(appointment.getVeterinarian().getUser().getName()).append(",\n\n");
        content.append("You have a new appointment booking!\n\n");
        content.append("Appointment Details:\n");
        content.append("Reference Number: ").append(appointment.getReferenceNumber()).append("\n");
        content.append("Date & Time: ").append(appointment.getAppointmentDate().format(DATETIME_FORMATTER))
                .append("\n");
        content.append("Pet: ").append(appointment.getPet().getName()).append(" (")
                .append(appointment.getPet().getSpecies()).append(")\n");
        content.append("Owner: ").append(appointment.getPet().getOwner().getUser().getName()).append("\n");
        content.append("Contact: ").append(appointment.getPet().getOwner().getUser().getEmail()).append("\n");
        content.append("Type: ").append(appointment.getType()).append("\n");

        if (appointment.getReason() != null) {
            content.append("Reason for Visit: ").append(appointment.getReason()).append("\n");
        }

        content.append("\nPlease review and confirm the appointment in your dashboard.\n\n");
        content.append("Best regards,\nPetCare Team");

        return content.toString();
    }

    private String build24HourReminderContent(Appointment appointment) {
        StringBuilder content = new StringBuilder();
        content.append("Dear ").append(appointment.getPet().getOwner().getUser().getName()).append(",\n\n");
        content.append("This is a reminder that you have an appointment tomorrow!\n\n");
        content.append("Appointment Details:\n");
        content.append("Date & Time: ").append(appointment.getAppointmentDate().format(DATETIME_FORMATTER))
                .append("\n");
        content.append("Pet: ").append(appointment.getPet().getName()).append("\n");
        content.append("Veterinarian: ").append(appointment.getVeterinarian().getUser().getName()).append("\n");
        content.append("Type: ").append(appointment.getType()).append("\n");

        if (appointment.getType() == Appointment.AppointmentType.IN_CLINIC) {
            content.append("Clinic Address: ").append(appointment.getVeterinarian().getClinicAddress()).append("\n");
            content.append("\nPreparation:\n");
            content.append("- Bring your pet's vaccination records\n");
            content.append("- Arrive 10 minutes early\n");
            content.append("- Bring any medications your pet is currently taking\n");
        } else {
            content.append("Video Meeting Link: ").append(appointment.getMeetingLink()).append("\n");
            content.append("\nPreparation:\n");
            content.append("- Test your internet connection and camera\n");
            content.append("- Ensure good lighting for the video call\n");
            content.append("- Have your pet's information ready\n");
        }

        content.append("\nCancellation Policy: Please cancel at least 2 hours in advance.\n\n");
        content.append("Best regards,\nPetCare Team");

        return content.toString();
    }

    private String build1HourReminderContent(Appointment appointment) {
        StringBuilder content = new StringBuilder();
        content.append("Dear ").append(appointment.getPet().getOwner().getUser().getName()).append(",\n\n");
        content.append("Your appointment is starting soon!\n\n");
        content.append("Appointment: ").append(appointment.getAppointmentDate().format(DATETIME_FORMATTER))
                .append("\n");
        content.append("Pet: ").append(appointment.getPet().getName()).append("\n");
        content.append("Veterinarian: ").append(appointment.getVeterinarian().getUser().getName()).append("\n");

        if (appointment.getType() == Appointment.AppointmentType.TELECONSULT) {
            content.append("\nJoin Video Call: ").append(appointment.getMeetingLink()).append("\n");
            content.append("Please join 5 minutes early to test your connection.\n");
        } else {
            content.append("\nClinic Address: ").append(appointment.getVeterinarian().getClinicAddress()).append("\n");
            content.append("Please arrive now if you haven't already.\n");
        }

        content.append("\nNeed to cancel? Please call us immediately.\n\n");
        content.append("Best regards,\nPetCare Team");

        return content.toString();
    }

    private String buildDailyScheduleContent(List<Appointment> appointments) {
        StringBuilder content = new StringBuilder();
        content.append("Good morning!\n\n");
        content.append("Here's your schedule for today:\n\n");

        if (appointments.isEmpty()) {
            content.append("No appointments scheduled for today. Enjoy your day!\n");
        } else {
            for (Appointment apt : appointments) {
                content.append("• ").append(apt.getAppointmentDate().format(DateTimeFormatter.ofPattern("hh:mm a")))
                        .append(" - ").append(apt.getPet().getName())
                        .append(" (").append(apt.getPet().getSpecies()).append(")")
                        .append(" - ").append(apt.getType())
                        .append(" - Owner: ").append(apt.getPet().getOwner().getUser().getName());

                if (apt.getReason() != null) {
                    content.append(" - ").append(apt.getReason());
                }
                content.append("\n");
            }
        }

        content.append("\nHave a great day!\nPetCare Team");
        return content.toString();
    }

    private String buildCancellationContent(Appointment appointment) {
        StringBuilder content = new StringBuilder();
        content.append("Dear ").append(appointment.getPet().getOwner().getUser().getName()).append(",\n\n");
        content.append("Your appointment has been cancelled.\n\n");
        content.append("Cancelled Appointment Details:\n");
        content.append("Reference Number: ").append(appointment.getReferenceNumber()).append("\n");
        content.append("Date & Time: ").append(appointment.getAppointmentDate().format(DATETIME_FORMATTER))
                .append("\n");
        content.append("Pet: ").append(appointment.getPet().getName()).append("\n");
        content.append("Veterinarian: ").append(appointment.getVeterinarian().getUser().getName()).append("\n");

        content.append("\nIf you need to reschedule, please book a new appointment through our platform.\n");
        content.append("If you have any questions, please contact us.\n\n");
        content.append("Best regards,\nPetCare Team");

        return content.toString();
    }
}