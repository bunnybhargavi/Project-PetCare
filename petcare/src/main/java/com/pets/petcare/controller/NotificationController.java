package com.pets.petcare.controller;

import com.pets.petcare.dto.ApiResponse;
import com.pets.petcare.dto.NotificationPreferenceRequest;
import com.pets.petcare.entity.NotificationLog;
import com.pets.petcare.entity.NotificationPreference;
import com.pets.petcare.repository.NotificationLogRepository;
import com.pets.petcare.service.NotificationPreferenceService;
import com.pets.petcare.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for notification preferences and logs
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationPreferenceService preferenceService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    /**
     * Get user notification preferences
     */
    @GetMapping("/preferences/{userId}")
    public ResponseEntity<ApiResponse<NotificationPreference>> getUserPreferences(@PathVariable Long userId) {
        try {
            NotificationPreference preferences = preferenceService.getUserPreferences(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Preferences retrieved successfully", preferences));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to get preferences: " + e.getMessage(), null));
        }
    }

    /**
     * Update user notification preferences
     */
    @PutMapping("/preferences/{userId}")
    public ResponseEntity<ApiResponse<NotificationPreference>> updatePreferences(
            @PathVariable Long userId,
            @RequestBody NotificationPreferenceRequest request) {
        try {
            NotificationPreference updated = preferenceService.updatePreferences(userId, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Preferences updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to update preferences: " + e.getMessage(), null));
        }
    }

    /**
     * Create default notification preferences for a user
     */
    @PostMapping("/preferences/{userId}/default")
    public ResponseEntity<ApiResponse<NotificationPreference>> createDefaultPreferences(@PathVariable Long userId) {
        try {
            NotificationPreference preferences = preferenceService.createDefaultPreferences(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Default preferences created", preferences));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to create preferences: " + e.getMessage(), null));
        }
    }

    /**
     * Disable all notifications for a user
     */
    @PostMapping("/preferences/{userId}/disable-all")
    public ResponseEntity<ApiResponse<NotificationPreference>> disableAllNotifications(@PathVariable Long userId) {
        try {
            NotificationPreference preferences = preferenceService.disableAllNotifications(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "All notifications disabled", preferences));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to disable notifications: " + e.getMessage(), null));
        }
    }

    /**
     * Enable essential notifications only
     */
    @PostMapping("/preferences/{userId}/essential-only")
    public ResponseEntity<ApiResponse<NotificationPreference>> enableEssentialOnly(@PathVariable Long userId) {
        try {
            NotificationPreference preferences = preferenceService.enableEssentialOnly(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Essential notifications enabled", preferences));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to update preferences: " + e.getMessage(), null));
        }
    }

    /**
     * Check if a specific notification type is enabled for user
     */
    @GetMapping("/preferences/{userId}/check/{notificationType}")
    public ResponseEntity<ApiResponse<Boolean>> checkNotificationEnabled(
            @PathVariable Long userId,
            @PathVariable String notificationType) {
        try {
            boolean enabled = preferenceService.isNotificationEnabled(userId, notificationType);
            return ResponseEntity.ok(new ApiResponse<>(true, "Notification status checked", enabled));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to check notification status: " + e.getMessage(), null));
        }
    }

    /**
     * Get notification logs for a user
     */
    @GetMapping("/logs/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getUserNotificationLogs(@PathVariable Long userId) {
        try {
            List<NotificationLog> logs = notificationLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Notification logs retrieved", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to get logs: " + e.getMessage(), null));
        }
    }

    /**
     * Get notification logs for an appointment
     */
    @GetMapping("/logs/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getAppointmentNotificationLogs(
            @PathVariable Long appointmentId) {
        try {
            List<NotificationLog> logs = notificationLogRepository.findByAppointmentIdOrderByCreatedAtDesc(appointmentId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Appointment notification logs retrieved", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to get logs: " + e.getMessage(), null));
        }
    }

    /**
     * Get recent notification logs (last 24 hours)
     */
    @GetMapping("/logs/recent")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getRecentNotificationLogs() {
        try {
            LocalDateTime since = LocalDateTime.now().minusHours(24);
            List<NotificationLog> logs = notificationLogRepository.findRecentNotifications(since);
            return ResponseEntity.ok(new ApiResponse<>(true, "Recent notification logs retrieved", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to get recent logs: " + e.getMessage(), null));
        }
    }

    /**
     * Get notification statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<List<Object[]>>> getNotificationStats() {
        try {
            List<Object[]> stats = notificationLogRepository.countByStatus();
            return ResponseEntity.ok(new ApiResponse<>(true, "Notification statistics retrieved", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to get stats: " + e.getMessage(), null));
        }
    }

    /**
     * Retry failed notifications (admin endpoint)
     */
    @PostMapping("/retry-failed")
    public ResponseEntity<ApiResponse<String>> retryFailedNotifications() {
        try {
            notificationService.retryFailedNotifications();
            return ResponseEntity.ok(new ApiResponse<>(true, "Failed notifications retry initiated", "Retry process started"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Failed to retry notifications: " + e.getMessage(), null));
        }
    }
}