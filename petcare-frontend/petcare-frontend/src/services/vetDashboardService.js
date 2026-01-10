import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class VetDashboardService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/vet-dashboard`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Dashboard Statistics
  async getVetStats(vetId) {
    try {
      const response = await this.api.get(`/stats/${vetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vet stats:', error);
      throw error;
    }
  }

  // Appointment Management
  async getUpcomingAppointments(vetId) {
    try {
      const response = await this.api.get(`/appointments/upcoming/${vetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }

  async getTodayAppointments(vetId) {
    try {
      const response = await this.api.get(`/appointments/today/${vetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      throw error;
    }
  }

  async getAppointmentsByStatus(vetId, status) {
    try {
      const response = await this.api.get(`/appointments/${vetId}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments by status:', error);
      throw error;
    }
  }

  async completeAppointment(appointmentId, completionData) {
    try {
      const response = await this.api.put(`/appointments/${appointmentId}/complete`, completionData);
      return response.data;
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  }

  async updateAppointmentStatus(appointmentId, statusUpdate) {
    try {
      const response = await this.api.put(`/appointments/${appointmentId}/status`, statusUpdate);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }
}

export default new VetDashboardService();