import api from './api';

const base = (petId) => `/pets/${petId}/vaccinations`;

export const vaccinationService = {
  getVaccinationsByPet: async (petId) => {
    const { data } = await api.get(base(petId));
    return data;
  },

  createVaccination: async (petId, vaccinationData) => {
    const { data } = await api.post(base(petId), vaccinationData);
    return data;
  },

  updateVaccination: async (petId, vaccinationId, vaccinationData) => {
    const { data } = await api.put(`${base(petId)}/${vaccinationId}`, vaccinationData);
    return data;
  },

  deleteVaccination: async (petId, vaccinationId) => {
    const { data } = await api.delete(`${base(petId)}/${vaccinationId}`);
    return data;
  },
};