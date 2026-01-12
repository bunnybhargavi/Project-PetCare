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
    },

    // Get upcoming available slots for a vet
    getUpcomingAvailableSlots: async (vetId) => {
        const { data } = await api.get(`/appointments/slots/${vetId}/upcoming`);
        return data;
    },

    // Get slots by date range
    getSlotsByDateRange: async (vetId, startDate, endDate) => {
        const { data } = await api.get(`/appointments/slots/${vetId}/range`, {
            params: { startDate, endDate }
        });
        return data;
    },

    // Update a slot
    updateSlot: async (slotId, slotData) => {
        const { data } = await api.put(`/appointments/slots/${slotId}`, slotData);
        return data;
    },

    // Delete a slot
    deleteSlot: async (slotId) => {
        await api.delete(`/appointments/slots/${slotId}`);
    },

    // Cancel appointment (owner side)
    cancelAppointmentOwner: async (appointmentId) => {
        await api.post(`/appointments/${appointmentId}/cancel`);
    },

    // Get appointments for owner
    getOwnerAppointments: async (ownerId) => {
        const { data } = await api.get(`/appointments/owner/${ownerId}`);
        return data;
    },

    // Get pending appointments for vet (requiring approval)
    getPendingAppointments: async (vetId) => {
        const { data } = await api.get(`/appointments/vet/${vetId}/pending`);
        return data;
    },

    // Approve a pending appointment
    approveAppointment: async (appointmentId, vetNotes = '') => {
        const { data } = await api.post(`/appointments/${appointmentId}/approve`, {
            vetNotes
        });
        return data;
    },

    // Reject a pending appointment
    rejectAppointment: async (appointmentId, rejectionReason = '') => {
        const { data } = await api.post(`/appointments/${appointmentId}/reject`, {
            rejectionReason
        });
        return data;
    }
};
