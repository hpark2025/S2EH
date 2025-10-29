import api from './api';

export const adminAPI = {
  // Sellers management (for Admin Producers Page)
  sellers: {
    getAll: async (params = {}) => {
      try {
        console.log('📡 Fetching sellers with params:', params);
        const response = await api.get('/api/sellers', { params });
        console.log('✅ Sellers response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to fetch sellers:', error);
        throw error;
      }
    },
    
    create: async (sellerData) => {
      try {
        console.log('📡 Creating seller:', sellerData);
        const response = await api.post('/api/sellers/create', sellerData);
        console.log('✅ Seller created:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to create seller:', error);
        throw error;
      }
    },
    
    approve: async (sellerId) => {
      try {
        const response = await api.post('/api/sellers/approve', { seller_id: sellerId });
        console.log('✅ Seller approved:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to approve seller:', error);
        throw error;
      }
    },
    
    reject: async (sellerId, reason = null) => {
      try {
        const response = await api.post('/api/sellers/reject', { 
          seller_id: sellerId,
          reason: reason
        });
        console.log('✅ Seller rejected:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to reject seller:', error);
        throw error;
      }
    }
  },

  users: {
    getAllUsers: async (params = {}) => {
      const { page = 1, limit = 100, role = 'seller', status, search } = params;
      
      try {
        let endpoint = '/api/users';
        
        // Use appropriate endpoint based on role
        if (role === 'seller') {
          endpoint = '/api/sellers';
        } else if (role === 'customer' || role === 'user') {
          endpoint = '/api/users';
        }
        
        const response = await api.get(endpoint, { 
          params: { page, limit, status, search } 
        });
        
        console.log('✅ Admin API Users Response:', response.data);
        
        return response.data;
      } catch (error) {
        console.error('❌ Failed to fetch users:', error);
        
        // Log detailed error information
        if (error.response) {
          console.error('Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        }
        
        throw error;
      }
    },
    
    approveUser: async (userId) => {
      try {
        const response = await api.post('/api/users/approve', { user_id: userId });
        console.log('✅ User approved:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to approve user:', error);
        throw error;
      }
    },
    
    rejectUser: async (userId, reason = null) => {
      try {
        const response = await api.post('/api/users/reject', { 
          user_id: userId,
          reason: reason
        });
        console.log('✅ User rejected:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to reject user:', error);
        throw error;
      }
    },
    
    createUser: async (userData, userType = 'seller') => {
      try {
        let response;
        if (userType === 'seller') {
          response = await api.post('/admin/sellers', userData);
        } else if (userType === 'customer') {
          response = await api.post('/admin/customers', userData);
        } else if (userType === 'admin') {
          response = await api.post('/admin/users', userData);
        } else {
          throw new Error('Invalid user type');
        }
        return response.data;
      } catch (error) {
        console.error('Failed to create user:', error);
        throw error;
      }
    },
    
    updateUser: async (userId, userData, userType = 'seller') => {
      try {
        let response;

        // Standardize endpoint per user type
        if (userType === 'seller') {
          response = await api.put(`/admin/sellers/${userId}`, userData);
        } else if (userType === 'customer') {
          response = await api.put(`/admin/customers/${userId}`, userData);
        } else if (userType === 'admin') {
          response = await api.put(`/admin/users/${userId}`, userData);
        } else {
          throw new Error('Invalid user type for status update');
        }

        return response.data;
      } catch (error) {
        console.error('Failed to update user status:', error);
        throw error;
      }
    }
  },
  
  dashboard: {
    getDashboardStats: async () => {
      try {
        // Get counts from different endpoints since there's no dedicated dashboard endpoint
        const [sellersResponse, customersResponse, productsResponse, ordersResponse] = await Promise.all([
          api.get('/admin/sellers'),
          api.get('/admin/customers'),
          api.get('/admin/products'),
          api.get('/admin/orders')
        ]);

        // Calculate total revenue
        const totalRevenue = ordersResponse.data.reduce((sum, order) => sum + (order.price || 0), 0);

        const data = {
          stats: {
            sellers: {
              pending_sellers: sellersResponse.data.filter(seller => seller.status === 'pending').length || 0,
              approved_sellers: sellersResponse.data.filter(seller => seller.status === 'approved').length || 0,
              rejected_sellers: sellersResponse.data.filter(seller => seller.status === 'rejected').length || 0,
              total_seller_applications: sellersResponse.data.length || 0
            },
            users: {
              total_customers: customersResponse.data.length || 0,
              active_sellers: sellersResponse.data.filter(seller => seller.status === 'approved').length || 0,
              total_admins: 1, // We have one admin
              total_users: customersResponse.data.length + sellersResponse.data.length + 1
            },
            products: {
              active_products: productsResponse.data.filter(product => product.status === 'approved').length || 0,
              inactive_products: productsResponse.data.filter(product => product.status !== 'approved').length || 0,
              total_products: productsResponse.data.length || 0
            },
            orders: {
              pending_orders: ordersResponse.data.filter(order => order.status === 'pending').length || 0,
              completed_orders: ordersResponse.data.filter(order => order.status === 'delivered').length || 0,
              total_orders: ordersResponse.data.length || 0,
              total_revenue: totalRevenue || 0
            }
          },
          recentApplications: sellersResponse.data
            .filter(seller => seller.status === 'pending')
            .map(seller => ({
              id: seller.id,
              applicantName: `${seller.firstName} ${seller.lastName}`,
              businessType: seller.businessType,
              businessName: seller.businessName,
              appliedAt: seller.createdAt,
              status: seller.status
            }))
        };

        return { data };
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw error;
      }
    }
  },

  products: {
    getAllProducts: async (params = {}) => {
      try {
        const response = await api.get('/admin/products', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
      }
    },

    deleteProduct: async (productId) => {
      try {
        const response = await api.delete(`/admin/products/${productId}`);
        return response.data;
      } catch (error) {
        console.error('Failed to delete product:', error);
        throw error;
      }
    }
  },

  categories: {
    getAllCategories: async () => {
      try {
        const response = await api.get('/admin/product-categories');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        throw error;
      }
    },

    createCategory: async (categoryData) => {
      try {
        const response = await api.post('/admin/product-categories', categoryData);
        return response.data;
      } catch (error) {
        console.error('Failed to create category:', error);
        throw error;
      }
    },

    updateCategory: async (categoryId, categoryData) => {
      try {
        const response = await api.put(`/admin/product-categories/${categoryId}`, categoryData);
        return response.data;
      } catch (error) {
        console.error('Failed to update category:', error);
        throw error;
      }
    },

    deleteCategory: async (categoryId) => {
      try {
        const response = await api.delete(`/admin/product-categories/${categoryId}`);
        return response.data;
      } catch (error) {
        console.error('Failed to delete category:', error);
        throw error;
      }
    }
  },

  orders: {
    getAllOrders: async (params = {}) => {
      try {
        const response = await api.get('/admin/orders', { params });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        throw error;
      }
    },

    updateOrderStatus: async (orderId, statusData) => {
      try {
        const response = await api.put(`/admin/orders/${orderId}`, statusData);
        return response.data;
      } catch (error) {
        console.error('Failed to update order status:', error);
        throw error;
      }
    }
  },

  // Products management (for Admin Products Page)
  products: {
    getAll: async (params = {}) => {
      try {
        console.log('📡 Fetching products with params:', params);
        const response = await api.get('/api/products/admin', { params });
        console.log('✅ Products response:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to fetch products:', error);
        throw error;
      }
    },

    approve: async (productId) => {
      try {
        const response = await api.post('/api/products/approve', { product_id: productId });
        console.log('✅ Product approved:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to approve product:', error);
        throw error;
      }
    },

    reject: async (productId, reason = null) => {
      try {
        const response = await api.post('/api/products/reject', {
          product_id: productId,
          reason: reason
        });
        console.log('✅ Product rejected:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to reject product:', error);
        throw error;
      }
    }
  }
};
