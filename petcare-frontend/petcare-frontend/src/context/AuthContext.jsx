import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // Login functions (OTP-based)
  const requestLoginOtp = async (email) => {
    return authService.initiateLoginOtp(email);
  };

  const login = async (credentials) => {
    const userData = await authService.login(credentials);
    const normalized = userData?.user || userData;
    setUser(normalized);
    return normalized;
  };

  // Register function
  const register = async (email, otp, userData) => {
    const response = await authService.completeRegistration(email, otp, userData);
    const normalized = response?.user || response;
    setUser(normalized);
    return normalized;
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Update user data
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    login,
    requestLoginOtp,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};