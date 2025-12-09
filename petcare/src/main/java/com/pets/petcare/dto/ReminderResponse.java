package com.pets.petcare.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ReminderResponse - Reminder data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {
    
    private Long id;
    private Long petId;
    private String petName;
    private String title;
    private String type;
    private LocalDate dueDate;
    private Boolean isRecurring;
    private String repeatRule;
    private String status; // PENDING, COMPLETED, OVERDUE, CANCELLED
    private String notes;
    private Boolean emailSent;
    private Integer daysUntilDue; // Calculated
    private LocalDateTime createdAt;
}
