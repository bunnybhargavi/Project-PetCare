package com.pets.petcare.repository;

import com.pets.petcare.entity.AppointmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentHistoryRepository extends JpaRepository<AppointmentHistory, Long> {

    /**
     * Find all history records for a specific appointment
     */
    List<AppointmentHistory> findByAppointmentIdOrderByChangedAtDesc(Long appointmentId);

    /**
     * Find history records by user who made the change
     */
    List<AppointmentHistory> findByChangedByUserIdOrderByChangedAtDesc(Long userId);

    /**
     * Find recent status changes for monitoring
     */
    @Query("SELECT ah FROM AppointmentHistory ah WHERE ah.changedAt >= :since ORDER BY ah.changedAt DESC")
    List<AppointmentHistory> findRecentChanges(@Param("since") java.time.LocalDateTime since);
}