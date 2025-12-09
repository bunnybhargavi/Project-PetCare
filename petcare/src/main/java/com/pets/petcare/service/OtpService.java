package com.pets.petcare.service;

import com.pets.petcare.entity.OtpToken;
import com.pets.petcare.repository.OtpTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
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
     * 1. Invalidate all previous unused OTPs (security)
     * 2. Generate new 6-digit OTP
     * 3. Save OTP to database with expiry time
     * 4. Send OTP via email
     *
     * @param email - User's email address
     * @param type  - REGISTRATION or LOGIN
     *
     * @Transactional - If any step fails, rollback all database changes
     */
    @Transactional
    public void generateAndSendOtp(String email, OtpToken.OtpType type) {

        // STEP 1: Invalidate previous OTPs
        // Why? Prevents user from using old OTPs
        // Find all unused OTPs for this email and type
        otpTokenRepository.findByEmailAndTypeAndIsUsed(email, type, false)
                .forEach(otp -> {
                    otp.setIsUsed(true); // Mark as used
                    otpTokenRepository.save(otp);
                });

        // STEP 2: Generate new random 6-digit OTP
        String otp = generateOtp();

        // STEP 3: Create OTP record
        OtpToken otpToken = new OtpToken();
        otpToken.setEmail(email);
        otpToken.setOtp(otp);
        otpToken.setType(type);
        otpToken.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES));
        otpToken.setIsUsed(false);
        otpToken.setCreatedAt(LocalDateTime.now());

        // STEP 4: Save to database
        otpTokenRepository.save(otpToken);

        // STEP 5: Send OTP via email
        emailService.sendOtpEmail(email, otp, type.name());

        log.info("OTP generated and sent to: {}", email);
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
     *
     * EXAMPLE USAGE:
     * 
     * @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
     *                 public void scheduledCleanup() {
     *                 otpService.cleanupExpiredOtps();
     *                 }
     */
    @Transactional
    public void cleanupExpiredOtps() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        otpTokenRepository.deleteByCreatedAtBefore(cutoffTime);
        log.info("Cleaned up expired OTPs");
    }
}