import api from './api';

const authService = {
  // Step 1: Initiate registration (send OTP)
  initiateRegistration: async (userData) => {
    const response = await api.post('/auth/register/initiate', {
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      clinicName: userData.clinicName || null,
      clinic_name: userData.clinicName || null, // support snake_case backend
      specialization: userData.specialization || null
    });
    return response.data;
  },

  // Step 2: Complete registration (verify OTP and create account)
  completeRegistration: async (email, otp, userData) => {
    const response = await api.post('/auth/register/complete', {
      email: email,
      otp: otp,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      clinicName: userData.clinicName || null,
      clinic_name: userData.clinicName || null, // support snake_case backend
      specialization: userData.specialization || null
    });

    const raw = response.data;
    // Normalize possible shapes: { token, ...user }, { token, user }, { data: { token, user } }
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

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  // OTP login flow
  initiateLoginOtp: async (email) => {
    const response = await api.post('/auth/login/initiate', { email });
    return response.data;
  },

  login: async ({ email, otp }) => {
    const response = await api.post('/auth/login/complete', { email, otp });

    const raw = response.data;
    const token = raw?.token;
    const user = raw?.user || raw;

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return user;
  },

  // Verify OTP (if needed separately)
  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Forgot password - request OTP
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with OTP
  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      newPassword
    });
    return response.data;
  }
};

export default authService;