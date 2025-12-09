import api from './api';

export const medicalRecordService = {
  getRecordsByPet: async (petId) => {
    const response = await api.get(`/medical-records/pet/${petId}`);
    return response.data;
  },

  getRecordById: async (id) => {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },

  createRecord: async (recordData) => {
    const response = await api.post('/medical-records', recordData);
    return response.data;
  },

  updateRecord: async (id, recordData) => {
    const response = await api.put(`/medical-records/${id}`, recordData);
    return response.data;
  },

  deleteRecord: async (id) => {
    const response = await api.delete(`/medical-records/${id}`);
    return response.data;
  },
};