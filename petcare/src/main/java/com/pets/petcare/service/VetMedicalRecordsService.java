package com.pets.petcare.service;

import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import com.pets.petcare.dto.BatchHealthMeasurementRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Set;
import java.util.HashSet;

/**
 * VetMedicalRecordsService - Provides vets access to comprehensive pet medical data
 */
@Service
public class VetMedicalRecordsService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private VaccinationRepository vaccinationRepository;

    @Autowired
    private HealthMeasurementRepository healthMeasurementRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private VeterinarianRepository veterinarianRepository;

    /**
     * Get complete medical history for a pet (for vet access)
     */
    public PetMedicalSummary getCompleteMedicalHistory(Long petId, Long vetId) {
        // Verify vet has access to this pet (through appointments)
        boolean hasAccess = appointmentRepository.existsByPetIdAndVeterinarianId(petId, vetId);
        if (!hasAccess) {
            throw new RuntimeException("Access denied: No appointment history with this pet");
        }

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        // Get all medical records
        List<MedicalRecord> medicalRecords = medicalRecordRepository.findByPetIdOrderByVisitDateDesc(petId);
        
        // Get all vaccinations
        List<Vaccination> vaccinations = vaccinationRepository.findByPetIdOrderByDateGivenDesc(petId);
        
        // Get all health measurements
        List<HealthMeasurement> healthMeasurements = healthMeasurementRepository.findByPetIdOrderByMeasurementDateDesc(petId);
        
        // Get active reminders
        List<Reminder> reminders = reminderRepository.findByPetIdAndStatusOrderByDueDateAsc(petId, Reminder.ReminderStatus.PENDING);

        // Get appointment history with this vet
        List<Appointment> appointmentHistory = appointmentRepository.findByPetIdAndVeterinarianIdOrderByAppointmentDateDesc(petId, vetId);

        return new PetMedicalSummary(pet, medicalRecords, vaccinations, healthMeasurements, reminders, appointmentHistory);
    }

    /**
     * Get medical records by type
     */
    public List<MedicalRecord> getMedicalRecordsByType(Long petId, Long vetId, String recordType) {
        // Verify access
        boolean hasAccess = appointmentRepository.existsByPetIdAndVeterinarianId(petId, vetId);
        if (!hasAccess) {
            throw new RuntimeException("Access denied");
        }

        if (recordType == null) {
            return medicalRecordRepository.findByPetIdOrderByVisitDateDesc(petId);
        }

        // Convert string to enum
        MedicalRecord.RecordType type;
        try {
            type = MedicalRecord.RecordType.valueOf(recordType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid record type: " + recordType);
        }

        return medicalRecordRepository.findByPetIdAndRecordTypeOrderByVisitDateDesc(petId, type);
    }

    /**
     * Get vaccination history
     */
    public List<Vaccination> getVaccinationHistory(Long petId, Long vetId) {
        // Verify access
        boolean hasAccess = appointmentRepository.existsByPetIdAndVeterinarianId(petId, vetId);
        if (!hasAccess) {
            throw new RuntimeException("Access denied");
        }

        return vaccinationRepository.findByPetIdOrderByDateGivenDesc(petId);
    }

    /**
     * Get recent health measurements
     */
    public List<HealthMeasurement> getRecentHealthMeasurements(Long petId, Long vetId, int limit) {
        // Verify access
        boolean hasAccess = appointmentRepository.existsByPetIdAndVeterinarianId(petId, vetId);
        if (!hasAccess) {
            throw new RuntimeException("Access denied");
        }

        return healthMeasurementRepository.findTop10ByPetIdOrderByMeasurementDateDesc(petId);
    }

    /**
     * Add consultation notes after teleconsultation
     */
    public MedicalRecord addConsultationNotes(Long appointmentId, Long vetId, String notes, String diagnosis, String prescription) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Verify vet owns this appointment
        if (!appointment.getVeterinarian().getId().equals(vetId)) {
            throw new RuntimeException("Access denied");
        }

        // Update appointment with notes and prescription
        appointment.setNotes(notes);
        appointment.setPrescription(prescription);
        appointmentRepository.save(appointment);

        // Create medical record for this consultation
        MedicalRecord record = new MedicalRecord();
        record.setPet(appointment.getPet());
        record.setRecordType(MedicalRecord.RecordType.TREATMENT);
        record.setVisitDate(appointment.getAppointmentDate().toLocalDate());
        record.setDiagnosis(diagnosis);
        record.setTreatment(prescription);
        record.setNotes(notes);
        record.setVetName(appointment.getVeterinarian().getUser().getName());

        return medicalRecordRepository.save(record);
    }

    /**
     * Add custom health measurement
     */
    public HealthMeasurement addHealthMeasurement(Long petId, Long vetId, String measurementType, String value, String unit, String notes) {
        // Verify vet has access to this pet
        boolean hasAccess = appointmentRepository.existsByPetIdAndVeterinarianId(petId, vetId);
        if (!hasAccess) {
            throw new RuntimeException("Access denied: No appointment history with this pet");
        }

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        HealthMeasurement measurement = new HealthMeasurement();
        measurement.setPet(pet);
        measurement.setMeasurementDate(java.time.LocalDate.now());
        measurement.setMeasurementType(measurementType);
        measurement.setValue(value);
        measurement.setUnit(unit);
        measurement.setNotes(notes);
        measurement.setRecordedByVetId(vetId);
        
        // Get vet name
        Optional<Veterinarian> vet = veterinarianRepository.findById(vetId);
        if (vet.isPresent()) {
            measurement.setVetName(vet.get().getUser().getName());
        }

        // Set specific measurement fields based on type
        try {
            switch (measurementType.toLowerCase()) {
                case "weight":
                    measurement.setWeight(Double.parseDouble(value));
                    break;
                case "temperature":
                    measurement.setTemperature(Double.parseDouble(value));
                    break;
                case "heart rate":
                    measurement.setHeartRate(Double.parseDouble(value));
                    break;
                case "blood pressure":
                    measurement.setBloodPressure(value);
                    break;
                case "blood sugar":
                    measurement.setBloodSugar(Double.parseDouble(value));
                    break;
                case "respiratory rate":
                    measurement.setRespiratoryRate(Double.parseDouble(value));
                    break;
            }
        } catch (NumberFormatException e) {
            // Keep as string value if not numeric
        }

        return healthMeasurementRepository.save(measurement);
    }

    /**
     * Add multiple health measurements at once
     */
    public List<HealthMeasurement> addMultipleHealthMeasurements(Long petId, Long vetId, List<BatchHealthMeasurementRequest.SingleMeasurement> measurements) {
        List<HealthMeasurement> savedMeasurements = new ArrayList<>();
        
        for (BatchHealthMeasurementRequest.SingleMeasurement measurement : measurements) {
            HealthMeasurement saved = addHealthMeasurement(
                petId, 
                vetId, 
                measurement.getMeasurementType(), 
                measurement.getValue(), 
                measurement.getUnit(), 
                measurement.getNotes()
            );
            savedMeasurements.add(saved);
        }
        
        return savedMeasurements;
    }

    /**
     * Get available measurement types for a vet's practice
     */
    public List<String> getAvailableMeasurementTypes(Long vetId) {
        // Get unique measurement types used by this vet
        List<String> customTypes = healthMeasurementRepository.findDistinctMeasurementTypesByVetId(vetId);
        
        // Add standard measurement types
        List<String> standardTypes = Arrays.asList(
            "Weight", "Temperature", "Heart Rate", "Blood Pressure", "Blood Sugar", 
            "Respiratory Rate", "Body Condition Score", "Dental Score", "Pain Score",
            "Hydration Level", "Mobility Assessment", "Appetite Level", "Energy Level"
        );
        
        // Combine and remove duplicates
        Set<String> allTypes = new HashSet<>(standardTypes);
        allTypes.addAll(customTypes);
        
        return new ArrayList<>(allTypes);
    }

    /**
     * Inner class for comprehensive medical summary
     */
    public static class PetMedicalSummary {
        private Pet pet;
        private List<MedicalRecord> medicalRecords;
        private List<Vaccination> vaccinations;
        private List<HealthMeasurement> healthMeasurements;
        private List<Reminder> activeReminders;
        private List<Appointment> appointmentHistory;

        public PetMedicalSummary(Pet pet, List<MedicalRecord> medicalRecords, 
                               List<Vaccination> vaccinations, List<HealthMeasurement> healthMeasurements,
                               List<Reminder> activeReminders, List<Appointment> appointmentHistory) {
            this.pet = pet;
            this.medicalRecords = medicalRecords;
            this.vaccinations = vaccinations;
            this.healthMeasurements = healthMeasurements;
            this.activeReminders = activeReminders;
            this.appointmentHistory = appointmentHistory;
        }

        // Getters
        public Pet getPet() { return pet; }
        public List<MedicalRecord> getMedicalRecords() { return medicalRecords; }
        public List<Vaccination> getVaccinations() { return vaccinations; }
        public List<HealthMeasurement> getHealthMeasurements() { return healthMeasurements; }
        public List<Reminder> getActiveReminders() { return activeReminders; }
        public List<Appointment> getAppointmentHistory() { return appointmentHistory; }
    }
}