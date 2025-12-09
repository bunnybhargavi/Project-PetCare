package com.pets.petcare.repository;

import com.pets.petcare.entity.Reminder;
import com.pets.petcare.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByPetOrderByDueDateAsc(Pet pet);
    List<Reminder> findByPetIdOrderByDueDateAsc(Long petId);
    List<Reminder> findByDueDateBeforeAndStatus(LocalDate date, Reminder.ReminderStatus status);
    List<Reminder> findByStatusAndEmailSent(Reminder.ReminderStatus status, Boolean emailSent);
}
