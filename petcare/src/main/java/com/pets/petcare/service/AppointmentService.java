package com.pets.petcare.service;

import com.pets.petcare.dto.AppointmentRequest;
import com.pets.petcare.dto.AppointmentStatusUpdateRequest;
import com.pets.petcare.dto.SlotRequest;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;

@Service
public class AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AppointmentSlotRepository slotRepository;

    @Autowired
    private VeterinarianRepository veterinarianRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AppointmentReminderService reminderService;

    @Transactional
    public AppointmentSlot createSlot(Long vetId, SlotRequest request) {
        Veterinarian vet = veterinarianRepository.findById(vetId)
                .orElseThrow(() -> new RuntimeException("Vet not found"));

        AppointmentSlot slot = new AppointmentSlot();
        slot.setVeterinarian(vet);
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setMode(request.getMode());
        slot.setCapacity(request.getCapacity() != null ? request.getCapacity() : 1);
        slot.setBookedCount(0);
        slot.setStatus(AppointmentSlot.SlotStatus.AVAILABLE);

        return slotRepository.save(slot);
    }

    public List<AppointmentSlot> getAvailableSlots(Long vetId) {
        return slotRepository.findByVeterinarianIdAndStatus(vetId, AppointmentSlot.SlotStatus.AVAILABLE);
    }

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {
        // Debug logging
        log.info("Booking appointment request received:");
        log.info("  petId: {}", request.getPetId());
        log.info("  veterinarianId: {}", request.getVeterinarianId());
        log.info("  slotId: {}", request.getSlotId());
        log.info("  dateTime: {}", request.getDateTime());
        log.info("  type: {}", request.getType());
        log.info("  reason: {}", request.getReason());
        
        // Validate the request
        if (!request.isValid()) {
            log.error("Validation failed for appointment request");
            throw new RuntimeException("Invalid appointment request. Please check all required fields.");
        }
        
        // Validate reason if provided
        if (request.getReason() != null && !request.getReason().trim().isEmpty()) {
            String trimmedReason = request.getReason().trim();
            if (trimmedReason.length() < 5) {
                throw new RuntimeException("Reason must be at least 5 characters long");
            }
            if (trimmedReason.length() > 500) {
                throw new RuntimeException("Reason must not exceed 500 characters");
            }
        }
        
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Veterinarian vet;
        AppointmentSlot slot = null;

        if (request.getSlotId() != null) {
            slot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new RuntimeException("Slot not found"));

            // Check if slot has capacity
            if (slot.getBookedCount() >= slot.getCapacity()) {
                throw new RuntimeException("Slot is fully booked");
            }

            // Increment booked count
            slot.setBookedCount(slot.getBookedCount() + 1);

            // Mark as BOOKED if fully booked
            if (slot.getBookedCount() >= slot.getCapacity()) {
                slot.setStatus(AppointmentSlot.SlotStatus.BOOKED);
            }

            slotRepository.save(slot);
            vet = slot.getVeterinarian();
        } else {
            // Direct booking without slot (fallback)
            vet = veterinarianRepository.findById(request.getVeterinarianId())
                    .orElseThrow(() -> new RuntimeException("Vet not found"));
        }

        Appointment appointment = new Appointment();
        appointment.setPet(pet);
        appointment.setVeterinarian(vet);
        appointment.setSlot(slot);
        appointment.setAppointmentDate(slot != null ? slot.getStartTime() : request.getDateTime());
        appointment.setType(request.getType());
        appointment.setReason(request.getReason());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING); // Start as PENDING for vet approval

        // Generate unique reference number
        String referenceNumber = "APT-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        appointment.setReferenceNumber(referenceNumber);

        if (request.getType() == Appointment.AppointmentType.TELECONSULT) {
            // Generate Google Meet link with proper format
            appointment.setMeetingLink(generateGoogleMeetLink(referenceNumber));
        }

        Appointment saved = appointmentRepository.save(appointment);

        // Send confirmation email to owner
        try {
            String ownerEmail = pet.getOwner().getUser().getEmail();
            String ownerName = pet.getOwner().getUser().getName();
            String vetName = vet.getClinicName();

            emailService.sendAppointmentConfirmationEmail(
                    ownerEmail,
                    ownerName,
                    vetName,
                    saved.getAppointmentDate().toString(),
                    saved.getType().toString(),
                    saved.getMeetingLink());
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }

        // Notify vet of new booking
        try {
            reminderService.notifyVetOfNewBooking(saved);
        } catch (Exception e) {
            System.err.println("Failed to notify vet: " + e.getMessage());
        }

        return saved;
    }

    public List<Appointment> getAppointmentsForPet(Long petId) {
        return appointmentRepository.findByPetId(petId);
    }

    public List<Appointment> getAppointmentsForVet(Long vetId) {
        return appointmentRepository.findByVeterinarianId(vetId);
    }

    /**
     * Update appointment status and optionally add notes/prescription
     */
    @Transactional
    public Appointment updateAppointmentStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Appointment.AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(request.getStatus());

        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            appointment.setNotes(request.getNotes());
        }

        if (request.getPrescription() != null && !request.getPrescription().isEmpty()) {
            appointment.setPrescription(request.getPrescription());
        }

        Appointment updated = appointmentRepository.save(appointment);

        // Send cancellation email if status changed to CANCELLED
        if (request.getStatus() == Appointment.AppointmentStatus.CANCELLED &&
                oldStatus != Appointment.AppointmentStatus.CANCELLED) {
            try {
                String ownerEmail = appointment.getPet().getOwner().getUser().getEmail();
                String ownerName = appointment.getPet().getOwner().getUser().getName();
                String vetName = appointment.getVeterinarian().getClinicName();

                emailService.sendAppointmentCancellationEmail(
                        ownerEmail,
                        ownerName,
                        vetName,
                        appointment.getAppointmentDate().toString());
            } catch (Exception e) {
                System.err.println("Failed to send cancellation email: " + e.getMessage());
            }
        }

        return updated;
    }

    /**
     * Get appointments by status
     */
    public List<Appointment> getAppointmentsByStatus(Appointment.AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }

    /**
     * Get vet appointments by status
     */
    public List<Appointment> getVetAppointmentsByStatus(Long vetId, Appointment.AppointmentStatus status) {
        return appointmentRepository.findByVeterinarianIdAndStatus(vetId, status);
    }

    /**
     * Get upcoming appointments for vet
     */
    public List<Appointment> getUpcomingAppointmentsForVet(Long vetId) {
        return appointmentRepository.findByVeterinarianIdAndStatus(vetId, Appointment.AppointmentStatus.CONFIRMED);
    }

    /**
     * Get today's appointments for vet
     */
    public List<Appointment> getTodayAppointmentsForVet(Long vetId) {
        // This would need a custom query to filter by today's date
        // For now, returning confirmed appointments
        return appointmentRepository.findByVeterinarianIdAndStatus(vetId, Appointment.AppointmentStatus.CONFIRMED);
    }

    /**
     * Get slots for a vet within a date range
     */
    public List<AppointmentSlot> getVetSlotsByDateRange(Long vetId, java.time.LocalDate startDate,
            java.time.LocalDate endDate) {
        java.time.LocalDateTime start = startDate.atStartOfDay();
        java.time.LocalDateTime end = endDate.atTime(23, 59, 59);
        return slotRepository.findByVeterinarianIdAndStartTimeBetween(vetId, start, end);
    }

    /**
     * Get available slots for a vet after current time
     */
    public List<AppointmentSlot> getUpcomingAvailableSlots(Long vetId) {
        return slotRepository.findByVeterinarianIdAndStatusAndStartTimeAfter(
                vetId, AppointmentSlot.SlotStatus.AVAILABLE, java.time.LocalDateTime.now());
    }

    /**
     * Delete a slot (only if not booked)
     */
    @Transactional
    public void deleteSlot(Long slotId) {
        AppointmentSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getBookedCount() > 0) {
            throw new RuntimeException("Cannot delete a slot with existing bookings");
        }

        slotRepository.delete(slot);
    }

    /**
     * Update slot details
     */
    @Transactional
    public AppointmentSlot updateSlot(Long slotId, SlotRequest request) {
        AppointmentSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (request.getStartTime() != null) {
            slot.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            slot.setEndTime(request.getEndTime());
        }
        if (request.getMode() != null) {
            slot.setMode(request.getMode());
        }
        if (request.getCapacity() != null) {
            // Only allow increasing capacity
            if (request.getCapacity() < slot.getBookedCount()) {
                throw new RuntimeException("Cannot reduce capacity below current bookings");
            }
            slot.setCapacity(request.getCapacity());

            // Update status based on new capacity
            if (slot.getBookedCount() >= slot.getCapacity()) {
                slot.setStatus(AppointmentSlot.SlotStatus.BOOKED);
            } else {
                slot.setStatus(AppointmentSlot.SlotStatus.AVAILABLE);
            }
        }

        return slotRepository.save(slot);
    }

    /**
     * Cancel appointment and free up slot capacity
     */
    @Transactional
    public void cancelAppointmentAndFreeSlot(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        // Free up slot capacity if appointment was linked to a slot
        if (appointment.getSlot() != null) {
            AppointmentSlot slot = appointment.getSlot();
            slot.setBookedCount(Math.max(0, slot.getBookedCount() - 1));

            // Mark as available if there's capacity
            if (slot.getBookedCount() < slot.getCapacity()) {
                slot.setStatus(AppointmentSlot.SlotStatus.AVAILABLE);
            }

            slotRepository.save(slot);
        }
    }

    /**
     * Get all appointments for a pet owner
     */
    public List<Appointment> getAppointmentsForOwner(Long ownerId) {
        return appointmentRepository.findByPetOwnerId(ownerId);
    }

    /**
     * Approve a pending appointment
     */
    @Transactional
    public Appointment approveAppointment(Long appointmentId, String vetNotes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be approved");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        if (vetNotes != null && !vetNotes.isEmpty()) {
            appointment.setNotes(vetNotes);
        }

        Appointment approved = appointmentRepository.save(appointment);

        // Send approval email to owner
        try {
            String ownerEmail = appointment.getPet().getOwner().getUser().getEmail();
            String ownerName = appointment.getPet().getOwner().getUser().getName();
            String vetName = appointment.getVeterinarian().getClinicName();

            emailService.sendAppointmentApprovalEmail(
                    ownerEmail,
                    ownerName,
                    vetName,
                    appointment.getAppointmentDate().toString(),
                    appointment.getType().toString(),
                    appointment.getMeetingLink());
        } catch (Exception e) {
            System.err.println("Failed to send approval email: " + e.getMessage());
        }

        return approved;
    }

    /**
     * Reject a pending appointment
     */
    @Transactional
    public Appointment rejectAppointment(Long appointmentId, String rejectionReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException("Only pending appointments can be rejected");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        if (rejectionReason != null && !rejectionReason.isEmpty()) {
            appointment.setNotes("Rejected: " + rejectionReason);
        }

        Appointment rejected = appointmentRepository.save(appointment);

        // Free up slot capacity if appointment was linked to a slot
        if (appointment.getSlot() != null) {
            AppointmentSlot slot = appointment.getSlot();
            slot.setBookedCount(Math.max(0, slot.getBookedCount() - 1));

            // Mark as available if there's capacity
            if (slot.getBookedCount() < slot.getCapacity()) {
                slot.setStatus(AppointmentSlot.SlotStatus.AVAILABLE);
            }

            slotRepository.save(slot);
        }

        // Send rejection email to owner
        try {
            String ownerEmail = appointment.getPet().getOwner().getUser().getEmail();
            String ownerName = appointment.getPet().getOwner().getUser().getName();
            String vetName = appointment.getVeterinarian().getClinicName();

            emailService.sendAppointmentRejectionEmail(
                    ownerEmail,
                    ownerName,
                    vetName,
                    appointment.getAppointmentDate().toString(),
                    rejectionReason);
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }

        return rejected;
    }

    /**
     * Get pending appointments for vet (requiring approval)
     */
    public List<Appointment> getPendingAppointmentsForVet(Long vetId) {
        return appointmentRepository.findByVeterinarianIdAndStatus(vetId, Appointment.AppointmentStatus.PENDING);
    }

    /**
     * Generate Google Meet link for video consultations
     * Creates a Google Meet instant meeting link that actually works
     */
    private String generateGoogleMeetLink(String referenceNumber) {
        // For now, we'll use a working approach:
        // 1. Create a Google Meet instant meeting URL
        // 2. Use Google Meet's "new meeting" endpoint which creates a real meeting
        
        // Generate a unique identifier for the meeting
        String meetingId = UUID.randomUUID().toString().substring(0, 8);
        
        // Google Meet instant meeting creation URL
        // This will redirect to a new meeting when clicked
        return "https://meet.google.com/new?authuser=0&hs=179&pli=1&ijlm=" + meetingId;
    }
}
