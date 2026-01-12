package com.pets.petcare.controller;

import com.pets.petcare.dto.AdminStatsResponse;
import com.pets.petcare.dto.AppointmentStatusUpdateRequest;
import com.pets.petcare.entity.Appointment;
import com.pets.petcare.service.AppointmentService;
import com.pets.petcare.service.VetDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vet-dashboard")
@CrossOrigin(origins = "*")
public class VetDashboardController {

    @Autowired
    private VetDashboardService vetDashboardService;
    
    @Autowired
    private AppointmentService appointmentService;

    /**
     * Get vet dashboard statistics
     */
    @GetMapping("/stats/{vetId}")
    public ResponseEntity<AdminStatsResponse> getVetStats(@PathVariable Long vetId) {
        return ResponseEntity.ok(vetDashboardService.getVetStats(vetId));
    }

    /**
     * Get upcoming appointments for vet
     */
    @GetMapping("/appointments/upcoming/{vetId}")
    public ResponseEntity<List<Appointment>> getUpcomingAppointments(@PathVariable Long vetId) {
        return ResponseEntity.ok(appointmentService.getUpcomingAppointmentsForVet(vetId));
    }

    /**
     * Get today's appointments for vet
     */
    @GetMapping("/appointments/today/{vetId}")
    public ResponseEntity<List<Appointment>> getTodayAppointments(@PathVariable Long vetId) {
        return ResponseEntity.ok(appointmentService.getTodayAppointmentsForVet(vetId));
    }

    /**
     * Get appointments by status for vet
     */
    @GetMapping("/appointments/{vetId}/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(
            @PathVariable Long vetId,
            @PathVariable Appointment.AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getVetAppointmentsByStatus(vetId, status));
    }

    /**
     * Complete appointment with notes and prescription
     */
    @PutMapping("/appointments/{appointmentId}/complete")
    public ResponseEntity<Appointment> completeAppointment(
            @PathVariable Long appointmentId,
            @RequestBody AppointmentStatusUpdateRequest request) {
        
        // Set status to completed
        request.setStatus(Appointment.AppointmentStatus.COMPLETED);
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(appointmentId, request));
    }

    /**
     * Update appointment status (confirm, cancel, no-show)
     */
    @PutMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody AppointmentStatusUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(appointmentId, request));
    }
}