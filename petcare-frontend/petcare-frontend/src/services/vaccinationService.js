import api from './api';

export const vaccinationService = {
  getVaccinationsByPet: async (petId) => {
    const response = await api.get(`/vaccinations/pet/${petId}`);
    return response.data;
  },

  getVaccinationById: async (id) => {
    const response = await api.get(`/vaccinations/${id}`);
    return response.data;
  },

  createVaccination: async (vaccinationData) => {
    const response = await api.post('/vaccinations', vaccinationData);
    return response.data;
  },

  updateVaccination: async (id, vaccinationData) => {
    const response = await api.put(`/vaccinations/${id}`, vaccinationData);
    return response.data;
  },

  deleteVaccination: async (id) => {
    const response = await api.delete(`/vaccinations/${id}`);
    return response.data;
  },

  getUpcomingVaccinations: async (petId) => {
    const response = await api.get(`/vaccinations/pet/${petId}/upcoming`);
    return response.data;
  },
};