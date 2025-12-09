import api from './api';

export const healthService = {
  getMeasurementsByPet: async (petId) => {
    const response = await api.get(`/health-measurements/pet/${petId}`);
    return response.data;
  },

  getMeasurementById: async (id) => {
    const response = await api.get(`/health-measurements/${id}`);
    return response.data;
  },

  createMeasurement: async (measurementData) => {
    const response = await api.post('/health-measurements', measurementData);
    return response.data;
  },

  updateMeasurement: async (id, measurementData) => {
    const response = await api.put(`/health-measurements/${id}`, measurementData);
    return response.data;
  },

  deleteMeasurement: async (id) => {
    const response = await api.delete(`/health-measurements/${id}`);
    return response.data;
  },

  getLatestMeasurements: async (petId) => {
    const response = await api.get(`/health-measurements/pet/${petId}/latest`);
    return response.data;
  },

  getMeasurementsByType: async (petId, type) => {
    const response = await api.get(`/health-measurements/pet/${petId}/type/${type}`);
    return response.data;
  },
};