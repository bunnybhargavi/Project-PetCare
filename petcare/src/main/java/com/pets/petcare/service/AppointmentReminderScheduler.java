package com.pets.petcare.service;

import com.pets.petcare.entity.Appointment;
import com.pets.petcare.entity.User;
import com.pets.petcare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled service for sending appointment reminders and daily digests
 */
@Service
public class AppointmentReminderScheduler {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Send 24-hour reminders every hour
     * Runs every hour to catch appointments that are 24 hours away
     */
    @Scheduled(fixedRate = 3600000) // Every hour (3600000 ms)
    public void send24HourReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderTime = now.plusHours(24);
        
        // Find appointments that are approximately 24 hours away (within 1 hour window)
        LocalDateTime windowStart = reminderTime.minusMinutes(30);
        LocalDateTime windowEnd = reminderTime.plusMinutes(30);
        
        List<Appointment> appointments = appointmentRepository.findConfirmedAppointmentsInTimeRange(
            windowStart, windowEnd);
        
        for (Appointment appointment : appointments) {
            try {
                notificationService.send24HourReminder(appointment);
            } catch (Exception e) {
                System.err.println("Failed to send 24-hour reminder for appointment " + 
                    appointment.getId() + ": " + e.getMessage());
            }
        }
        
        if (!appointments.isEmpty()) {
            System.out.println("Sent 24-hour reminders for " + appointments.size() + " appointments");
        }
    }

    /**
     * Send 1-hour reminders every 15 minutes
     * More frequent checks for 1-hour reminders to ensure timely delivery
     */
    @Scheduled(fixedRate = 900000) // Every 15 minutes (900000 ms)
    public void send1HourReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderTime = now.plusHours(1);
        
        // Find appointments that are approximately 1 hour away (within 15 minute window)
        LocalDateTime windowStart = reminderTime.minusMinutes(7);
        LocalDateTime windowEnd = reminderTime.plusMinutes(8);
        
        List<Appointment> appointments = appointmentRepository.findConfirmedAppointmentsInTimeRange(
            windowStart, windowEnd);
        
        for (Appointment appointment : appointments) {
            try {
                notificationService.send1HourReminder(appointment);
            } catch (Exception e) {
                System.err.println("Failed to send 1-hour reminder for appointment " + 
                    appointment.getId() + ": " + e.getMessage());
            }
        }
        
        if (!appointments.isEmpty()) {
            System.out.println("Sent 1-hour reminders for " + appointments.size() + " appointments");
        }
    }

    /**
     * Send daily schedule digest to veterinarians
     * Runs every day at 7:00 AM
     */
    @Scheduled(cron = "0 0 7 * * *") // Every day at 7:00 AM
    public void sendDailyScheduleDigest() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        
        // Get all appointments for today
        List<Appointment> todayAppointments = appointmentRepository.findAppointmentsForDateRange(
            startOfDay, endOfDay);
        
        // Group appointments by veterinarian
        todayAppointments.stream()
            .collect(java.util.stream.Collectors.groupingBy(Appointment::getVeterinarian))
            .forEach((vet, appointments) -> {
                try {
                    User vetUser = vet.getUser();
                    notificationService.sendDailyScheduleDigest(vetUser, appointments);
                } catch (Exception e) {
                    System.err.println("Failed to send daily digest to vet " + 
                        vet.getId() + ": " + e.getMessage());
                }
            });
        
        System.out.println("Sent daily schedule digests for " + 
            todayAppointments.stream().map(Appointment::getVeterinarian).distinct().count() + " veterinarians");
    }

    /**
     * Retry failed notifications
     * Runs every 30 minutes to retry failed notification deliveries
     */
    @Scheduled(fixedRate = 1800000) // Every 30 minutes (1800000 ms)
    public void retryFailedNotifications() {
        try {
            notificationService.retryFailedNotifications();
        } catch (Exception e) {
            System.err.println("Failed to retry notifications: " + e.getMessage());
        }
    }

    /**
     * Clean up old notification logs
     * Runs daily at 2:00 AM to clean up logs older than 30 days
     */
    @Scheduled(cron = "0 0 2 * * *") // Every day at 2:00 AM
    public void cleanupOldNotificationLogs() {
        // This would be implemented to clean up old notification logs
        // to prevent the database from growing too large
        System.out.println("Notification log cleanup scheduled (implementation pending)");
    }

    /**
     * Update appointment statuses
     * Runs every hour to update appointment statuses (e.g., mark as NO_SHOW)
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    public void updateAppointmentStatuses() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoffTime = now.minusHours(1); // 1 hour past appointment time
        
        // Find confirmed appointments that are past their time and should be marked as NO_SHOW
        List<Appointment> overdueAppointments = appointmentRepository.findOverdueConfirmedAppointments(cutoffTime);
        
        for (Appointment appointment : overdueAppointments) {
            try {
                // Mark as NO_SHOW if it's been more than 1 hour past appointment time
                appointment.setStatus(Appointment.AppointmentStatus.NO_SHOW);
                appointmentRepository.save(appointment);
                
                // Optionally send notification about no-show
                // notificationService.sendNoShowNotification(appointment);
                
            } catch (Exception e) {
                System.err.println("Failed to update status for appointment " + 
                    appointment.getId() + ": " + e.getMessage());
            }
        }
        
        if (!overdueAppointments.isEmpty()) {
            System.out.println("Updated status for " + overdueAppointments.size() + " overdue appointments");
        }
    }
}