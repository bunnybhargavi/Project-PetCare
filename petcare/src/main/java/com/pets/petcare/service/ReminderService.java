package com.pets.petcare.service;

import com.pets.petcare.dto.*;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ReminderService - Manages pet care reminders
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final PetRepository petRepository;
    private final EmailService emailService;

    /**
     * Get all reminders for a pet
     */
    public List<ReminderResponse> getPetReminders(Long petId) {
        petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        return reminderRepository.findByPetIdOrderByDueDateAsc(petId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pending reminders (for dashboard)
     */
    public List<ReminderResponse> getPendingReminders(Long petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        return reminderRepository.findByPetOrderByDueDateAsc(pet)
                .stream()
                .filter(r -> r.getStatus() == Reminder.ReminderStatus.PENDING)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming reminders (next 7 days)
     */
    public List<ReminderResponse> getUpcomingReminders(Long petId) {
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        return reminderRepository.findByPetOrderByDueDateAsc(pet)
                .stream()
                .filter(r -> r.getStatus() == Reminder.ReminderStatus.PENDING)
                .filter(r -> !r.getDueDate().isBefore(today) && !r.getDueDate().isAfter(nextWeek))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Add new reminder
     */
    @Transactional
    public ReminderResponse addReminder(Long petId, ReminderRequest request) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Reminder reminder = new Reminder();
        reminder.setPet(pet);
        reminder.setTitle(request.getTitle());
        reminder.setType(Reminder.ReminderType.valueOf(request.getType()));
        reminder.setDueDate(request.getDueDate());
        reminder.setIsRecurring(request.getIsRecurring());
        reminder.setRepeatRule(request.getRepeatRule());
        reminder.setStatus(Reminder.ReminderStatus.PENDING);
        reminder.setNotes(request.getNotes());
        reminder.setEmailSent(false);

        reminder = reminderRepository.save(reminder);

        log.info("Reminder added for pet: {}", pet.getName());

        return mapToResponse(reminder);
    }

    /**
     * Update reminder
     */
    @Transactional
    public ReminderResponse updateReminder(Long reminderId, ReminderRequest request) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        reminder.setTitle(request.getTitle());
        reminder.setType(Reminder.ReminderType.valueOf(request.getType()));
        reminder.setDueDate(request.getDueDate());
        reminder.setIsRecurring(request.getIsRecurring());
        reminder.setRepeatRule(request.getRepeatRule());
        reminder.setNotes(request.getNotes());

        reminder = reminderRepository.save(reminder);

        return mapToResponse(reminder);
    }

    /**
     * Mark reminder as completed
     */
    @Transactional
    public void markAsCompleted(Long reminderId) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));

        reminder.setStatus(Reminder.ReminderStatus.COMPLETED);
        reminderRepository.save(reminder);

        // If recurring, create next reminder
        if (reminder.getIsRecurring() && reminder.getRepeatRule() != null) {
            createRecurringReminder(reminder);
        }

        log.info("Reminder marked as completed: {}", reminder.getTitle());
    }

    /**
     * Delete reminder
     */
    @Transactional
    public void deleteReminder(Long reminderId) {
        reminderRepository.deleteById(reminderId);
        log.info("Reminder deleted: ID {}", reminderId);
    }

    /**
     * Process overdue reminders (called by scheduled job)
     */
    @Transactional
    public void processOverdueReminders() {
        List<Reminder> overdueReminders = reminderRepository
                .findByDueDateBeforeAndStatus(LocalDate.now(), Reminder.ReminderStatus.PENDING);

        for (Reminder reminder : overdueReminders) {
            reminder.setStatus(Reminder.ReminderStatus.OVERDUE);
            reminderRepository.save(reminder);
        }

        log.info("Processed {} overdue reminders", overdueReminders.size());
    }

    /**
     * Send reminder emails (called by scheduled job)
     */
    @Transactional
    public void sendReminderEmails() {
        // Get reminders due today that haven't been emailed
        List<Reminder> remindersToEmail = reminderRepository
                .findByStatusAndEmailSent(Reminder.ReminderStatus.PENDING, false)
                .stream()
                .filter(r -> r.getDueDate().equals(LocalDate.now()))
                .collect(Collectors.toList());

        for (Reminder reminder : remindersToEmail) {
            try {
                Pet pet = reminder.getPet();
                PetOwner owner = pet.getOwner();
                User user = owner.getUser();

                // Send email
                emailService.sendReminderEmail(
                        user.getEmail(),
                        user.getName(),
                        pet.getName(),
                        reminder.getTitle(),
                        reminder.getType().name());

                reminder.setEmailSent(true);
                reminderRepository.save(reminder);

                log.info("Reminder email sent for: {}", reminder.getTitle());

            } catch (Exception e) {
                log.error("Failed to send reminder email", e);
            }
        }
    }

    /**
     * Create next recurring reminder
     */
    private void createRecurringReminder(Reminder originalReminder) {
        Reminder newReminder = new Reminder();
        newReminder.setPet(originalReminder.getPet());
        newReminder.setTitle(originalReminder.getTitle());
        newReminder.setType(originalReminder.getType());
        newReminder.setIsRecurring(true);
        newReminder.setRepeatRule(originalReminder.getRepeatRule());
        newReminder.setNotes(originalReminder.getNotes());
        newReminder.setStatus(Reminder.ReminderStatus.PENDING);
        newReminder.setEmailSent(false);

        // Calculate next due date based on repeat rule
        LocalDate nextDueDate = calculateNextDueDate(
                originalReminder.getDueDate(),
                originalReminder.getRepeatRule());
        newReminder.setDueDate(nextDueDate);

        reminderRepository.save(newReminder);
        log.info("Created recurring reminder: {}", newReminder.getTitle());
    }

    /**
     * Calculate next due date for recurring reminders
     */
    private LocalDate calculateNextDueDate(LocalDate currentDate, String repeatRule) {
        if (repeatRule == null)
            return currentDate.plusMonths(1);

        switch (repeatRule.toUpperCase()) {
            case "WEEKLY":
                return currentDate.plusWeeks(1);
            case "MONTHLY":
                return currentDate.plusMonths(1);
            case "YEARLY":
                return currentDate.plusYears(1);
            default:
                return currentDate.plusMonths(1);
        }
    }

    /**
     * Map entity to response DTO
     */
    private ReminderResponse mapToResponse(Reminder r) {
        Integer daysUntilDue = null;
        if (r.getDueDate() != null) {
            daysUntilDue = (int) ChronoUnit.DAYS.between(LocalDate.now(), r.getDueDate());
        }

        return ReminderResponse.builder()
                .id(r.getId())
                .petId(r.getPet().getId())
                .petName(r.getPet().getName())
                .title(r.getTitle())
                .type(r.getType().name())
                .dueDate(r.getDueDate())
                .isRecurring(r.getIsRecurring())
                .repeatRule(r.getRepeatRule())
                .status(r.getStatus().name())
                .notes(r.getNotes())
                .emailSent(r.getEmailSent())
                .daysUntilDue(daysUntilDue)
                .createdAt(r.getCreatedAt())
                .build();
    }
}
