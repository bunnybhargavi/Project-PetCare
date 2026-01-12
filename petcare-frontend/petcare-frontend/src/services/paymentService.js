import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with auth token
const createAuthAxios = () => {
    const token = sessionStorage.getItem('token');
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    });
};

export const paymentService = {
    // Test configuration
    testConfiguration: async () => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get('/payments/test/config');
            return response.data;
        } catch (error) {
            console.error('Error testing configuration:', error);
            throw error.response?.data || error;
        }
    },

    // Get public keys
    getPublicKeys: async () => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get('/payments/test/keys');
            return response.data;
        } catch (error) {
            console.error('Error getting public keys:', error);
            throw error.response?.data || error;
        }
    },

    // Create payment order
    createPaymentOrder: async (orderData) => {
        try {
            const authAxios = createAuthAxios();
            console.log('Creating payment order with data:', orderData);
            const response = await authAxios.post('/payments/create-order', orderData);
            console.log('Payment order response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating payment order:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error.response?.data || error;
        }
    },

    // Verify payment
    verifyPayment: async (verificationData) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.post('/payments/verify', verificationData);
            return response.data;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error.response?.data || error;
        }
    },

    // Handle payment failure
    handlePaymentFailure: async (failureData) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.post('/payments/failure', failureData);
            return response.data;
        } catch (error) {
            console.error('Error handling payment failure:', error);
            throw error.response?.data || error;
        }
    },

    // Get user payments
    getUserPayments: async (userId) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get(`/payments/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user payments:', error);
            throw error.response?.data || error;
        }
    },

    // Get order payment
    getOrderPayment: async (orderId) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get(`/payments/order/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order payment:', error);
            throw error.response?.data || error;
        }
    },

    // Get payment by ID
    getPaymentById: async (paymentId) => {
        try {
            const authAxios = createAuthAxios();
            const response = await authAxios.get(`/payments/${paymentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching payment:', error);
            throw error.response?.data || error;
        }
    },

    // Initialize PayPal payment
    initializePayPalPayment: (paymentData, onSuccess, onFailure) => {
        // Check if this is a mock payment (for testing when PayPal is not configured)
        if (paymentData.paypalClientId === 'mock_client_id_for_testing' ||
            paymentData.paypalClientId === 'mock_client_id' ||
            !paymentData.approvalUrl) {
            // Simulate payment process for testing
            setTimeout(() => {
                const mockResponse = {
                    paypalPaymentId: paymentData.paypalPaymentId,
                    payerId: 'PAYER_' + Date.now()
                };

                const verificationData = {
                    paypalPaymentId: mockResponse.paypalPaymentId,
                    payerId: mockResponse.payerId
                };

                onSuccess(verificationData);
            }, 2000); // Simulate 2 second payment process
            return;
        }

        // Redirect to PayPal approval URL
        if (paymentData.approvalUrl) {
            // Store payment data for return handling
            sessionStorage.setItem('paypalPaymentData', JSON.stringify(paymentData));

            // Redirect to PayPal
            window.location.href = paymentData.approvalUrl;
        } else {
            onFailure({
                paypalPaymentId: paymentData.paypalPaymentId,
                failureReason: 'No PayPal approval URL provided'
            });
        }
    },

    // Handle PayPal return (success)
    handlePayPalReturn: async (paymentId, payerId) => {
        try {
            const verificationData = {
                paypalPaymentId: paymentId,
                payerId: payerId
            };

            const response = await paymentService.verifyPayment(verificationData);
            return response;
        } catch (error) {
            console.error('Error handling PayPal return:', error);
            throw error;
        }
    },

    // Handle PayPal cancel
    handlePayPalCancel: async (paymentId) => {
        try {
            const failureData = {
                paypalPaymentId: paymentId,
                failureReason: 'Payment cancelled by user'
            };

            await paymentService.handlePaymentFailure(failureData);
        } catch (error) {
            console.error('Error handling PayPal cancel:', error);
            throw error;
        }
    },

    // Load PayPal SDK (not needed for redirect flow, but kept for compatibility)
    loadPayPalScript: () => {
        return new Promise((resolve) => {
            // PayPal redirect flow doesn't need SDK loading
            resolve(true);
        });
    }
};

export default paymentService;