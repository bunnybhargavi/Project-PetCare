import axios from 'axios';

const API_URL = 'http://localhost:8080/api/pets';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all reminders for a pet
export const getReminders = async (petId) => {
  const response = await axios.get(`${API_URL}/${petId}/reminders`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get upcoming reminders (next 7 days)
export const getUpcomingReminders = async (petId) => {
  const response = await axios.get(`${API_URL}/${petId}/reminders/upcoming`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get reminders by type (VACCINATION, CHECKUP, MEDICATION, GROOMING, etc.)
export const getRemindersByType = async (petId, type) => {
  const response = await axios.get(`${API_URL}/${petId}/reminders/type/${type}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get single reminder
export const getReminderById = async (petId, reminderId) => {
  const response = await axios.get(`${API_URL}/${petId}/reminders/${reminderId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Create reminder
export const createReminder = async (petId, reminderData) => {
  const response = await axios.post(`${API_URL}/${petId}/reminders`, reminderData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Update reminder
export const updateReminder = async (petId, reminderId, reminderData) => {
  const response = await axios.put(`${API_URL}/${petId}/reminders/${reminderId}`, reminderData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Delete reminder
export const deleteReminder = async (petId, reminderId) => {
  const response = await axios.delete(`${API_URL}/${petId}/reminders/${reminderId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Mark reminder as completed
export const completeReminder = async (petId, reminderId) => {
  const response = await axios.patch(`${API_URL}/${petId}/reminders/${reminderId}/complete`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

export default {
  getReminders,
  getUpcomingReminders,
  getRemindersByType,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder
};