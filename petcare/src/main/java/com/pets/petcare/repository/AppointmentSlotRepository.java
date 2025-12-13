package com.pets.petcare.repository;

import com.pets.petcare.entity.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {
    List<AppointmentSlot> findByVeterinarianId(Long vetId);

    List<AppointmentSlot> findByVeterinarianIdAndStartTimeBetween(Long vetId, LocalDateTime start, LocalDateTime end);

    List<AppointmentSlot> findByVeterinarianIdAndStatus(Long vetId, AppointmentSlot.SlotStatus status);
}
