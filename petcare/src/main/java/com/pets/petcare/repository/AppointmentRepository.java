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
}
