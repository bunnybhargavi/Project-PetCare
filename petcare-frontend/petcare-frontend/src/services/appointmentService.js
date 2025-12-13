import api from './api';

export const appointmentService = {
    getAvailableSlots: async (vetId) => {
        const { data } = await api.get(`/appointments/slots/${vetId}`);
        return data;
    },

    bookAppointment: async (bookingData) => {
        const { data } = await api.post('/appointments/book', bookingData);
        return data;
    },

    getPetAppointments: async (petId) => {
        const { data } = await api.get(`/appointments/pet/${petId}`);
        return data;
    },

    createSlot: async (slotData) => {
        const { data } = await api.post(`/appointments/slots?vetId=${slotData.vetId}`, slotData);
        return data;
    },

    getVetAppointments: async (vetId) => {
        const { data } = await api.get(`/appointments/vet/${vetId}`);
        return data;
    },

    // New methods for enhanced appointment management
    updateAppointmentStatus: async (appointmentId, statusData) => {
        const { data } = await api.put(`/appointments/${appointmentId}/status`, statusData);
        return data;
    },

    getAppointmentsByStatus: async (status) => {
        const { data } = await api.get(`/appointments/status/${status}`);
        return data;
    },

    getVetAppointmentsByStatus: async (vetId, status) => {
        const { data } = await api.get(`/appointments/vet/${vetId}/status/${status}`);
        return data;
    },

    cancelAppointment: async (appointmentId, notes = '') => {
        const { data } = await api.put(`/appointments/${appointmentId}/status`, {
            status: 'CANCELLED',
            notes
        });
        return data;
    },

    completeAppointment: async (appointmentId, notes, prescription) => {
        const { data } = await api.put(`/appointments/${appointmentId}/status`, {
            status: 'COMPLETED',
            notes,
            prescription
        });
        return data;
    }
};
