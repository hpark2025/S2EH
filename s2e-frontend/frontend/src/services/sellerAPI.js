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

  // Get seller stats from database
  getStats: async () => {
    try {
      console.log('📡 Fetching seller stats from PHP backend...');
      const response = await api.get('/api/seller/stats');
      console.log('✅ Seller stats:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch seller stats:', error);
      throw error;
    }
  },

  // Upload seller avatar
  uploadAvatar: async (file) => {
    try {
      console.log('📤 Uploading seller avatar...');
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Let axios handle Content-Type automatically for FormData
      const response = await api.post('/api/seller/avatar', formData);
      console.log('✅ Avatar uploaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to upload avatar:', error);
      throw error;
    }
  },

  // Get seller customers
  getCustomers: async () => {
    try {
      console.log('📡 Fetching seller customers...');
      const response = await api.get('/api/seller/customers');
      console.log('✅ Seller customers:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch customers:', error);
      throw error;
    }
  },

  // Products management
  products: {
    // Get seller's products
    getProducts: async (params = {}) => {
      try {
        console.log('📡 Using native fetch to bypass Axios issues...');
        
        const token = localStorage.getItem('sellerToken');
        const response = await fetch('http://localhost:8080/S2EH/s2e-backend/seller-products-simple.php', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Full response:', data);
        console.log('✅ Products array:', data.data);
        
        // Extract the nested data property from PHP backend response
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
        console.log('📡 Updating product with PHP backend:', id);
        console.log('📡 Product data:', productData);
        console.log('📡 Is FormData?', productData instanceof FormData);
        
        if (!id) {
          throw new Error('Product ID is required for update');
        }
        
        // Use Axios for consistent FormData handling (has interceptor)
        const response = await api.post(`/api/seller/products/${id}`, productData);
        console.log('✅ Product updated:', response.data);
        return response.data;
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
    // Get seller's orders (uses /api/orders which handles seller orders based on user_type)
    getOrders: async (params = {}) => {
      try {
        console.log('📦 Fetching seller orders from /api/orders...');
        const response = await api.get('/api/orders', { params });
        console.log('✅ Seller orders response:', response.data);
        // Backend returns { success: true, data: { orders: [...] } }
        // Axios unwraps to response.data = { success: true, data: { orders: [...] } }
        const ordersData = response.data?.data || response.data;
        const orders = Array.isArray(ordersData) 
          ? ordersData 
          : (ordersData?.orders || []);
        console.log('✅ Extracted orders:', orders.length, 'orders');
        // Return in consistent format matching what dashboard expects
        return {
          orders: orders
        };
      } catch (error) {
        console.error('❌ Failed to fetch seller orders:', error);
        console.error('❌ Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    },

    // Get single order
    getOrder: async (id) => {
      try {
        // Filter orders from /api/orders by ID
        const response = await api.get('/api/orders');
        const orders = Array.isArray(response.data) ? response.data : response.data.orders || [];
        const order = orders.find(o => o.id == id || o.order_number == id);
        if (!order) {
          throw new Error('Order not found');
        }
        return order;
      } catch (error) {
        console.error('Failed to fetch order:', error);
        throw error;
      }
    },

    // Update order status
    updateOrderStatus: async (id, statusData) => {
      try {
        const url = `/api/seller/orders/${id}`;
        console.log('📡 Updating order status:', { url, id, statusData });
        const response = await api.put(url, statusData);
        console.log('✅ Status update response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to update order status:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
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
