package com.pets.petcare.service;

import com.pets.petcare.entity.Appointment;
import com.pets.petcare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service to handle appointment reminders and notifications
 */
@Service
public class AppointmentReminderService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");

    /**
     * Send reminder 24 hours before appointment
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void send24HourReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in24Hours = now.plusHours(24);
        LocalDateTime in25Hours = now.plusHours(25);

        List<Appointment> upcomingAppointments = appointmentRepository.findAppointmentsInDateRange(
                in24Hours,
                in25Hours,
                List.of(Appointment.AppointmentStatus.PENDING, Appointment.AppointmentStatus.CONFIRMED));

        for (Appointment appointment : upcomingAppointments) {
            try {
                String ownerEmail = appointment.getPet().getOwner().getUser().getEmail();
                String ownerName = appointment.getPet().getOwner().getUser().getName();
                String petName = appointment.getPet().getName();
                String vetName = appointment.getVeterinarian().getClinicName();
                String appointmentTime = appointment.getAppointmentDate().format(formatter);

                emailService.sendAppointmentReminder(
                        ownerEmail,
                        ownerName,
                        petName,
                        vetName,
                        appointmentTime,
                        "24 hours",
                        appointment.getMeetingLink());
            } catch (Exception e) {
                System.err.println(
                        "Failed to send 24hr reminder for appointment " + appointment.getId() + ": " + e.getMessage());
            }
        }
    }

    /**
     * Send reminder 1 hour before appointment
     * Runs every 15 minutes
     */
    @Scheduled(cron = "0 */15 * * * *") // Every 15 minutes
    public void send1HourReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in1Hour = now.plusHours(1);
        LocalDateTime in1Hour15Min = now.plusMinutes(75);

        List<Appointment> upcomingAppointments = appointmentRepository.findAppointmentsInDateRange(
                in1Hour,
                in1Hour15Min,
                List.of(Appointment.AppointmentStatus.PENDING, Appointment.AppointmentStatus.CONFIRMED));

        for (Appointment appointment : upcomingAppointments) {
            try {
                String ownerEmail = appointment.getPet().getOwner().getUser().getEmail();
                String ownerName = appointment.getPet().getOwner().getUser().getName();
                String petName = appointment.getPet().getName();
                String vetName = appointment.getVeterinarian().getClinicName();
                String appointmentTime = appointment.getAppointmentDate().format(formatter);

                emailService.sendAppointmentReminder(
                        ownerEmail,
                        ownerName,
                        petName,
                        vetName,
                        appointmentTime,
                        "1 hour",
                        appointment.getMeetingLink());
            } catch (Exception e) {
                System.err.println(
                        "Failed to send 1hr reminder for appointment " + appointment.getId() + ": " + e.getMessage());
            }
        }
    }

    /**
     * Send notification to vet about new booking
     */
    public void notifyVetOfNewBooking(Appointment appointment) {
        try {
            String vetEmail = appointment.getVeterinarian().getUser().getEmail();
            String vetName = appointment.getVeterinarian().getUser().getName();
            String petName = appointment.getPet().getName();
            String ownerName = appointment.getPet().getOwner().getUser().getName();
            String appointmentTime = appointment.getAppointmentDate().format(formatter);

            emailService.sendVetBookingNotification(
                    vetEmail,
                    vetName,
                    petName,
                    ownerName,
                    appointmentTime,
                    appointment.getType().toString(),
                    appointment.getReason());
        } catch (Exception e) {
            System.err.println("Failed to notify vet of new booking: " + e.getMessage());
        }
    }
}
