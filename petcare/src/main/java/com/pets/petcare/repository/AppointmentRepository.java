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
}
