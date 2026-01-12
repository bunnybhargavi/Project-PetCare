package com.pets.petcare.controller;

import com.pets.petcare.dto.ApiResponse;
import com.pets.petcare.dto.BookingConfirmationResponse;
import com.pets.petcare.dto.BookingFlowRequest;
import com.pets.petcare.entity.Appointment;
import com.pets.petcare.entity.AppointmentSlot;
import com.pets.petcare.entity.Veterinarian;
import com.pets.petcare.service.BookingFlowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * Controller for the three-step booking flow
 */
@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = "*")
public class BookingFlowController {

    @Autowired
    private BookingFlowService bookingFlowService;

    /**
     * Step 1: Validate veterinarian selection
     */
    @GetMapping("/step1/validate-vet/{vetId}")
    public ResponseEntity<ApiResponse<Veterinarian>> validateVeterinarianSelection(@PathVariable Long vetId) {
        try {
            Veterinarian vet = bookingFlowService.validateVeterinarianSelection(vetId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Veterinarian validated successfully", vet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Veterinarian validation failed: " + e.getMessage(), null));
        }
    }

    /**
     * Step 2: Validate slot selection
     */
    @GetMapping("/step2/validate-slot/{slotId}")
    public ResponseEntity<ApiResponse<AppointmentSlot>> validateSlotSelection(
            @PathVariable Long slotId,
            @RequestParam String appointmentType) {
        try {
            Appointment.AppointmentType type = Appointment.AppointmentType.valueOf(appointmentType.toUpperCase());
            AppointmentSlot slot = bookingFlowService.validateSlotSelection(slotId, type);
            return ResponseEntity.ok(new ApiResponse<>(true, "Slot validated successfully", slot));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Slot validation failed: " + e.getMessage(), null));
        }
    }

    /**
     * Step 3: Complete booking
     */
    @PostMapping("/step3/complete")
    public ResponseEntity<ApiResponse<BookingConfirmationResponse>> completeBooking(
            @Valid @RequestBody BookingFlowRequest request) {
        try {
            BookingConfirmationResponse confirmation = bookingFlowService.completeBooking(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Booking completed successfully", confirmation));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Booking failed: " + e.getMessage(), null));
        }
    }

    /**
     * Cancel booking
     */
    @PostMapping("/cancel/{appointmentId}")
    public ResponseEntity<ApiResponse<String>> cancelBooking(
            @PathVariable Long appointmentId,
            @RequestParam(required = false) String reason,
            @RequestParam Long cancelledByUserId,
            @RequestParam String cancelledByRole) {
        try {
            bookingFlowService.cancelBooking(appointmentId, reason, cancelledByUserId, cancelledByRole);
            return ResponseEntity.ok(new ApiResponse<>(true, "Booking cancelled successfully", "Appointment cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Cancellation failed: " + e.getMessage(), null));
        }
    }

    /**
     * Quick booking validation (all steps at once)
     */
    @PostMapping("/validate-all")
    public ResponseEntity<ApiResponse<String>> validateAllSteps(@Valid @RequestBody BookingFlowRequest request) {
        try {
            // Validate veterinarian
            bookingFlowService.validateVeterinarianSelection(request.getVeterinarianId());
            
            // Validate slot
            bookingFlowService.validateSlotSelection(request.getSlotId(), request.getType());
            
            return ResponseEntity.ok(new ApiResponse<>(true, "All validations passed", "Ready to book"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Validation failed: " + e.getMessage(), null));
        }
    }
}