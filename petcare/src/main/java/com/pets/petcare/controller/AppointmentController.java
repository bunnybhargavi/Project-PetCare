package com.pets.petcare.controller;

import com.pets.petcare.dto.AppointmentRequest;
import com.pets.petcare.dto.AppointmentStatusUpdateRequest;
import com.pets.petcare.dto.AppointmentApprovalRequest;
import com.pets.petcare.dto.AppointmentRejectionRequest;
import com.pets.petcare.dto.SlotRequest;
import com.pets.petcare.entity.Appointment;
import com.pets.petcare.entity.Appointment.AppointmentStatus;
import com.pets.petcare.entity.AppointmentSlot;
import com.pets.petcare.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping("/slots")
    public ResponseEntity<AppointmentSlot> createSlot(@RequestParam Long vetId, @RequestBody SlotRequest request) {
        return ResponseEntity.ok(appointmentService.createSlot(vetId, request));
    }

    @GetMapping("/slots/{vetId}")
    public ResponseEntity<List<AppointmentSlot>> getAvailableSlots(@PathVariable Long vetId) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(vetId));
    }

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.bookAppointment(request));
    }

    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<Appointment>> getPetAppointments(@PathVariable Long petId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForPet(petId));
    }

    @GetMapping("/vet/{vetId}")
    public ResponseEntity<List<Appointment>> getVetAppointments(@PathVariable Long vetId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForVet(vetId));
    }

    /**
     * Update appointment status and add notes/prescription
     */
    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(appointmentId, request));
    }

    /**
     * Get appointments by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(status));
    }

    /**
     * Get vet appointments filtered by status
     */
    @GetMapping("/vet/{vetId}/status/{status}")
    public ResponseEntity<List<Appointment>> getVetAppointmentsByStatus(
            @PathVariable Long vetId,
            @PathVariable AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getVetAppointmentsByStatus(vetId, status));
    }

    /**
     * Get upcoming available slots for a vet
     */
    @GetMapping("/slots/{vetId}/upcoming")
    public ResponseEntity<List<AppointmentSlot>> getUpcomingAvailableSlots(@PathVariable Long vetId) {
        return ResponseEntity.ok(appointmentService.getUpcomingAvailableSlots(vetId));
    }

    /**
     * Get slots by date range
     */
    @GetMapping("/slots/{vetId}/range")
    public ResponseEntity<List<AppointmentSlot>> getSlotsByDateRange(
            @PathVariable Long vetId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            java.time.LocalDate start = java.time.LocalDate.parse(startDate);
            java.time.LocalDate end = java.time.LocalDate.parse(endDate);
            return ResponseEntity.ok(appointmentService.getVetSlotsByDateRange(vetId, start, end));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update a slot
     */
    @PutMapping("/slots/{slotId}")
    public ResponseEntity<AppointmentSlot> updateSlot(
            @PathVariable Long slotId,
            @RequestBody SlotRequest request) {
        return ResponseEntity.ok(appointmentService.updateSlot(slotId, request));
    }

    /**
     * Delete a slot
     */
    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long slotId) {
        appointmentService.deleteSlot(slotId);
        return ResponseEntity.ok().build();
    }

    /**
     * Cancel appointment (owner side)
     */
    @PostMapping("/{appointmentId}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long appointmentId) {
        appointmentService.cancelAppointmentAndFreeSlot(appointmentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get appointments for owner (by pet owner ID)
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Appointment>> getOwnerAppointments(@PathVariable Long ownerId) {
        // This will need to be implemented in the service
        return ResponseEntity.ok(appointmentService.getAppointmentsForOwner(ownerId));
    }

    /**
     * Get pending appointments for vet (requiring approval)
     */
    @GetMapping("/vet/{vetId}/pending")
    public ResponseEntity<List<Appointment>> getPendingAppointments(@PathVariable Long vetId) {
        return ResponseEntity.ok(appointmentService.getPendingAppointmentsForVet(vetId));
    }

    /**
     * Approve a pending appointment
     */
    @PostMapping("/{appointmentId}/approve")
    public ResponseEntity<Appointment> approveAppointment(
            @PathVariable Long appointmentId,
            @RequestBody(required = false) AppointmentApprovalRequest request) {
        return ResponseEntity.ok(appointmentService.approveAppointment(appointmentId,
                request != null ? request.getVetNotes() : null));
    }

    /**
     * Reject a pending appointment
     */
    @PostMapping("/{appointmentId}/reject")
    public ResponseEntity<Appointment> rejectAppointment(
            @PathVariable Long appointmentId,
            @RequestBody(required = false) AppointmentRejectionRequest request) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(appointmentId,
                request != null ? request.getRejectionReason() : null));
    }
}
