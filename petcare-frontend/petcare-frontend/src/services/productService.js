import api from './api';

const productService = {
    // Get all products with pagination and sorting
    getAllProducts: async (page = 0, size = 12, sortBy = 'createdAt', sortDir = 'desc') => {
        const { data } = await api.get(`/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
        return data;
    },

    // Get products by category
    getProductsByCategory: async (category, page = 0, size = 12) => {
        const { data } = await api.get(`/products/category/${category}?page=${page}&size=${size}`);
        return data;
    },

    // Search products
    searchProducts: async (query, page = 0, size = 12) => {
        const { data } = await api.get(`/products/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
        return data;
    },

    // Filter products by price range
    getProductsByPriceRange: async (minPrice, maxPrice, page = 0, size = 12) => {
        const { data } = await api.get(`/products/filter/price?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`);
        return data;
    },

    // Filter products by category and price range
    getProductsByCategoryAndPriceRange: async (category, minPrice, maxPrice, page = 0, size = 12) => {
        const { data } = await api.get(`/products/filter/category-price?category=${category}&minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`);
        return data;
    },

    // Get featured products
    getFeaturedProducts: async (page = 0, size = 8) => {
        const { data } = await api.get(`/products/featured?page=${page}&size=${size}`);
        return data;
    },

    // Get product by ID
    getProductById: async (id) => {
        const { data } = await api.get(`/products/${id}`);
        return data;
    },

    // Get all categories
    getAllCategories: async () => {
        const { data } = await api.get('/products/categories');
        return data;
    },

    // Admin endpoints
    createProduct: async (productData) => {
        const { data } = await api.post('/products/admin', productData);
        return data;
    },

    updateProduct: async (id, productData) => {
        const { data } = await api.put(`/products/admin/${id}`, productData);
        return data;
    },

    // Vendor specific methods
    getMyProducts: async () => {
        // For now, return all products as we don't have a specific endpoint yet
        // In a real app, this would filter by the logged-in vendor's ID
        const { data } = await api.get('/products?page=0&size=100');
        return data.content || [];
    },

    getVendorStats: async () => {
        // Mock stats for now
        return {
            totalProducts: 0,
            views: 0,
            rating: 0
        };
    },

    deleteProduct: async (id) => {
        const { data } = await api.delete(`/products/admin/${id}`);
        return data;
    }
};

// Export both named and default for compatibility
export { productService };
export default productService;