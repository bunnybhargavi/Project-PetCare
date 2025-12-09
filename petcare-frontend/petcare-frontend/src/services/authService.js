import api from './api';

const handleResponse = (response) => {
  if (response?.data && response.data.success === false) {
    const err = new Error(response.data.message || 'Request failed');
    err.response = { data: response.data, status: response.status };
    throw err;
  }
  return response.data;
};

const authService = {
  // ========================================
  // REGISTRATION FLOW (OTP-based)
  // ========================================

  // Step 1: Initiate registration (send OTP)
  // Backend: POST /api/auth/register/initiate
  // Request: { email, name, phone, role }
  // Response: { success, message }
  initiateRegistration: async (userData) => {
    console.log('🔍 [authService] Calling initiateRegistration with:', {
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      clinicName: userData.clinicName,
      specialization: userData.specialization,
    });
    
    try {
      const response = await api.post('/auth/register/initiate', {
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        clinicName: userData.clinicName || null,
        clinic_name: userData.clinicName || null, // support snake_case backend
        specialization: userData.specialization || null,
      });
      
      console.log('✅ [authService] register/initiate response:', response.data);
      return handleResponse(response);
    } catch (error) {
      console.error('❌ [authService] register/initiate error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Step 2: Complete registration (verify OTP + create account)
  // Backend: POST /api/auth/register/complete
  // Request: { email, otp, name, phone, role, clinicName?, specialization? }
  // Response: { token, userId, email, name, role, message }
  completeRegistration: async (email, otp, userData) => {
    const response = await api.post('/auth/register/complete', {
      email,
      otp,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      clinicName: userData.clinicName || null,
      clinic_name: userData.clinicName || null, // support snake_case backend
      specialization: userData.specialization || null,
    });

    const raw = handleResponse(response);
    const data = raw?.data ? raw.data : raw;
    const token = data?.token || raw?.token;
    const user = data?.user || data;

    // Save token and user data
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return user;
  },

  // Alias: Verify OTP (calls completeRegistration)
  verifyOtp: async (email, otp) => {
    const userData = JSON.parse(sessionStorage.getItem('registrationData')) || {};
    if (!userData.name) {
      throw new Error('Registration data not found. Please start signup again.');
    }
    
    const response = await api.post('/auth/register/complete', {
      email,
      otp,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
    });

    const data = handleResponse(response);

    // Save token and user data
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }

    return data;
  },

  // Alias: Resend OTP (calls initiateRegistration)
  resendOtp: async (email) => {
    const userData = JSON.parse(sessionStorage.getItem('registrationData'));
    if (!userData) {
      throw new Error('Registration data not found. Please start signup again.');
    }
    
    try {
      const response = await api.post('/auth/register/initiate', {
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('❌ [authService] register/initiate error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ========================================
  // LOGIN FLOW (OTP-based)
  // ========================================

  // Step 1: Request a login OTP
  // Backend: POST /auth/login/initiate
  // Request: { email }
  // Response: { success, message }
  initiateLoginOtp: async (email) => {
    const response = await api.post('/auth/login/initiate', { email });
    return handleResponse(response);
  },

  // Step 2: Verify login OTP and create session
  // Backend: POST /auth/login/complete
  // Request: { email, otp }
  // Response: { token, userId, email, name, role, message }
  login: async ({ email, otp }) => {
    const response = await api.post('/auth/login/complete', { email, otp });
    const raw = handleResponse(response);
    // Normalize possible shapes: { token, ...user }, { data: { token, user } }, { token, user }
    const data = raw?.data ? raw.data : raw;
    const token = data?.token || raw?.token;
    const user = data?.user || data?.userData || data;
    const normalizedUser = { ...(user || {}), token };

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }

    return normalizedUser;
  },

  // ========================================
  // PROFILE MANAGEMENT
  // ========================================

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);

    // Update user data in localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    localStorage.setItem('user', JSON.stringify({ ...user, ...response.data }));

    return response.data;
  },

  // Upload profile photo
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // ========================================
  // USER SESSION
  // ========================================

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

export default authService;