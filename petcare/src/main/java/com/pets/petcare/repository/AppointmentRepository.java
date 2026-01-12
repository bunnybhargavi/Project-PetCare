package com.pets.petcare.repository;

import com.pets.petcare.entity.Appointment;
import com.pets.petcare.entity.Appointment.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
        List<Appointment> findByPetId(Long petId);

        List<Appointment> findByVeterinarianId(Long vetId);

        // Find by status
        List<Appointment> findByStatus(AppointmentStatus status);

        // Find by vet and status
        List<Appointment> findByVeterinarianIdAndStatus(Long vetId, AppointmentStatus status);

        // Find appointments within date range (for reminders)
        @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate AND a.status IN :statuses")
        List<Appointment> findAppointmentsInDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("statuses") List<AppointmentStatus> statuses);

        // Find upcoming appointments for reminders (next 24 hours)
        @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :now AND :futureTime AND a.status IN ('PENDING', 'CONFIRMED')")
        List<Appointment> findUpcomingAppointments(
                        @Param("now") LocalDateTime now,
                        @Param("futureTime") LocalDateTime futureTime);

        // Statistics methods for admin dashboard
        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate > CURRENT_TIMESTAMP AND a.status IN ('PENDING', 'CONFIRMED')")
        long countUpcomingAppointments();

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = 'COMPLETED'")
        long countCompletedAppointments();

        @Query("SELECT COUNT(a) FROM Appointment a WHERE DATE(a.appointmentDate) = CURRENT_DATE AND a.status IN ('PENDING', 'CONFIRMED')")
        long countTodayAppointments();

        // Vet-specific statistics
        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.veterinarian.id = :vetId AND a.appointmentDate > CURRENT_TIMESTAMP AND a.status IN ('PENDING', 'CONFIRMED')")
        long countUpcomingAppointmentsByVet(@Param("vetId") Long vetId);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.veterinarian.id = :vetId AND a.status = 'COMPLETED'")
        long countCompletedAppointmentsByVet(@Param("vetId") Long vetId);

        @Query("SELECT COUNT(a) FROM Appointment a WHERE a.veterinarian.id = :vetId AND DATE(a.appointmentDate) = CURRENT_DATE AND a.status IN ('PENDING', 'CONFIRMED')")
        long countTodayAppointmentsByVet(@Param("vetId") Long vetId);

        // Find appointments by pet owner
        @Query("SELECT a FROM Appointment a WHERE a.pet.owner.id = :ownerId ORDER BY a.appointmentDate DESC")
        List<Appointment> findByPetOwnerId(@Param("ownerId") Long ownerId);

        // Find confirmed appointments in time range (for reminders)
        @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startTime AND :endTime AND a.status = 'CONFIRMED'")
        List<Appointment> findConfirmedAppointmentsInTimeRange(
                @Param("startTime") LocalDateTime startTime,
                @Param("endTime") LocalDateTime endTime);

        // Find appointments for a specific date range
        @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate ORDER BY a.appointmentDate ASC")
        List<Appointment> findAppointmentsForDateRange(
                @Param("startDate") LocalDateTime startDate,
                @Param("endDate") LocalDateTime endDate);

        // Find overdue confirmed appointments (for NO_SHOW status update)
        @Query("SELECT a FROM Appointment a WHERE a.appointmentDate < :cutoffTime AND a.status = 'CONFIRMED'")
        List<Appointment> findOverdueConfirmedAppointments(@Param("cutoffTime") LocalDateTime cutoffTime);

        // Find appointments by reference number
        @Query("SELECT a FROM Appointment a WHERE a.referenceNumber = :referenceNumber")
        Appointment findByReferenceNumber(@Param("referenceNumber") String referenceNumber);

        // Find appointments by vet and date range
        @Query("SELECT a FROM Appointment a WHERE a.veterinarian.id = :vetId AND a.appointmentDate BETWEEN :startDate AND :endDate ORDER BY a.appointmentDate ASC")
        List<Appointment> findByVeterinarianIdAndDateRange(
                @Param("vetId") Long vetId,
                @Param("startDate") LocalDateTime startDate,
                @Param("endDate") LocalDateTime endDate);

        // Find appointments by pet and status
        @Query("SELECT a FROM Appointment a WHERE a.pet.id = :petId AND a.status = :status ORDER BY a.appointmentDate DESC")
        List<Appointment> findByPetIdAndStatus(@Param("petId") Long petId, @Param("status") AppointmentStatus status);

        // Find recent appointments for a pet (last 6 months)
        @Query("SELECT a FROM Appointment a WHERE a.pet.id = :petId AND a.appointmentDate >= :since ORDER BY a.appointmentDate DESC")
        List<Appointment> findRecentAppointmentsByPet(@Param("petId") Long petId, @Param("since") LocalDateTime since);

        // Check if vet has access to pet through appointments
        @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.pet.id = :petId AND a.veterinarian.id = :vetId")
        boolean existsByPetIdAndVeterinarianId(@Param("petId") Long petId, @Param("vetId") Long vetId);

        // Find appointments between specific pet and vet
        @Query("SELECT a FROM Appointment a WHERE a.pet.id = :petId AND a.veterinarian.id = :vetId ORDER BY a.appointmentDate DESC")
        List<Appointment> findByPetIdAndVeterinarianIdOrderByAppointmentDateDesc(@Param("petId") Long petId, @Param("vetId") Long vetId);
}
