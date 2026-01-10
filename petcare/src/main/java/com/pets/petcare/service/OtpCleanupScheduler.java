package com.pets.petcare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * OtpCleanupScheduler - Scheduled tasks for OTP maintenance
 */
@Service
public class OtpCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(OtpCleanupScheduler.class);

    @Autowired
    private OtpService otpService;

    /**
     * Cleanup expired OTPs daily at 2 AM
     * This prevents database bloat and improves performance
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduledOtpCleanup() {
        log.info("Starting scheduled OTP cleanup...");
        try {
            otpService.cleanupExpiredOtps();
            log.info("Scheduled OTP cleanup completed successfully");
        } catch (Exception e) {
            log.error("Error during scheduled OTP cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Cleanup expired OTPs every hour (more frequent cleanup)
     * This helps with immediate cleanup after OTP expiry
     */
    @Scheduled(fixedRate = 3600000) // Every hour (3600000 ms)
    public void hourlyOtpCleanup() {
        log.debug("Starting hourly OTP cleanup...");
        try {
            otpService.cleanupExpiredOtps();
            log.debug("Hourly OTP cleanup completed");
        } catch (Exception e) {
            log.warn("Error during hourly OTP cleanup: {}", e.getMessage());
        }
    }
}