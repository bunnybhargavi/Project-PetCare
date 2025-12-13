package com.pets.petcare.controller;

import com.pets.petcare.dto.AppointmentRequest;
import com.pets.petcare.dto.AppointmentStatusUpdateRequest;
import com.pets.petcare.dto.SlotRequest;
import com.pets.petcare.entity.Appointment;
import com.pets.petcare.entity.Appointment.AppointmentStatus;
import com.pets.petcare.entity.AppointmentSlot;
import com.pets.petcare.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/slots")
    public ResponseEntity<AppointmentSlot> createSlot(@RequestParam Long vetId, @RequestBody SlotRequest request) {
        return ResponseEntity.ok(appointmentService.createSlot(vetId, request));
    }

    @GetMapping("/slots/{vetId}")
    public ResponseEntity<List<AppointmentSlot>> getAvailableSlots(@PathVariable Long vetId) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(vetId));
    }

    @PostMapping("/book")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentRequest request) {
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
            @RequestBody AppointmentStatusUpdateRequest request) {
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
}
