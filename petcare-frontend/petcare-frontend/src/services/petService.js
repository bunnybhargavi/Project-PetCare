import axios from 'axios';

const API_URL = 'http://localhost:8080/api/pets';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const petService = {
  // Get all pets for current owner
  getAllPets: async () => {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Get pet by ID
  getPetById: async (petId) => {
    const response = await axios.get(`${API_URL}/${petId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Add new pet
  addPet: async (petData) => {
    const response = await axios.post(API_URL, petData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Update pet
  updatePet: async (petId, petData) => {
    const response = await axios.put(`${API_URL}/${petId}`, petData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Delete pet
  deletePet: async (petId) => {
    const response = await axios.delete(`${API_URL}/${petId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Upload pet image
  uploadPetImage: async (petId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axios.post(`${API_URL}/${petId}/image`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default petService;