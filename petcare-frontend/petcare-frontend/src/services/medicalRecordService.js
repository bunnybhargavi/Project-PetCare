import api from './api';

const base = (petId) => `/pets/${petId}/medical-records`;

export const medicalRecordService = {
  getRecordsByPet: async (petId) => {
    const { data } = await api.get(base(petId));
    return data;
  },

  getRecordsByType: async (petId, type) => {
    const { data } = await api.get(`${base(petId)}/type/${type}`);
    return data;
  },

  getRecordsByDateRange: async (petId, start, end) => {
    const { data } = await api.get(`${base(petId)}/date-range`, {
      params: { start, end },
    });
    return data;
  },

  createRecord: async (petId, recordData) => {
    const { data } = await api.post(base(petId), recordData);
    return data;
  },

  updateRecord: async (petId, recordId, recordData) => {
    const { data } = await api.put(`${base(petId)}/${recordId}`, recordData);
    return data;
  },

  deleteRecord: async (petId, recordId) => {
    const { data } = await api.delete(`${base(petId)}/${recordId}`);
    return data;
  },

  uploadAttachment: async (petId, recordId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`${base(petId)}/${recordId}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};