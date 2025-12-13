package com.pets.petcare.scheduler;

import com.pets.petcare.service.ReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Triggers reminder processing and email notifications on a schedule.
 * - Marks overdue reminders once daily.
 * - Sends due-today reminder emails once daily.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final ReminderService reminderService;

    /**
     * Runs at 07:00 every day to update overdue reminders and send emails for items due today.
     */
    @Scheduled(cron = "0 0 7 * * ?")
    public void runDailyReminderJobs() {
        log.info("Running scheduled reminder jobs (overdue processing + email sends)");
        reminderService.processOverdueReminders();
        reminderService.sendReminderEmails();
    }
}

