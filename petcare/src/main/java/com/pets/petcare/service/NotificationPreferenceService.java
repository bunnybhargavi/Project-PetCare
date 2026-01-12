package com.pets.petcare.service;

import com.pets.petcare.dto.NotificationPreferenceRequest;
import com.pets.petcare.entity.NotificationPreference;
import com.pets.petcare.entity.User;
import com.pets.petcare.repository.NotificationPreferenceRepository;
import com.pets.petcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing user notification preferences
 */
@Service
public class NotificationPreferenceService {

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get user notification preferences (create default if not exists)
     */
    public NotificationPreference getUserPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
            .orElseGet(() -> createDefaultPreferences(userId));
    }

    /**
     * Update user notification preferences
     */
    @Transactional
    public NotificationPreference updatePreferences(Long userId, NotificationPreferenceRequest request) {
        NotificationPreference preferences = getUserPreferences(userId);

        // Update email preferences
        if (request.getEmailBookingConfirmation() != null) {
            preferences.setEmailBookingConfirmation(request.getEmailBookingConfirmation());
        }
        if (request.getEmail24HourReminder() != null) {
            preferences.setEmail24HourReminder(request.getEmail24HourReminder());
        }
        if (request.getEmail1HourReminder() != null) {
            preferences.setEmail1HourReminder(request.getEmail1HourReminder());
        }
        if (request.getEmailDailyScheduleDigest() != null) {
            preferences.setEmailDailyScheduleDigest(request.getEmailDailyScheduleDigest());
        }
        if (request.getEmailNewBookingAlert() != null) {
            preferences.setEmailNewBookingAlert(request.getEmailNewBookingAlert());
        }
        if (request.getEmailCancellationNotice() != null) {
            preferences.setEmailCancellationNotice(request.getEmailCancellationNotice());
        }

        // Update SMS preferences
        if (request.getSmsBookingConfirmation() != null) {
            preferences.setSmsBookingConfirmation(request.getSmsBookingConfirmation());
        }
        if (request.getSms24HourReminder() != null) {
            preferences.setSms24HourReminder(request.getSms24HourReminder());
        }
        if (request.getSms1HourReminder() != null) {
            preferences.setSms1HourReminder(request.getSms1HourReminder());
        }

        // Update push preferences
        if (request.getPushBookingConfirmation() != null) {
            preferences.setPushBookingConfirmation(request.getPushBookingConfirmation());
        }
        if (request.getPushReminders() != null) {
            preferences.setPushReminders(request.getPushReminders());
        }

        return preferenceRepository.save(preferences);
    }

    /**
     * Create default notification preferences for a user
     */
    @Transactional
    public NotificationPreference createDefaultPreferences(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        NotificationPreference preferences = new NotificationPreference();
        preferences.setUser(user);
        
        // Set default values (all email notifications enabled by default)
        preferences.setEmailBookingConfirmation(true);
        preferences.setEmail24HourReminder(true);
        preferences.setEmail1HourReminder(true);
        preferences.setEmailDailyScheduleDigest(true);
        preferences.setEmailNewBookingAlert(true);
        preferences.setEmailCancellationNotice(true);

        // SMS disabled by default
        preferences.setSmsBookingConfirmation(false);
        preferences.setSms24HourReminder(false);
        preferences.setSms1HourReminder(false);

        // Push notifications enabled by default
        preferences.setPushBookingConfirmation(true);
        preferences.setPushReminders(true);

        return preferenceRepository.save(preferences);
    }

    /**
     * Disable all notifications for a user
     */
    @Transactional
    public NotificationPreference disableAllNotifications(Long userId) {
        NotificationPreference preferences = getUserPreferences(userId);

        // Disable all email notifications
        preferences.setEmailBookingConfirmation(false);
        preferences.setEmail24HourReminder(false);
        preferences.setEmail1HourReminder(false);
        preferences.setEmailDailyScheduleDigest(false);
        preferences.setEmailNewBookingAlert(false);
        preferences.setEmailCancellationNotice(false);

        // Disable all SMS notifications
        preferences.setSmsBookingConfirmation(false);
        preferences.setSms24HourReminder(false);
        preferences.setSms1HourReminder(false);

        // Disable all push notifications
        preferences.setPushBookingConfirmation(false);
        preferences.setPushReminders(false);

        return preferenceRepository.save(preferences);
    }

    /**
     * Enable essential notifications only (booking confirmations and cancellations)
     */
    @Transactional
    public NotificationPreference enableEssentialOnly(Long userId) {
        NotificationPreference preferences = getUserPreferences(userId);

        // Enable essential email notifications
        preferences.setEmailBookingConfirmation(true);
        preferences.setEmailCancellationNotice(true);

        // Disable non-essential email notifications
        preferences.setEmail24HourReminder(false);
        preferences.setEmail1HourReminder(false);
        preferences.setEmailDailyScheduleDigest(false);
        preferences.setEmailNewBookingAlert(false);

        // Disable all SMS notifications
        preferences.setSmsBookingConfirmation(false);
        preferences.setSms24HourReminder(false);
        preferences.setSms1HourReminder(false);

        // Enable essential push notifications
        preferences.setPushBookingConfirmation(true);
        preferences.setPushReminders(false);

        return preferenceRepository.save(preferences);
    }

    /**
     * Check if user has opted in for a specific notification type
     */
    public boolean isNotificationEnabled(Long userId, String notificationType) {
        NotificationPreference preferences = getUserPreferences(userId);
        
        switch (notificationType.toLowerCase()) {
            case "email_booking_confirmation":
                return preferences.getEmailBookingConfirmation();
            case "email_24h_reminder":
                return preferences.getEmail24HourReminder();
            case "email_1h_reminder":
                return preferences.getEmail1HourReminder();
            case "email_daily_digest":
                return preferences.getEmailDailyScheduleDigest();
            case "email_booking_alert":
                return preferences.getEmailNewBookingAlert();
            case "email_cancellation":
                return preferences.getEmailCancellationNotice();
            case "sms_booking_confirmation":
                return preferences.getSmsBookingConfirmation();
            case "sms_24h_reminder":
                return preferences.getSms24HourReminder();
            case "sms_1h_reminder":
                return preferences.getSms1HourReminder();
            case "push_booking_confirmation":
                return preferences.getPushBookingConfirmation();
            case "push_reminders":
                return preferences.getPushReminders();
            default:
                return false;
        }
    }
}