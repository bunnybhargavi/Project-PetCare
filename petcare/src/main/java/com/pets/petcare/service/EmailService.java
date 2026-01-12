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

    public void sendAppointmentConfirmationEmail(String to, String ownerName, String vetName, String dateTime,
            String type, String meetingLink) {
        String subject = "✅ Appointment Confirmed with " + vetName;
        String body = "Hello " + ownerName + ",\n\n" +
                "Your appointment has been confirmed!\n\n" +
                "Vet: " + vetName + "\n" +
                "Time: " + dateTime + "\n" +
                "Type: " + type + "\n";

        if (meetingLink != null && !meetingLink.isEmpty()) {
            body += "Meeting Link: " + meetingLink + "\n";
        }

        body += "\nPlease arrive/join 5 minutes early.\n\n" +
                "Best regards,\n" +
                "Pet Care Team";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Appointment confirmation email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send appointment confirmation email", e);
            // For development: log the email content so testers can see it
            log.info("[DEV-EMAIL] Appointment confirmation for {}: subject={}, body={}", to, subject, body);
        }
    }

    public void sendAppointmentCancellationEmail(String to, String ownerName, String vetName, String dateTime) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("❌ Appointment Cancelled: " + vetName);
            message.setText(
                    "Hello " + ownerName + ",\n\n" +
                            "Your appointment with " + vetName + " on " + dateTime + " has been cancelled.\n\n" +
                            "Please book a new slot if needed.\n\n" +
                            "Best regards,\n" +
                            "Pet Care Team");

            mailSender.send(message);
            log.info("Appointment cancellation email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send appointment cancellation email", e);
        }
    }

    /**
     * Send appointment reminder email
     */
    public void sendAppointmentReminder(String to, String ownerName, String petName, String vetName,
            String appointmentTime, String timeframe, String meetingLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("🔔 Reminder: Appointment in " + timeframe);

            String body = "Hello " + ownerName + ",\n\n" +
                    "This is a reminder that " + petName + " has an appointment coming up:\n\n" +
                    "Veterinarian: " + vetName + "\n" +
                    "Time: " + appointmentTime + "\n" +
                    "In: " + timeframe + "\n";

            if (meetingLink != null && !meetingLink.isEmpty()) {
                body += "\nVideo Meeting Link: " + meetingLink + "\n";
            }

            body += "\nPlease arrive/join on time.\n\n" +
                    "Best regards,\n" +
                    "Pet Care Team";

            message.setText(body);
            mailSender.send(message);
            log.info("Appointment reminder sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send appointment reminder", e);
        }
    }

    /**
     * Send notification to vet about new booking
     */
    public void sendVetBookingNotification(String to, String vetName, String petName, String ownerName,
            String appointmentTime, String type, String reason) {
        String subject = "🆕 New Appointment Booking";
        String body = "Hello Dr. " + vetName + ",\n\n" +
                "You have a new appointment booking:\n\n" +
                "Pet: " + petName + "\n" +
                "Owner: " + ownerName + "\n" +
                "Time: " + appointmentTime + "\n" +
                "Type: " + type + "\n";

        if (reason != null && !reason.isEmpty()) {
            body += "Reason: " + reason + "\n";
        }

        body += "\nPlease log in to your dashboard to view details.\n\n" +
                "Best regards,\n" +
                "Pet Care Team";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Vet booking notification sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send vet booking notification", e);
            // For development: log the email content
            log.info("[DEV-EMAIL] Vet booking notification for {}: subject={}, body={}", to, subject, body);
        }
    }

    /**
     * Send vaccination reminder email
     */
    public void sendVaccinationReminder(String to, String ownerName, String petName,
            String vaccineName, String timeframe) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("💉 Vaccination Reminder: " + petName);

            String body = "Hello " + ownerName + ",\n\n" +
                    "This is a reminder that " + petName + " has a vaccination due " + timeframe + ":\n\n" +
                    "Vaccination: " + vaccineName + "\n" +
                    "Due: " + timeframe + "\n\n" +
                    "Please schedule an appointment with your veterinarian to ensure " + petName +
                    " stays protected and healthy.\n\n" +
                    "You can book an appointment through the PetCare app.\n\n" +
                    "Best regards,\n" +
                    "Pet Care Team";

            message.setText(body);
            mailSender.send(message);
            log.info("Vaccination reminder sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send vaccination reminder", e);
        }
    }

    /**
     * Generic method to send email with subject and content
     * Used by the notification system for flexible email sending
     */
    public boolean sendEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            log.info("Email sent successfully to: {} with subject: {}", to, subject);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to: {} with subject: {}", to, subject, e);
            // For development: log the email content
            log.info("[DEV-EMAIL] Failed email for {}: subject={}, content={}", to, subject, content);
            return false;
        }
    }

    /**
     * Send appointment approval email to owner
     */
    public void sendAppointmentApprovalEmail(String to, String ownerName, String vetName, String dateTime,
            String type, String meetingLink) {
        String subject = "✅ Appointment Approved by " + vetName;
        String body = "Hello " + ownerName + ",\n\n" +
                "Great news! Your appointment request has been approved!\n\n" +
                "Vet: " + vetName + "\n" +
                "Time: " + dateTime + "\n" +
                "Type: " + type + "\n";

        if (meetingLink != null && !meetingLink.isEmpty()) {
            body += "Meeting Link: " + meetingLink + "\n";
        }

        body += "\nPlease arrive/join 5 minutes early.\n\n" +
                "Best regards,\n" +
                "Pet Care Team";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Appointment approval email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send appointment approval email", e);
            log.info("[DEV-EMAIL] Appointment approval for {}: subject={}, body={}", to, subject, body);
        }
    }

    /**
     * Send appointment rejection email to owner
     */
    public void sendAppointmentRejectionEmail(String to, String ownerName, String vetName, String dateTime,
            String rejectionReason) {
        String subject = "❌ Appointment Request Declined - " + vetName;
        String body = "Hello " + ownerName + ",\n\n" +
                "We regret to inform you that your appointment request has been declined.\n\n" +
                "Requested Time: " + dateTime + "\n" +
                "Vet: " + vetName + "\n";

        if (rejectionReason != null && !rejectionReason.isEmpty()) {
            body += "Reason: " + rejectionReason + "\n";
        }

        body += "\nPlease try booking a different time slot or contact the clinic directly.\n\n" +
                "Best regards,\n" +
                "Pet Care Team";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Appointment rejection email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send appointment rejection email", e);
            log.info("[DEV-EMAIL] Appointment rejection for {}: subject={}, body={}", to, subject, body);
        }
    }

    /**
     * Send order confirmation email to owner
     */
    public void sendOrderConfirmationEmail(String to, String ownerName, String orderId, String amount, String date) {
        String subject = "📦 Order Confirmed: #" + orderId;
        String body = "Hello " + ownerName + ",\n\n" +
                "Thank you for your purchase! Your order has been confirmed.\n\n" +
                "Order ID: #" + orderId + "\n" +
                "Date: " + date + "\n" +
                "Total Amount: " + amount + "\n\n" +
                "We will notify you when your items are shipped.\n\n" +
                "Best regards,\n" +
                "Pet Care Team";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Order confirmation email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email", e);
            log.info("[DEV-EMAIL] Order confirmation for {}: subject={}, body={}", to, subject, body);
        }
    }
}
