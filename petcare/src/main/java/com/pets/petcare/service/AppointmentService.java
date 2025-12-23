package com.pets.petcare.service;

import com.pets.petcare.dto.AppointmentRequest;
import com.pets.petcare.dto.AppointmentStatusUpdateRequest;
import com.pets.petcare.dto.SlotRequest;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;

@Service
public class AppointmentService {

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
        slot.setSupportedType(request.getSupportedType());
        slot.setStatus(AppointmentSlot.SlotStatus.AVAILABLE);

        return slotRepository.save(slot);
    }

    public List<AppointmentSlot> getAvailableSlots(Long vetId) {
        return slotRepository.findByVeterinarianIdAndStatus(vetId, AppointmentSlot.SlotStatus.AVAILABLE);
    }

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Veterinarian vet;
        AppointmentSlot slot = null;

        if (request.getSlotId() != null) {
            slot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new RuntimeException("Slot not found"));

            if (slot.getStatus() != AppointmentSlot.SlotStatus.AVAILABLE) {
                throw new RuntimeException("Slot is already booked");
            }

            slot.setStatus(AppointmentSlot.SlotStatus.BOOKED);
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
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED); // Auto confirm for now

        if (request.getType() == Appointment.AppointmentType.VIDEO) {
            // Generate Jitsi Meet link
            appointment.setMeetingLink("https://meet.jit.si/PetCare-" + UUID.randomUUID().toString());
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
}
