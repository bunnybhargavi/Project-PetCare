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
  // src/services/authService.js (Partial update to use sessionStorage)

  completeRegistration: async (email, otp, userData) => {
    const response = await api.post('/auth/register/complete', {
      email,
      otp,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      clinicName: userData.clinicName || null,
      clinic_name: userData.clinicName || null,
      specialization: userData.specialization || null,
    });

    const raw = handleResponse(response);
    const data = raw?.data ? raw.data : raw;
    const token = data?.token || raw?.token;
    const user = data?.user || data;

    // Save token and user data
    if (token) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    }

    return user;
  },

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
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data));
    }

    return data;
  },

  // (resendOtp ... uses sessionStorage already for registrationData)

  // ========================================
  // LOGIN FLOW (OTP-based)
  // ========================================

  // Step 1: Initiate login (send OTP)
  // Backend: POST /api/auth/login/initiate
  // Request: { email }
  // Response: { success, message }
  initiateLoginOtp: async (email) => {
    console.log('🔍 [authService] Calling initiateLoginOtp with:', email);

    try {
      const response = await api.post('/auth/login/initiate', { email });
      console.log('✅ [authService] login/initiate response:', response.data);
      return handleResponse(response);
    } catch (error) {
      console.error('❌ [authService] login/initiate error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Step 2: Complete login (verify OTP)
  // Backend: POST /api/auth/login/complete
  // Request: { email, otp }
  // Response: { token, user, message }
  login: async ({ email, otp }) => {
    const response = await api.post('/auth/login/complete', { email, otp });
    const raw = handleResponse(response);
    const data = raw?.data ? raw.data : raw;
    const token = data?.token || raw?.token;
    const user = data?.user || data?.userData || data;
    const normalizedUser = { ...(user || {}), token };

    if (token) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(normalizedUser));
    }

    return normalizedUser;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);

    // Update user data in sessionStorage
    const user = JSON.parse(sessionStorage.getItem('user'));
    sessionStorage.setItem('user', JSON.stringify({ ...user, ...response.data }));

    return response.data;
  },

  getCurrentUser: () => {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Backend logout failed:', error);
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },
};

export default authService;