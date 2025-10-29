import api from './api';
import { cookieAuth } from '../utils/cookieAuth';

export const sellerAPI = {
  // Get seller profile
  getProfile: async () => {
    try {
      console.log('📡 Fetching seller profile from PHP backend...');
      const response = await api.get('/api/seller/me');
      console.log('✅ Seller profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch seller profile:', error);
      throw error;
    }
  },

  // Update seller profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/seller/me', profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update seller profile:', error);
      throw error;
    }
  },

  // Products management
  products: {
    // Get seller's products
    getProducts: async (params = {}) => {
      try {
        console.log('📡 Fetching seller products from PHP backend (DIRECT)...', params);
        
        // TEMPORARY: Use simple endpoint to bypass routing/CORS issues
        const url = `http://localhost:8080/S2EH/s2e-backend/seller-products-simple.php`;
        
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'omit', // Don't send credentials for now to avoid CORS preflight issues
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Full response:', data);
        console.log('✅ Products data:', data.data);
        
        // Return the data object which contains products, pagination, stats
        return data.data || data;
      } catch (error) {
        console.error('❌ Failed to fetch seller products:', error);
        throw error;
      }
    },

    // Get single product
    getProduct: async (id) => {
      try {
        // Include inventory fields to get stock information
        const response = await api.get(`/seller/products/${id}`, {
          params: {
            fields: 'id,*,variants.*,variants.inventory_quantity,variants.manage_inventory'
          }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch product:', error);
        throw error;
      }
    },

    // Create product
    createProduct: async (productData) => {
      try {
        console.log('📡 Creating product with PHP backend:', productData);
        const response = await api.post('/api/products/create', productData);
        console.log('✅ Product created:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to create product:', error);
        throw error;
      }
    },

    // Update product
    updateProduct: async (id, productData) => {
      try {
        console.log('📡 Updating product with PHP backend (SIMPLE):', id);
        console.log('📡 Product data:', productData);
        
        if (!id) {
          throw new Error('Product ID is required for update');
        }
        
        const response = await fetch(`http://localhost:8080/S2EH/s2e-backend/seller-product-update-simple.php?id=${id}`, {
          method: 'PUT',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Product updated:', data);
        return data;
      } catch (error) {
        console.error('❌ Failed to update product:', error);
        throw error;
      }
    },

    // Update variant
    updateVariant: async (variantId, variantData) => {
      try {
        console.log('🔍 Updating variant with ID:', variantId);
        console.log('🔍 Variant data:', variantData);
        console.log('🔍 API URL:', `/seller/variants/${variantId}`);
        
        if (!variantId) {
          throw new Error('Variant ID is required for update');
        }
        
        const response = await api.put(`/seller/variants/${variantId}`, variantData);
        console.log('🔍 Variant update response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to update variant:', error);
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          variantId: variantId
        });
        throw error;
      }
    },

    // Delete product
    deleteProduct: async (id) => {
      try {
        console.log('📡 Deleting product with PHP backend (SIMPLE):', id);
        
        const response = await fetch(`http://localhost:8080/S2EH/s2e-backend/seller-product-delete-simple.php?id=${id}`, {
          method: 'DELETE',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Product deleted:', data);
        return data;
      } catch (error) {
        console.error('❌ Failed to delete product:', error);
        throw error;
      }
    }
  },

  // Orders management
  orders: {
    // Get seller's orders
    getOrders: async (params = {}) => {
      try {
        const response = await api.get('/seller/orders', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch seller orders:', error);
        throw error;
      }
    },

    // Get single order
    getOrder: async (id) => {
      try {
        const response = await api.get(`/seller/orders/${id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch order:', error);
        throw error;
      }
    },

    // Update order status
    updateOrderStatus: async (id, statusData) => {
      try {
        const response = await api.put(`/seller/orders/${id}`, statusData);
        return response.data;
      } catch (error) {
        console.error('Failed to update order status:', error);
        throw error;
      }
    }
  },

  // Analytics
  analytics: {
    // Get seller analytics
    getAnalytics: async (params = {}) => {
      try {
        const response = await api.get('/seller/analytics', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        throw error;
      }
    },

    // Get sales data
    getSalesData: async (params = {}) => {
      try {
        const response = await api.get('/seller/analytics/sales', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch sales data:', error);
        throw error;
      }
    }
  },

  // Customer management
  customers: {
    // Get seller's customers
    getCustomers: async (params = {}) => {
      try {
        const response = await api.get('/seller/customers', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch seller customers:', error);
        throw error;
      }
    },

    // Get single customer
    getCustomer: async (id) => {
      try {
        const response = await api.get(`/seller/customers/${id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch customer:', error);
        throw error;
      }
    },

    // Create new customer
    createCustomer: async (customerData) => {
      try {
        const response = await api.post('/seller/customers', customerData);
        return response.data;
      } catch (error) {
        console.error('Failed to create customer:', error);
        throw error;
      }
    },

    // Update customer
    updateCustomer: async (id, customerData) => {
      try {
        const response = await api.put(`/seller/customers/${id}`, customerData);
        return response.data;
      } catch (error) {
        console.error('Failed to update customer:', error);
        throw error;
      }
    },

    // Delete customer
    deleteCustomer: async (id) => {
      try {
        const response = await api.delete(`/seller/customers/${id}`);
        return response.data;
      } catch (error) {
        console.error('Failed to delete customer:', error);
        throw error;
      }
    },

    // Add existing customer to seller
    addExistingCustomer: async (customerData) => {
      try {
        const response = await api.post('/seller/customers/add-existing', customerData);
        return response.data;
      } catch (error) {
        console.error('Failed to add existing customer:', error);
        throw error;
      }
    },

    // Get customer addresses
    getCustomerAddresses: async (customerId) => {
      try {
        const response = await api.get(`/store/customers/${customerId}/addresses`);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch customer addresses:', error);
        throw error;
      }
    },

    // Add customer address
    addCustomerAddress: async (customerId, addressData) => {
      try {
        const response = await api.post(`/store/customers/${customerId}/addresses`, addressData);
        return response.data;
      } catch (error) {
        console.error('Failed to add customer address:', error);
        throw error;
      }
    },

    // Update customer address
    updateCustomerAddress: async (customerId, addressId, addressData) => {
      try {
        const response = await api.put(`/store/customers/${customerId}/addresses/${addressId}`, addressData);
        return response.data;
      } catch (error) {
        console.error('Failed to update customer address:', error);
        throw error;
      }
    },

    // Delete customer address
    deleteCustomerAddress: async (customerId, addressId) => {
      try {
        const response = await api.delete(`/store/customers/${customerId}/addresses/${addressId}`);
        return response.data;
      } catch (error) {
        console.error('Failed to delete customer address:', error);
        throw error;
      }
    },

    // Get customer orders
    getCustomerOrders: async (customerId, params = {}) => {
      try {
        const response = await api.get(`/store/customers/${customerId}/orders`, { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch customer orders:', error);
        throw error;
      }
    }
  },

  // Stock Locations
  stockLocations: {
    // Get all stock locations (PHP backend handles seller_id via session)
    getStockLocations: async (params = {}) => {
      try {
        console.log('📡 Fetching stock locations from PHP backend...');
        const response = await api.get('/api/seller/stock-locations', { params });
        console.log('✅ Stock locations full response:', response.data);
        console.log('✅ Stock locations data:', response.data.data);
        // PHP backend returns { success, message, data: { stock_locations, count } }
        return response.data.data || response.data;
      } catch (error) {
        console.error('❌ Failed to fetch stock locations:', error);
        throw error;
      }
    },

    // Get single stock location
    getStockLocation: async (id) => {
      try {
        console.log(`📡 Fetching stock location ${id}...`);
        const response = await api.get(`/api/seller/stock-locations/${id}`);
        console.log('✅ Stock location response:', response.data);
        // PHP backend returns { success, message, data: {...} }
        return response.data.data || response.data;
      } catch (error) {
        console.error('❌ Failed to fetch stock location:', error);
        throw error;
      }
    },

    // Create stock location (PHP backend handles seller_id via session)
    createStockLocation: async (stockLocationData) => {
      try {
        console.log('📤 Creating stock location:', stockLocationData);
        const response = await api.post('/api/seller/stock-locations', stockLocationData);
        console.log('✅ Stock location created:', response.data);
        // PHP backend returns { success, message, data: { id } }
        return response.data.data || response.data;
      } catch (error) {
        console.error('❌ Failed to create stock location:', error);
        throw error;
      }
    },

    // Update stock location
    updateStockLocation: async (id, stockLocationData) => {
      try {
        console.log(`📤 Updating stock location ${id}:`, stockLocationData);
        const response = await api.put(`/api/seller/stock-locations/${id}`, stockLocationData);
        console.log('✅ Stock location updated:', response.data);
        // PHP backend returns { success, message, data: { id } }
        return response.data.data || response.data;
      } catch (error) {
        console.error('❌ Failed to update stock location:', error);
        throw error;
      }
    },

    // Delete stock location
    deleteStockLocation: async (id) => {
      try {
        console.log(`🗑️ Deleting stock location ${id}...`);
        const response = await api.delete(`/api/seller/stock-locations/${id}`);
        console.log('✅ Stock location deleted:', response.data);
        // PHP backend returns { success, message, data: { id } }
        return response.data.data || response.data;
      } catch (error) {
        console.error('❌ Failed to delete stock location:', error);
        throw error;
      }
    }
  }
};
