package com.pets.petcare.repository;

import com.pets.petcare.entity.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {
        List<AppointmentSlot> findByVeterinarianId(Long vetId);

        List<AppointmentSlot> findByVeterinarianIdAndStartTimeBetween(Long vetId, LocalDateTime start,
                        LocalDateTime end);

        List<AppointmentSlot> findByVeterinarianIdAndStatus(Long vetId, AppointmentSlot.SlotStatus status);

        // Find available slots (considering capacity)
        List<AppointmentSlot> findByVeterinarianIdAndStatusAndStartTimeAfter(
                        Long vetId, AppointmentSlot.SlotStatus status, LocalDateTime after);

        // Find slots by date range and type
        List<AppointmentSlot> findByVeterinarianIdAndStartTimeBetweenAndMode(
                        Long vetId, LocalDateTime start, LocalDateTime end, AppointmentSlot.SlotType mode);

        // Find all available slots after a certain time
        List<AppointmentSlot> findByStatusAndStartTimeAfter(
                        AppointmentSlot.SlotStatus status, LocalDateTime after);

        // Delete slots by vet ID
        void deleteByVeterinarianId(Long vetId);
}
