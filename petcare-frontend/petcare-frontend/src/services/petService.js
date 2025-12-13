import api from './api';

const PET_ENDPOINT = '/pets';

export const petService = {
  // Get all pets for current owner
  getAllPets: async () => {
    const { data } = await api.get(PET_ENDPOINT);
    return data;
  },

  // Get pet by ID
  getPetById: async (petId) => {
    const { data } = await api.get(`${PET_ENDPOINT}/${petId}`);
    return data;
  },

  // Create new pet
  createPet: async (petData) => {
    const { data } = await api.post(PET_ENDPOINT, petData);
    return data;
  },

  // Legacy alias to avoid breaking existing imports
  addPet: async (petData) => {
    const { data } = await api.post(PET_ENDPOINT, petData);
    return data;
  },

  // Update pet
  updatePet: async (petId, petData) => {
    const { data } = await api.put(`${PET_ENDPOINT}/${petId}`, petData);
    return data;
  },

  // Delete pet
  deletePet: async (petId) => {
    const { data } = await api.delete(`${PET_ENDPOINT}/${petId}`);
    return data;
  },

  // Upload pet image
  uploadPetImage: async (petId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const { data } = await api.post(`${PET_ENDPOINT}/${petId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  },

  // Search pets
  searchPets: async (query) => {
    const { data } = await api.get(`${PET_ENDPOINT}/search`, {
      params: { q: query },
    });
    return data;
  },

  // Increment walk streak
  incrementWalkStreak: async (petId) => {
    const { data } = await api.post(`${PET_ENDPOINT}/${petId}/walk`);
    return data;
  },
};

export default petService;