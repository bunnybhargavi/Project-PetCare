import api from './api';

export const communityService = {
  listPosts: async (query) => {
    const { data } = await api.get('/community/posts', { params: { q: query } });
    return data;
  },
  createPost: async (payload) => {
    const { data } = await api.post('/community/posts', payload);
    return data;
  },
};

export default communityService;

