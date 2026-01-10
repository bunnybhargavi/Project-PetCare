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
     */
    List<OtpToken> findByEmailAndTypeAndIsUsed(
            String email,
            OtpToken.OtpType type,
            Boolean isUsed
    );

    /**
     * Find a specific unused OTP by email, code, and type
     */
    Optional<OtpToken> findByEmailAndOtpAndTypeAndIsUsed(
            String email,
            String otp,
            OtpToken.OtpType type,
            Boolean isUsed
    );

    /**
     * Delete old OTP records created before a certain time
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffTime);

    /**
     * Count OTPs created before a certain time (for cleanup logging)
     */
    long countByCreatedAtBefore(LocalDateTime cutoffTime);

    /**
     * Find OTPs for a specific email created before a certain time
     */
    List<OtpToken> findByEmailAndCreatedAtBefore(String email, LocalDateTime cutoffTime);

    /**
     * Find all OTPs for an email ordered by newest first
     */
    List<OtpToken> findByEmailOrderByCreatedAtDesc(String email);
}
