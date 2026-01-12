import api from './api';

const base = (petId) => `/pets/${petId}/measurements`;

export const healthService = {
  getMeasurementsByPet: async (petId) => {
    const { data } = await api.get(base(petId));
    return data;
  },

  getRecentMeasurements: async (petId) => {
    const { data } = await api.get(`${base(petId)}/recent`);
    return data;
  },

  getMeasurementsByDateRange: async (petId, start, end) => {
    const { data } = await api.get(`${base(petId)}/date-range`, {
      params: { start, end },
    });
    return data;
  },

  createMeasurement: async (petId, measurementData) => {
    const { data } = await api.post(base(petId), measurementData);
    return data;
  },

  updateMeasurement: async (petId, measurementId, measurementData) => {
    const { data } = await api.put(`${base(petId)}/${measurementId}`, measurementData);
    return data;
  },

  deleteMeasurement: async (petId, measurementId) => {
    const { data } = await api.delete(`${base(petId)}/${measurementId}`);
    return data;
  },
};