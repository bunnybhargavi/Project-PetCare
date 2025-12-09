package com.pets.petcare.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * ReminderRequest - Create/Update reminder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Reminder type is required")
    private String type; // VACCINATION, CHECKUP, MEDICATION, GROOMING, DEWORMING, CUSTOM
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
    
    private Boolean isRecurring = false;
    
    private String repeatRule; // YEARLY, MONTHLY, WEEKLY
    
    @Size(max = 500)
    private String notes;
}
