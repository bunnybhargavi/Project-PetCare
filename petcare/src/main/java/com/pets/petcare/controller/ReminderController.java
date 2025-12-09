package com.pets.petcare.controller;

import com.pets.petcare.dto.*;
import com.pets.petcare.service.ReminderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pets/{petId}/reminders")
@RequiredArgsConstructor
public class ReminderController {
    
    private final ReminderService reminderService;
    
    @GetMapping
    public ResponseEntity<List<ReminderResponse>> getPetReminders(@PathVariable Long petId) {
        return ResponseEntity.ok(reminderService.getPetReminders(petId));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<ReminderResponse>> getPendingReminders(@PathVariable Long petId) {
        return ResponseEntity.ok(reminderService.getPendingReminders(petId));
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<ReminderResponse>> getUpcomingReminders(@PathVariable Long petId) {
        return ResponseEntity.ok(reminderService.getUpcomingReminders(petId));
    }
    
    @PostMapping
    public ResponseEntity<ReminderResponse> addReminder(
            @PathVariable Long petId, @Valid @RequestBody ReminderRequest request) {
        return ResponseEntity.ok(reminderService.addReminder(petId, request));
    }
    
    @PutMapping("/{reminderId}")
    public ResponseEntity<ReminderResponse> updateReminder(
            @PathVariable Long reminderId, @Valid @RequestBody ReminderRequest request) {
        return ResponseEntity.ok(reminderService.updateReminder(reminderId, request));
    }
    
    @PatchMapping("/{reminderId}/complete")
    public ResponseEntity<ApiResponse> markAsCompleted(@PathVariable Long reminderId) {
        reminderService.markAsCompleted(reminderId);
        return ResponseEntity.ok(new ApiResponse(true, "Reminder marked as completed"));
    }
    
    @DeleteMapping("/{reminderId}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long reminderId) {
        reminderService.deleteReminder(reminderId);
        return ResponseEntity.noContent().build();
    }
}
