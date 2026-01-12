import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with auth token
const createAuthAxios = () => {
    const vendorToken = localStorage.getItem('vendorToken');
    const regularToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    
    const token = vendorToken || regularToken || sessionToken;
    
    console.log('VendorService Auth Debug:', {
        vendorToken: vendorToken ? 'exists' : 'null',
        regularToken: regularToken ? 'exists' : 'null', 
        sessionToken: sessionToken ? 'exists' : 'null',
        usingToken: token ? 'exists' : 'null'
    });
    
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    });
};

export const vendorService = {
    // OTP-based Authentication
    initiateRegistration: async (vendorData) => {
        try {
            console.log('Sending registration request to:', `${API_BASE_URL}/vendors/register/initiate`);
            console.log('Request data:', vendorData);
            
            const response = await axios.post(`${API_BASE_URL}/vendors/register/initiate`, vendorData);
            console.log('Response received:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error initiating vendor registration:', error);
            console.error('Error response:', error.response?.data);
            
            // Throw the actual error message from the backend
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.data) {
                throw error.response.data;
            } else {
                throw error;
            }
        }
    },

    completeRegistration: async (vendorData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/vendors/register/complete`, vendorData);
            return response.data;
        } catch (error) {
            console.error('Error completing vendor registration:', error);
            throw error.response?.data || error;
        }
    },

    initiateLogin: async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/vendors/login/initiate`, credentials);
            return response.data;
        } catch (error) {
            console.error('Error initiating vendor login:', error);
            throw error.response?.data || error;
        }
    },

    completeLogin: async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/vendors/login/complete`, credentials);
            if (response.data.success) {
                // Store vendor token
                localStorage.setItem('vendorToken', 'vendor_' + response.data.data.id);
                localStorage.setItem('vendorData', JSON.stringify(response.data.data));
            }
            return response.data;
        } catch (error) {
            console.error('Error completing vendor login:', error);
            throw error.response?.data || error;
        }
    },

    // Legacy password-based methods (deprecated)
    register: async (vendorData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/vendors/register`, vendorData);
            return response.data;
        } catch (error) {
            console.error('Error registering vendor (deprecated):', error);
            throw error.response?.data || error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/vendors/login`, credentials);
            if (response.data.success) {
                // Store vendor token
                localStorage.setItem('vendorToken', 'vendor_' + response.data.data.id);
                localStorage.setItem('vendorData', JSON.stringify(response.data.data));
            }
            return response.data;
        } catch (error) {
            console.error('Error logging in vendor (deprecated):', error);
            throw error.response?.data || error;
        }
    },

    logout: () => {
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('vendorData');
    },

    getCurrentVendor: () => {
        const vendorData = localStorage.getItem('vendorData');
        return vendorData ? JSON.parse(vendorData) : null;
    },

    isVendorLoggedIn: () => {
        return !!localStorage.getItem('vendorToken');
    },

    // Dashboard
    getDashboardStats: async (vendorId) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get(`/vendors/${vendorId}/dashboard`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error.response?.data || error;
        }
    },

    // Products
    getVendorProducts: async (vendorId) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get(`/vendors/${vendorId}/products`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vendor products:', error);
            throw error.response?.data || error;
        }
    },

    createVendorProduct: async (vendorId, productData) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.post(`/vendors/${vendorId}/products`, productData);
            return response.data;
        } catch (error) {
            console.error('Error creating vendor product:', error);
            throw error.response?.data || error;
        }
    },

    updateVendorProduct: async (vendorId, productId, productData) => {
        try {
            console.log('Updating product API call:', { vendorId, productId, productData });
            const authAxios = createAuthAxios();
            const response = await authAxios.put(`/vendors/${vendorId}/products/${productId}`, productData);
            console.log('Update product API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating vendor product:', error);
            console.error('Error response:', error.response?.data);
            
            // Return a structured error response
            if (error.response?.data) {
                throw error.response.data;
            } else {
                throw { success: false, message: error.message || 'Network error occurred' };
            }
        }
    },

    deleteVendorProduct: async (vendorId, productId) => {
        try {
            console.log('Deleting product API call:', { vendorId, productId });
            const authAxios = createAuthAxios();
            const response = await authAxios.delete(`/vendors/${vendorId}/products/${productId}`);
            console.log('Delete product API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error deleting vendor product:', error);
            console.error('Error response:', error.response?.data);
            
            // Return a structured error response
            if (error.response?.data) {
                throw error.response.data;
            } else {
                throw { success: false, message: error.message || 'Network error occurred' };
            }
        }
    },

    // Orders
    getVendorOrders: async (vendorId) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get(`/vendors/${vendorId}/orders`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vendor orders:', error);
            throw error.response?.data || error;
        }
    },

    // Vendor profile
    getVendorProfile: async (vendorId) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get(`/vendors/${vendorId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            throw error.response?.data || error;
        }
    },

    updateVendorProfile: async (vendorId, profileData) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.put(`/vendors/${vendorId}`, profileData);
            return response.data;
        } catch (error) {
            console.error('Error updating vendor profile:', error);
            throw error.response?.data || error;
        }
    },

    // Order management
    updateOrderStatus: async (vendorId, orderId, status) => {
        try {
            console.log('VendorService: Updating order status', { vendorId, orderId, status });
            
            // For order status updates, use a simple axios call without auth headers
            // since the endpoint is configured as permitAll in SecurityConfig
            const response = await axios.put(
                `${API_BASE_URL}/vendors/${vendorId}/orders/${orderId}/status?status=${status}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('VendorService: Update response', response.data);
            return response.data;
        } catch (error) {
            console.error('VendorService: Error updating order status:', error);
            console.error('VendorService: Error response:', error.response?.data);
            console.error('VendorService: Error status:', error.response?.status);
            console.error('VendorService: Error headers:', error.response?.headers);
            throw error.response?.data || error;
        }
    }
};

export default vendorService;