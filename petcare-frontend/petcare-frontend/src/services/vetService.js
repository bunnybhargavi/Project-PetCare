import api from './api';

export const vetService = {
  listAll: async () => {
    const { data } = await api.get('/veterinarians');
    return data;
  },

  getById: async (vetId) => {
    const { data } = await api.get(`/veterinarians/${vetId}`);
    return data;
  },

  // Advanced search with multiple criteria
  search: async (searchParams) => {
    const { data } = await api.post('/veterinarians/search', searchParams);
    return data;
  },

  // Search by specialization
  findBySpecialization: async (specialization) => {
    const { data } = await api.get(`/veterinarians/specialty/${specialization}`);
    return data;
  },

  // Search by location
  findByLocation: async (location) => {
    const { data } = await api.get(`/veterinarians/location/${location}`);
    return data;
  },

  // Get teleconsult vets
  getTeleconsultVets: async () => {
    const { data } = await api.get('/veterinarians/teleconsult');
    return data;
  },

  // Search vets with available slots
  searchWithAvailability: async (searchParams) => {
    const { data } = await api.post('/veterinarians/search-with-availability', searchParams);
    return data;
  }
};

export default vetService;

