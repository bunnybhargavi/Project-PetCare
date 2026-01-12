package com.pets.petcare.controller;

import com.pets.petcare.service.VaccinationReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for testing vaccination reminders
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private VaccinationReminderService vaccinationReminderService;

    /**
     * Manually trigger vaccination reminders for testing
     * GET /api/test/send-vaccination-reminders
     */
    @GetMapping("/send-vaccination-reminders")
    public ResponseEntity<String> sendVaccinationReminders() {
        try {
            vaccinationReminderService.sendImmediateReminders();
            return ResponseEntity.ok("Vaccination reminders sent! Check your email and console logs.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send reminders: " + e.getMessage());
        }
    }
}
