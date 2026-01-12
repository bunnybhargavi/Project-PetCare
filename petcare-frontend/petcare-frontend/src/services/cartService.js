import api from './api';

const cartService = {
    // Get user's cart
    getCart: async () => {
        const { data } = await api.get('/cart');
        return data;
    },

    // Add item to cart
    addToCart: async (productId, quantity = 1) => {
        const { data } = await api.post('/cart/add', {
            productId,
            quantity
        });
        return data;
    },

    // Update cart item quantity
    updateCartItem: async (cartItemId, quantity) => {
        const { data } = await api.put(`/cart/item/${cartItemId}?quantity=${quantity}`);
        return data;
    },

    // Remove item from cart
    removeFromCart: async (cartItemId) => {
        const { data } = await api.delete(`/cart/item/${cartItemId}`);
        return data;
    },

    // Clear cart
    clearCart: async () => {
        const { data } = await api.delete('/cart/clear');
        return data;
    }
};

// Export both named and default for compatibility
export { cartService };
export default cartService;