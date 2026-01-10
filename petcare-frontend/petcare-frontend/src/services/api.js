import axios from 'axios';

// Support environment variable API URL or fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// --- REQUEST INTERCEPTOR: Attach JWT Token ---
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR: Handle Errors (401 + CORS Debugging) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout on 401
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Detect CORS / Network errors
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('CORS or Network Error:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
