package com.pets.petcare.service;

import com.pets.petcare.entity.Vaccination;
import com.pets.petcare.repository.VaccinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Service to handle vaccination reminders
 */
@Service
public class VaccinationReminderService {

    @Autowired
    private VaccinationRepository vaccinationRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Send reminder for vaccinations due today
     * Runs every day at 9 AM
     */
    @Scheduled(cron = "0 0 9 * * *") // Every day at 9 AM
    public void sendDailyVaccinationReminders() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        // Get vaccinations due today
        List<Vaccination> dueToday = vaccinationRepository.findByNextDueDateBetween(today, today);

        for (Vaccination vaccination : dueToday) {
            try {
                String ownerEmail = vaccination.getPet().getOwner().getUser().getEmail();
                String ownerName = vaccination.getPet().getOwner().getUser().getName();
                String petName = vaccination.getPet().getName();
                String vaccineName = vaccination.getVaccineName();

                emailService.sendVaccinationReminder(
                        ownerEmail,
                        ownerName,
                        petName,
                        vaccineName,
                        "today");

                System.out.println("Sent vaccination reminder for " + petName + " - " + vaccineName);
            } catch (Exception e) {
                System.err.println("Failed to send vaccination reminder: " + e.getMessage());
            }
        }
    }

    /**
     * Send reminder for vaccinations due in 7 days
     * Runs every day at 9 AM
     */
    @Scheduled(cron = "0 0 9 * * *") // Every day at 9 AM
    public void sendWeeklyVaccinationReminders() {
        LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);

        // Get vaccinations due in 7 days
        List<Vaccination> dueInWeek = vaccinationRepository.findByNextDueDateBetween(sevenDaysFromNow,
                sevenDaysFromNow);

        for (Vaccination vaccination : dueInWeek) {
            try {
                String ownerEmail = vaccination.getPet().getOwner().getUser().getEmail();
                String ownerName = vaccination.getPet().getOwner().getUser().getName();
                String petName = vaccination.getPet().getName();
                String vaccineName = vaccination.getVaccineName();

                emailService.sendVaccinationReminder(
                        ownerEmail,
                        ownerName,
                        petName,
                        vaccineName,
                        "in 7 days");

                System.out.println("Sent 7-day vaccination reminder for " + petName + " - " + vaccineName);
            } catch (Exception e) {
                System.err.println("Failed to send 7-day vaccination reminder: " + e.getMessage());
            }
        }
    }

    /**
     * Manual method to send immediate reminder for testing
     */
    public void sendImmediateReminders() {
        LocalDate today = LocalDate.now();
        List<Vaccination> dueToday = vaccinationRepository.findByNextDueDateBetween(today, today);

        System.out.println("Found " + dueToday.size() + " vaccinations due today");

        for (Vaccination vaccination : dueToday) {
            try {
                String ownerEmail = vaccination.getPet().getOwner().getUser().getEmail();
                String ownerName = vaccination.getPet().getOwner().getUser().getName();
                String petName = vaccination.getPet().getName();
                String vaccineName = vaccination.getVaccineName();

                emailService.sendVaccinationReminder(
                        ownerEmail,
                        ownerName,
                        petName,
                        vaccineName,
                        "today");

                System.out.println("✅ Sent vaccination reminder to " + ownerEmail);
            } catch (Exception e) {
                System.err.println("❌ Failed to send vaccination reminder: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
