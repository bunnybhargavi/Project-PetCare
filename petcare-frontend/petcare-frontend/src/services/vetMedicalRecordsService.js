import api from './api';

export const vetMedicalRecordsService = {
    // Get complete medical history for a pet
    getCompleteMedicalHistory: async (petId, vetId) => {
        const { data } = await api.get(`/vet/medical-records/pet/${petId}/complete?vetId=${vetId}`);
        return data;
    },

    // Get medical records by type
    getMedicalRecordsByType: async (petId, vetId, type = null) => {
        const params = new URLSearchParams({ vetId });
        if (type) params.append('type', type);
        
        const { data } = await api.get(`/vet/medical-records/pet/${petId}/records?${params}`);
        return data;
    },

    // Get vaccination history
    getVaccinationHistory: async (petId, vetId) => {
        const { data } = await api.get(`/vet/medical-records/pet/${petId}/vaccinations?vetId=${vetId}`);
        return data;
    },

    // Get recent health measurements
    getRecentHealthMeasurements: async (petId, vetId) => {
        const { data } = await api.get(`/vet/medical-records/pet/${petId}/health-measurements?vetId=${vetId}`);
        return data;
    },

    // Add consultation notes after teleconsultation
    addConsultationNotes: async (appointmentId, vetId, notes, diagnosis, prescription) => {
        const { data } = await api.post(`/vet/medical-records/consultation-notes/${appointmentId}`, {
            vetId,
            notes,
            diagnosis,
            prescription
        });
        return data;
    },

    // Add custom health measurement
    addHealthMeasurement: async (petId, vetId, measurementType, value, unit, notes) => {
        const { data } = await api.post(`/vet/medical-records/pet/${petId}/health-measurement`, {
            vetId,
            measurementType,
            value,
            unit,
            notes
        });
        return data;
    },

    // Add multiple health measurements at once
    addMultipleHealthMeasurements: async (petId, vetId, measurements) => {
        const { data } = await api.post(`/vet/medical-records/pet/${petId}/health-measurements/batch`, {
            vetId,
            measurements
        });
        return data;
    },

    // Get available measurement types for a vet's practice
    getAvailableMeasurementTypes: async (vetId) => {
        const { data } = await api.get(`/vet/medical-records/measurement-types?vetId=${vetId}`);
        return data;
    }
};