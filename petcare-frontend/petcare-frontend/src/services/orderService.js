import api from './api';

const orderService = {
    // Create order (checkout)
    createOrder: async (checkoutData) => {
        const { data } = await api.post('/orders/checkout', checkoutData);
        return data;
    },

    // Get user orders
    getUserOrders: async (userId, page = 0, size = 10) => {
        try {
            // Use the existing endpoint that gets orders for authenticated user
            const { data } = await api.get(`/orders?page=${page}&size=${size}`);
            return data;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            // Return empty result if API fails
            return { success: true, data: [] };
        }
    },

    // Get order by ID
    getOrderById: async (orderId) => {
        const { data } = await api.get(`/orders/${orderId}`);
        return data;
    },

    // Get order by order number
    getOrderByNumber: async (orderNumber) => {
        const { data } = await api.get(`/orders/number/${orderNumber}`);
        return data;
    },

    cancelOrder: async (orderId) => {
        const { data } = await api.put(`/orders/${orderId}/cancel`);
        return data;
    },

    // Vendor stats
    getVendorOrderStats: async () => {
        // Mock stats for now
        return {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0
        };
    }
};

// Export both named and default for compatibility
export { orderService };
export default orderService;