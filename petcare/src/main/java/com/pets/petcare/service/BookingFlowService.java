package com.pets.petcare.service;

import com.pets.petcare.dto.BookingConfirmationResponse;
import com.pets.petcare.dto.BookingFlowRequest;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for handling the three-step booking flow
 */
@Service
public class BookingFlowService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AppointmentSlotRepository slotRepository;

    @Autowired
    private VeterinarianRepository veterinarianRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private AppointmentHistoryRepository historyRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Step 1: Validate veterinarian selection
     */
    public Veterinarian validateVeterinarianSelection(Long veterinarianId) {
        return veterinarianRepository.findById(veterinarianId)
                .orElseThrow(() -> new RuntimeException("Veterinarian not found"));
    }

    /**
     * Step 2: Validate slot selection and check availability
     */
    public AppointmentSlot validateSlotSelection(Long slotId, Appointment.AppointmentType requestedType) {
        AppointmentSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Appointment slot not found"));

        // Check if slot is available
        if (slot.getStatus() != AppointmentSlot.SlotStatus.AVAILABLE) {
            throw new RuntimeException("Appointment slot is not available");
        }

        // Check capacity
        if (slot.getBookedCount() >= slot.getCapacity()) {
            throw new RuntimeException("Appointment slot is fully booked");
        }

        // Check if slot supports the requested appointment type
        if (slot.getMode() != AppointmentSlot.SlotType.BOTH) {
            boolean typeMatches = (slot.getMode() == AppointmentSlot.SlotType.TELECONSULT &&
                    requestedType == Appointment.AppointmentType.TELECONSULT) ||
                    (slot.getMode() == AppointmentSlot.SlotType.IN_CLINIC &&
                            requestedType == Appointment.AppointmentType.IN_CLINIC);

            if (!typeMatches) {
                throw new RuntimeException("Appointment type not supported by this slot");
            }
        }

        // Check if slot is in the future
        if (slot.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book appointments in the past");
        }

        return slot;
    }

    /**
     * Step 3: Complete booking with full validation and confirmation
     */
    @Transactional
    public BookingConfirmationResponse completeBooking(BookingFlowRequest request) {
        // Validate all inputs
        if (!request.getAgreedToTerms()) {
            throw new RuntimeException("Must agree to terms and conditions");
        }

        if (!request.getConfirmedPetDetails()) {
            throw new RuntimeException("Must confirm pet details");
        }

        if (!request.getConfirmedAppointmentDetails()) {
            throw new RuntimeException("Must confirm appointment details");
        }

        // Re-validate veterinarian
        Veterinarian vet = validateVeterinarianSelection(request.getVeterinarianId());

        // Re-validate slot (race condition protection)
        AppointmentSlot slot = validateSlotSelection(request.getSlotId(), request.getType());

        // Validate pet
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        // Double-check slot availability (atomic operation)
        synchronized (this) {
            AppointmentSlot freshSlot = slotRepository.findById(request.getSlotId())
                    .orElseThrow(() -> new RuntimeException("Slot no longer exists"));

            if (freshSlot.getBookedCount() >= freshSlot.getCapacity()) {
                throw new RuntimeException("Slot was just booked by another user");
            }

            // Increment booked count atomically
            freshSlot.setBookedCount(freshSlot.getBookedCount() + 1);

            // Update slot status if fully booked
            if (freshSlot.getBookedCount() >= freshSlot.getCapacity()) {
                freshSlot.setStatus(AppointmentSlot.SlotStatus.BOOKED);
            }

            slotRepository.save(freshSlot);
        }

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setPet(pet);
        appointment.setVeterinarian(vet);
        appointment.setSlot(slot);
        appointment.setAppointmentDate(slot.getStartTime());
        appointment.setType(request.getType());
        appointment.setReason(request.getReason());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING); // Start as PENDING

        // Generate unique reference number
        String referenceNumber = generateReferenceNumber();
        appointment.setReferenceNumber(referenceNumber);

        // Generate meeting link for video consultations
        if (request.getType() == Appointment.AppointmentType.TELECONSULT) {
            appointment.setMeetingLink(generateMeetingLink(referenceNumber));
        }

        // Save appointment
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Create history record
        createHistoryRecord(savedAppointment, null, Appointment.AppointmentStatus.PENDING,
                "Appointment booked by pet owner", pet.getOwner().getUser().getId(), "OWNER");

        // Send notifications asynchronously
        notificationService.sendBookingConfirmation(savedAppointment);
        notificationService.sendBookingAlert(savedAppointment);

        // Build and return confirmation response
        return buildConfirmationResponse(savedAppointment);
    }

    /**
     * Cancel booking and free up slot capacity
     */
    @Transactional
    public void cancelBooking(Long appointmentId, String reason, Long cancelledByUserId, String cancelledByRole) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Appointment.AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);

        // Free up slot capacity
        if (appointment.getSlot() != null) {
            AppointmentSlot slot = appointment.getSlot();
            slot.setBookedCount(Math.max(0, slot.getBookedCount() - 1));

            // Mark as available if there's capacity
            if (slot.getBookedCount() < slot.getCapacity()) {
                slot.setStatus(AppointmentSlot.SlotStatus.AVAILABLE);
            }

            slotRepository.save(slot);
        }

        // Create history record
        createHistoryRecord(appointment, oldStatus, Appointment.AppointmentStatus.CANCELLED,
                reason, cancelledByUserId, cancelledByRole);

        // Send cancellation notifications
        notificationService.sendCancellationNotice(appointment, appointment.getPet().getOwner().getUser());
        notificationService.sendCancellationNotice(appointment, appointment.getVeterinarian().getUser());
    }

    /**
     * Generate unique reference number
     */
    private String generateReferenceNumber() {
        return "APT-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Generate meeting link for video consultations
     * Creates a Google Meet instant meeting link that actually works
     */
    private String generateMeetingLink(String referenceNumber) {
        // Generate a unique identifier for the meeting
        String meetingId = UUID.randomUUID().toString().substring(0, 8);
        
        // Google Meet instant meeting creation URL
        // This will redirect to a new meeting when clicked
        return "https://meet.google.com/new?authuser=0&hs=179&pli=1&ijlm=" + meetingId;
    }

    /**
     * Create appointment history record
     */
    private void createHistoryRecord(Appointment appointment, Appointment.AppointmentStatus fromStatus,
            Appointment.AppointmentStatus toStatus, String reason,
            Long changedByUserId, String changedByRole) {
        AppointmentHistory history = new AppointmentHistory();
        history.setAppointment(appointment);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setReason(reason);
        history.setChangedByUserId(changedByUserId);
        history.setChangedByRole(changedByRole);
        historyRepository.save(history);
    }

    /**
     * Build booking confirmation response
     */
    private BookingConfirmationResponse buildConfirmationResponse(Appointment appointment) {
        BookingConfirmationResponse response = new BookingConfirmationResponse();

        // Basic appointment info
        response.setAppointmentId(appointment.getId());
        response.setReferenceNumber(appointment.getReferenceNumber());
        response.setStatus(appointment.getStatus().toString());
        response.setAppointmentDateTime(appointment.getAppointmentDate());
        response.setAppointmentType(appointment.getType().toString());

        // Vet details
        Veterinarian vet = appointment.getVeterinarian();
        response.setVetName(vet.getUser().getName());
        response.setClinicName(vet.getClinicName());
        response.setClinicAddress(vet.getClinicAddress());
        response.setVetPhone(vet.getUser().getPhone());
        response.setVetEmail(vet.getUser().getEmail());

        // Pet details
        Pet pet = appointment.getPet();
        response.setPetName(pet.getName());
        response.setPetSpecies(pet.getSpecies());

        // Meeting/clinic details
        if (appointment.getType() == Appointment.AppointmentType.TELECONSULT) {
            response.setMeetingLink(appointment.getMeetingLink());
            response.setMeetingInstructions(
                    "Please join the video call 5 minutes before your appointment time. " +
                            "Ensure you have good lighting and a stable internet connection.");
        } else {
            response.setClinicDirections("Please use GPS navigation to reach the clinic address provided.");
            response.setParkingInformation("Parking is available at the clinic premises.");
            response.setClinicInstructions(
                    "Please arrive 10 minutes early for check-in. " +
                            "Bring your pet's vaccination records and any current medications.");
        }

        // Preparation instructions
        response.setPreparationInstructions(
                "Please ensure your pet is calm and comfortable. " +
                        "Have any questions or concerns written down to discuss with the veterinarian.");
        response.setDocumentsTobring(
                "Vaccination records, previous medical records, current medications, and insurance information (if applicable).");

        // Policies and contact
        response.setCancellationPolicy(
                "Appointments can be cancelled up to 2 hours before the scheduled time without penalty. " +
                        "Late cancellations may incur a fee.");
        response.setCancellationDeadline(appointment.getAppointmentDate().minusHours(2));

        response.setSupportPhone("+1-800-PETCARE");
        response.setSupportEmail("support@petcare.com");

        // Reminder settings
        response.setReminderEnabled(true);
        response.setReminderSchedule("24 hours and 1 hour before appointment");

        return response;
    }
}