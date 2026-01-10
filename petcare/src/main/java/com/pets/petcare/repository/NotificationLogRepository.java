package com.pets.petcare.repository;

import com.pets.petcare.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    /**
     * Find notifications by user
     */
    List<NotificationLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find notifications by appointment
     */
    List<NotificationLog> findByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);

    /**
     * Find failed notifications for retry
     */
    @Query("SELECT nl FROM NotificationLog nl WHERE nl.status = 'FAILED' AND nl.retryCount < nl.maxRetries")
    List<NotificationLog> findFailedNotificationsForRetry();

    /**
     * Find pending notifications
     */
    List<NotificationLog> findByStatusOrderByCreatedAtAsc(NotificationLog.DeliveryStatus status);

    /**
     * Find notifications by type and status
     */
    List<NotificationLog> findByTypeAndStatus(NotificationLog.NotificationType type, NotificationLog.DeliveryStatus status);

    /**
     * Find notifications created after a specific time
     */
    @Query("SELECT nl FROM NotificationLog nl WHERE nl.createdAt >= :since ORDER BY nl.createdAt DESC")
    List<NotificationLog> findRecentNotifications(@Param("since") LocalDateTime since);

    /**
     * Count notifications by status for monitoring
     */
    @Query("SELECT nl.status, COUNT(nl) FROM NotificationLog nl GROUP BY nl.status")
    List<Object[]> countByStatus();
}