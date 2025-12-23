import api from './api';

const productService = {
  // Get all active products
  getAllProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Search products with filters
  searchProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'ALL') {
        params.append('category', filters.category);
      }
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }
      if (filters.searchTerm) {
        params.append('searchTerm', filters.searchTerm);
      }
      if (filters.page !== undefined) {
        params.append('page', filters.page);
      }
      if (filters.size !== undefined) {
        params.append('size', filters.size);
      }

      const response = await api.get(`/products/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      const response = await api.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get vendor's products
  getMyProducts: async () => {
    try {
      const response = await api.get('/products/vendor/my-products');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      throw error;
    }
  },

  // Create new product (vendor only)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product (vendor only)
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (vendor only)
  deleteProduct: async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Update stock quantity (vendor only)
  updateStock: async (productId, quantity) => {
    try {
      await api.patch(`/products/${productId}/stock?quantity=${quantity}`);
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  // Get vendor statistics
  getVendorStats: async () => {
    try {
      const response = await api.get('/products/vendor/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }
  }
};

export default productService;