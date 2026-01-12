package com.pets.petcare.service;

import com.pets.petcare.entity.OtpToken;
import com.pets.petcare.repository.OtpTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

/**
 * OtpService - Manages OTP generation, verification, and lifecycle
 *
 * PURPOSE: Handle all OTP-related operations securely
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;

    public OtpService(OtpTokenRepository otpTokenRepository, EmailService emailService) {
        this.otpTokenRepository = otpTokenRepository;
        this.emailService = emailService;
    }

    // Constants
    private static final int OTP_LENGTH = 6; // 6-digit OTP
    private static final int OTP_VALIDITY_MINUTES = 10; // Valid for 10 minutes

    /**
     * Generate and send OTP to user's email
     *
     * PROCESS:
     * 1. Clean up expired OTPs first
     * 2. Invalidate all previous unused OTPs (security)
     * 3. Generate new 6-digit OTP
     * 4. Save OTP to database with expiry time
     * 5. Send OTP via email
     *
     * @param email - User's email address
     * @param type  - REGISTRATION or LOGIN
     *
     * @Transactional - If any step fails, rollback all database changes
     */
    @Transactional
    public void generateAndSendOtp(String email, OtpToken.OtpType type) {
        log.info("Generating OTP for email: {} with type: {}", email, type);

        try {
            // STEP 1: Clean up expired OTPs first (prevents database bloat)
            cleanupExpiredOtpsForEmail(email);

            // STEP 2: Invalidate previous unused OTPs
            // Why? Prevents user from using old OTPs
            List<OtpToken> existingOtps = otpTokenRepository.findByEmailAndTypeAndIsUsed(email, type, false);
            log.info("Found {} existing unused OTPs for email: {}", existingOtps.size(), email);
            
            existingOtps.forEach(otp -> {
                otp.setIsUsed(true); // Mark as used
                otpTokenRepository.save(otp);
                log.debug("Invalidated existing OTP: {}", otp.getId());
            });

            // STEP 3: Generate new random 6-digit OTP
            String otp = generateOtp();
            log.debug("Generated new OTP for email: {}", email);

            // STEP 4: Create OTP record
            OtpToken otpToken = new OtpToken();
            otpToken.setEmail(email);
            otpToken.setOtp(otp);
            otpToken.setType(type);
            otpToken.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
            otpToken.setIsUsed(false);
            otpToken.setCreatedAt(LocalDateTime.now());

            // STEP 5: Save to database
            OtpToken savedToken = otpTokenRepository.save(otpToken);
            log.info("Saved OTP token with ID: {} for email: {}", savedToken.getId(), email);

            // STEP 6: Send OTP via email
            emailService.sendOtpEmail(email, otp, type.name());

            log.info("OTP generated and sent successfully to: {}", email);
            System.out.println("************************************************");
            System.out.println("DEV OTP for " + email + ": " + otp);
            System.out.println("Expires at: " + otpToken.getExpiryTime());
            System.out.println("************************************************");

        } catch (Exception e) {
            log.error("Error generating OTP for email: {} - {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to generate OTP: " + e.getMessage());
        }
    }

    /**
     * Verify if user-provided OTP is correct
     *
     * CHECKS:
     * 1. OTP exists in database
     * 2. OTP matches the email
     * 3. OTP is for correct type (REGISTRATION/LOGIN)
     * 4. OTP has not been used before
     * 5. OTP has not expired
     *
     * @param email - User's email
     * @param otp   - OTP code entered by user
     * @param type  - REGISTRATION or LOGIN
     * @return true if valid, false if invalid/expired
     */
    public boolean verifyOtp(String email, String otp, OtpToken.OtpType type) {

        // Search for matching OTP in database
        return otpTokenRepository.findByEmailAndOtpAndTypeAndIsUsed(email, otp, type, false)
                .map(otpToken -> {

                    // CHECK 1: Is OTP expired?
                    if (otpToken.isExpired()) {
                        log.warn("OTP expired for email: {}", email);
                        return false;
                    }

                    // CHECK 2: OTP is valid! Mark as used
                    otpToken.setIsUsed(true);
                    otpTokenRepository.save(otpToken);

                    log.info("OTP verified successfully for email: {}", email);
                    return true;
                })
                .orElseGet(() -> {
                    // OTP not found or already used
                    log.warn("Invalid OTP for email: {}", email);
                    return false;
                });
    }

    /**
     * Generate random 6-digit OTP
     *
     * LOGIC:
     * - Loop 6 times
     * - Each iteration: generate random digit (0-9)
     * - Concatenate to form 6-digit string
     *
     * EXAMPLE OUTPUT: "234567", "890123", "001234"
     */
    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();

        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10)); // Random digit 0-9
        }

        return otp.toString();
    }

    /**
     * Cleanup expired OTPs from database
     *
     * PURPOSE: Keep database clean by removing old OTPs
     * Should be run periodically (e.g., daily via scheduled job)
     */
    @Transactional
    public void cleanupExpiredOtps() {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
            long deletedCount = otpTokenRepository.countByCreatedAtBefore(cutoffTime);
            otpTokenRepository.deleteByCreatedAtBefore(cutoffTime);
            log.info("Cleaned up {} expired OTPs older than 24 hours", deletedCount);
        } catch (Exception e) {
            log.error("Error during OTP cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Cleanup expired OTPs for a specific email
     * Called before generating new OTP to prevent database bloat
     */
    @Transactional
    public void cleanupExpiredOtpsForEmail(String email) {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1); // Clean OTPs older than 1 hour
            List<OtpToken> expiredOtps = otpTokenRepository.findByEmailAndCreatedAtBefore(email, cutoffTime);
            if (!expiredOtps.isEmpty()) {
                otpTokenRepository.deleteAll(expiredOtps);
                log.info("Cleaned up {} expired OTPs for email: {}", expiredOtps.size(), email);
            }
        } catch (Exception e) {
            log.warn("Error cleaning up expired OTPs for email {}: {}", email, e.getMessage());
        }
    }

    /**
     * Force cleanup all OTPs for an email (useful for testing or troubleshooting)
     */
    @Transactional
    public void forceCleanupOtpsForEmail(String email) {
        try {
            List<OtpToken> allOtps = otpTokenRepository.findByEmailOrderByCreatedAtDesc(email);
            if (!allOtps.isEmpty()) {
                otpTokenRepository.deleteAll(allOtps);
                log.info("Force cleaned up {} OTPs for email: {}", allOtps.size(), email);
            }
        } catch (Exception e) {
            log.error("Error during force cleanup for email {}: {}", email, e.getMessage());
        }
    }

    /**
     * Get latest OTP for debugging purposes
     */
    public OtpToken getLatestOtpForEmail(String email) {
        List<OtpToken> otps = otpTokenRepository.findByEmailOrderByCreatedAtDesc(email);
        return otps.isEmpty() ? null : otps.get(0);
    }
}