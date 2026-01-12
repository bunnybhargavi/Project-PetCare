import api from './api';

const base = (petId) => `/pets/${petId}/reminders`;

export const reminderService = {
  getRemindersByPet: async (petId) => {
    const { data } = await api.get(base(petId));
    return data;
  },

  getUpcomingReminders: async (petId) => {
    const { data } = await api.get(`${base(petId)}/upcoming`);
    return data;
  },

  getPendingReminders: async (petId) => {
    const { data } = await api.get(`${base(petId)}/pending`);
    return data;
  },

  createReminder: async (petId, reminderData) => {
    const { data } = await api.post(base(petId), reminderData);
    return data;
  },

  updateReminder: async (petId, reminderId, reminderData) => {
    const { data } = await api.put(`${base(petId)}/${reminderId}`, reminderData);
    return data;
  },

  deleteReminder: async (petId, reminderId) => {
    const { data } = await api.delete(`${base(petId)}/${reminderId}`);
    return data;
  },

  completeReminder: async (petId, reminderId) => {
    const { data } = await api.patch(`${base(petId)}/${reminderId}/complete`);
    return data;
  },
};

export default reminderService;