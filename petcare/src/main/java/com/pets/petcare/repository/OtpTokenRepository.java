package com.pets.petcare.repository;

import com.pets.petcare.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * OtpTokenRepository - Database access for OTP tokens
 *
 * PURPOSE: Handles all OTP-related database queries
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    /**
     * Find all unused OTPs for a specific email and type
     *
     * USE CASE: When generating new OTP, invalidate all previous unused OTPs
     *
     * EXAMPLE:
     * List<OtpToken> oldOtps = otpTokenRepository.findByEmailAndTypeAndIsUsed(
     *     "john@example.com",
     *     OtpToken.OtpType.LOGIN,
     *     false
     * );
     * // Mark all as used before generating new OTP
     */
    List<OtpToken> findByEmailAndTypeAndIsUsed(
            String email,
            OtpToken.OtpType type,
            Boolean isUsed
    );

    /**
     * Find a specific unused OTP by email, code, and type
     *
     * USE CASE: Verify if user-provided OTP is correct
     *
     * EXAMPLE:
     * Optional<OtpToken> otpOpt = otpTokenRepository.findByEmailAndOtpAndTypeAndIsUsed(
     *     "john@example.com",
     *     "123456",
     *     OtpToken.OtpType.LOGIN,
     *     false
     * );
     *
     * if (otpOpt.isPresent() && !otpOpt.get().isExpired()) {
     *     // OTP is valid!
     * }
     */
    Optional<OtpToken> findByEmailAndOtpAndTypeAndIsUsed(
            String email,
            String otp,
            OtpToken.OtpType type,
            Boolean isUsed
    );

    /**
     * Delete old OTP records created before a certain time
     *
     * USE CASE: Cleanup expired OTPs to keep database clean
     * Typically run as a scheduled job (e.g., daily)
     *
     * EXAMPLE:
     * LocalDateTime cutoff = LocalDateTime.now().minusDays(1);
     * otpTokenRepository.deleteByCreatedAtBefore(cutoff);
     * // Deletes all OTPs older than 24 hours
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffTime);

        /**
         * Find all OTPs for an email ordered by newest first
         * Useful for testing to fetch the latest OTP
         */
        java.util.List<OtpToken> findByEmailOrderByCreatedAtDesc(String email);
}
