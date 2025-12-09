package com.pets.petcare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * EmailService - Handles all email sending operations
 *
 * PURPOSE: Send OTP codes and welcome emails to users
 *
 * USES: Spring Boot Mail (configured in application.properties)
 */
@Service // Marks this as a Spring service (business logic)
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    // JavaMailSender is provided by Spring Boot Mail
    // Configured in application.properties (Gmail SMTP settings)
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send OTP email to user
     *
     * @param to   - Recipient email address
     * @param otp  - 6-digit OTP code
     * @param type - "REGISTRATION" or "LOGIN"
     *
     *             EXAMPLE CALL:
     *             emailService.sendOtpEmail("john@example.com", "123456", "LOGIN");
     */
    public void sendOtpEmail(String to, String otp, String type) {
        log.info("Generating OTP for {}: {}", to, otp);
        try {
            // Create email message
            SimpleMailMessage message = new SimpleMailMessage();

            // Set recipient
            message.setTo(to);

            // Set email subject
            message.setSubject("Pet Care App - " + type + " OTP");

            // Set email body (text content)
            message.setText(
                    "Your OTP for " + type.toLowerCase() + " is: " + otp + "\n\n" +
                            "This OTP is valid for 10 minutes.\n" +
                            "Please do not share this OTP with anyone.\n\n" +
                            "If you didn't request this OTP, please ignore this email.\n\n" +
                            "Thank you,\n" +
                            "Pet Care Team");

            // Send email using Gmail SMTP
            mailSender.send(message);

            // Log success (visible in console)
            log.info("OTP email sent successfully to: {}", to);

        } catch (Exception e) {
            // Log error with details
            log.error("Failed to send OTP email to: {}", to, e);

            // For development/testing: do NOT throw here.
            // Throwing would roll back the OTP save transaction in OtpService.
            // Instead, log the OTP so testers can read it from the logs.
            log.info("[DEV-OTP] OTP for {} (type={}): {}", to, type, otp);
        }
    }

    /**
     * Send welcome email after successful registration
     *
     * @param to   - Recipient email address
     * @param name - User's name
     *
     *             EXAMPLE CALL:
     *             emailService.sendWelcomeEmail("john@example.com", "John Doe");
     */
    public void sendWelcomeEmail(String to, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Welcome to Pet Care App!");
            message.setText(
                    "Hello " + name + ",\n\n" +
                            "Welcome to Pet Care App! Your account has been successfully created.\n\n" +
                            "You can now:\n" +
                            "- Manage your pet profiles\n" +
                            "- Track health records and vaccinations\n" +
                            "- Book appointments with veterinarians\n" +
                            "- Shop for pet supplies\n\n" +
                            "Thank you for choosing Pet Care App!\n\n" +
                            "Best regards,\n" +
                            "Pet Care Team");

            mailSender.send(message);
            log.info("Welcome email sent to: {}", to);

        } catch (Exception e) {
            // Log error but don't throw exception
            // Welcome email is not critical - registration can succeed without it
            log.error("Failed to send welcome email", e);
        }
    }

    public void sendReminderEmail(String to, String ownerName, String petName, String reminderTitle,
            String reminderType) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("🔔 Pet Care Reminder: " + reminderTitle);
            message.setText(
                    "Hello " + ownerName + ",\n\n" +
                            "This is a reminder for your pet " + petName + ":\n\n" +
                            "Reminder: " + reminderTitle + "\n" +
                            "Type: " + reminderType + "\n\n" +
                            "Please take the necessary action.\n\n" +
                            "Best regards,\n" +
                            "Pet Care Team");

            mailSender.send(message);
            log.info("Reminder email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send reminder email", e);
        }
    }
}