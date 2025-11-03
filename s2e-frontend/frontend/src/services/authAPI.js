import api from './api'
import { MEDUSA_CONFIG } from '../config/medusa';
import { cookieAuth } from '../utils/cookieAuth.js';

export const authAPI = {
  // Generic login function (supports admin, seller, and customer)
  login: async ({ email, password, user_type = 'user' }) => {
    try {
      console.log('Attempting login with:', { email, user_type });
      const response = await api.post('/api/auth/login', { email, password, user_type });
      console.log('Login API response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw {
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Login failed',
        response: error.response
      };
    }
  },

  // Customer Authentication
  customerSignup: async (registrationData) => {
    try {
      console.log('🔍 Customer registration with PHP backend:', registrationData);
      
      // Register customer using PHP backend - send ALL data including metadata
      const response = await api.post('/api/auth/register', {
        ...registrationData,
        user_type: 'user'  // Ensure user_type is set
      });
      
      console.log('✅ Customer registration response:', response.data);
      
      return {
        success: true,
        user: response.data.data?.user,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('❌ Customer signup failed:', error);
      throw error;
    }
  },

  customerLogin: async (loginData) => {
    try {
      console.log('🔍 Attempting customer login with PHP backend:', loginData);
      
      // Use PHP backend login with user_type: 'user'
      const response = await api.post('/api/auth/login', {
        email: loginData.email,
        password: loginData.password,
        user_type: 'user'
      });
      
      console.log('✅ Customer login response:', response.data);
      
      if (response.data.data && response.data.data.token) {
        const token = response.data.data.token;
        const user = response.data.data.user;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('customerToken', token);
        localStorage.setItem('userType', 'customer');
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Customer logged in successfully:', user);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Customer login failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Admin Authentication (using user actor type)
  adminLogin: async (loginData) => {
    try {
      const response = await api.post('/auth/user/emailpass', loginData);
      
      if (response.data.token) {
        // Store token and user type
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('userType', 'admin');
        
        // Get admin profile
        const profileResponse = await api.get('/users/me');
        localStorage.setItem('user', JSON.stringify(profileResponse.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  },

  // Seller Authentication
  sellerLogin: async (loginData) => {
    try {
      console.log('🔍 Attempting seller login with:', loginData);
      
      // Call PHP backend login endpoint
      const response = await api.post('/api/auth/login', {
        email: loginData.email,
        password: loginData.password,
        user_type: 'seller'
      });
      
      console.log('🔍 Seller login response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Set authentication cookies
        cookieAuth.setAuth(user, token, 'seller');
        
        // Store in localStorage
        localStorage.setItem('sellerToken', token);
        localStorage.setItem('userType', 'seller');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('sellerId', user.id);
        
        console.log('✅ Seller login successful:', user);
        
        return {
          token: token,
          seller: user
        };
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('Seller login failed:', error);
      throw error.response?.data || error;
    }
  },

  // Seller Registration
  sellerRegister: async (registrationData) => {
    try {
      console.log('🔍 Seller registration data:', registrationData);
      
      // Call PHP backend registration endpoint
      const response = await api.post('/api/auth/register', {
        user_type: 'seller',
        email: registrationData.email,
        password: registrationData.password,
        business_name: registrationData.businessName,
        owner_name: `${registrationData.firstName} ${registrationData.lastName}`,
        phone: registrationData.phone,
        business_type: registrationData.businessType || 'individual',
        business_description: registrationData.businessDescription,
        business_permit: registrationData.businessLicense,
        province: registrationData.province,
        municipality: registrationData.municipality,
        barangay: registrationData.barangay,
        // PSGC codes for addresses table
        province_code: registrationData.province_code,
        municipality_code: registrationData.municipality_code,
        barangay_code: registrationData.barangay_code
      });
      
      console.log('🔍 Seller registration response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;
        
        // Only store auth if token exists (seller is already verified)
        // For pending sellers, token will be null
        if (token) {
          cookieAuth.setAuth(user, token, 'seller');
          localStorage.setItem('sellerToken', token);
          localStorage.setItem('userType', 'seller');
          localStorage.setItem('user', JSON.stringify(user));
          console.log('✅ Seller registered and auto-logged in:', user);
        } else {
          console.log('✅ Seller registered - Pending approval:', user);
        }
        
        return {
          seller: user,
          token: token,
          message: response.data.message || 'Registration successful'
        };
      }
      
      // If not successful, throw error with backend message
      const errorMessage = response.data.message || 'Failed to register seller';
      throw new Error(errorMessage);
    } catch (error) {
      console.error('Seller registration failed:', error);
      
      // Handle axios error response
      if (error.response?.data) {
        // Backend returned an error response
        const backendError = error.response.data;
        const errorMessage = backendError.message || 'Registration failed';
        throw new Error(errorMessage);
      }
      
      // Re-throw if it's already an Error object
      if (error instanceof Error) {
        throw error;
      }
      
      // Otherwise throw a generic error
      throw new Error('Failed to register seller');
    }
  },

  // Logout function
  logout: () => {
    // Clear localStorage (for backward compatibility)
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('isLoggedIn');
    
    // Clear cookies
    cookieAuth.clearAuth();
    console.log('✅ Logout completed - localStorage and cookies cleared');
  },

  // Guest login function
  guestLogin: () => {
    console.log('Guest login activated');
    const guestUser = { userType: 'guest', message: 'Logged in as guest' };
    console.log('Guest user object:', guestUser);
    localStorage.setItem('userType', 'guest');
    localStorage.setItem('user', JSON.stringify(guestUser));
    console.log('LocalStorage updated with guest user data');
    return guestUser;
  },

  // Get all products (delegates to productsAPI)
  getProducts: async (params = {}) => {
    try {
      console.log('🔍 Fetching products from PHP backend /api/products')
      console.log('🔍 Request params:', params)
      
      // Use our PHP backend endpoint (returns published products only)
      const response = await api.get('/api/products', { params })
      console.log('🔍 Products response:', response.data)
      
      // Backend returns { success: true, data: { products: [...] } }
      return response.data.data || response.data
    } catch (error) {
      console.error('🔍 Failed to fetch products:', error)
      console.error('🔍 Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      throw error.response?.data || error
    }
  }
};

// Products API functions
export const productsAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    try {
      console.log('🔍 Fetching products from PHP backend /api/products')
      console.log('🔍 Request params:', params)
      
      // Use our PHP backend endpoint (returns published products only)
      const response = await api.get('/api/products', { params })
      console.log('🔍 Products response:', response.data)
      
      // Backend returns { success: true, data: { products: [...] } }
      return response.data.data || response.data
    } catch (error) {
      console.error('🔍 Failed to fetch products:', error)
      console.error('🔍 Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      throw error.response?.data || error
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await api.get(`/api/products/${id}`)
      // Backend returns { success: true, data: { product: {...} } }
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create product (seller only)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/seller/products', productData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update product (seller only)
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/seller/products/${id}`, productData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Delete product (seller only)
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/seller/products/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get seller's products
  getSellerProducts: async (params = {}) => {
    try {
      const response = await api.get('/seller/products', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Search products (using query parameter)
  searchProducts: async (query, params = {}) => {
    try {
      const response = await api.get('/api/products', { 
        params: { 
          search: query,
          ...params 
        }
      })
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/api/products', { 
        params: { 
          is_featured: 1
        } 
      })
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}

// Categories API functions
export const categoriesAPI = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/categories')
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get single category
  getCategory: async (id) => {
    try {
      const response = await api.get(`/api/categories/${id}`)
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get products by category (filter by category)
  getCategoryProducts: async (id, params = {}) => {
    try {
      const response = await api.get('/api/products', { 
        params: { category_id: id, ...params } 
      })
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create category (admin only)
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/admin/product-categories', categoryData)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}

// Orders API functions
export const ordersAPI = {
  // Get customer orders
  getOrders: async () => {
    try {
      const response = await api.get('/api/orders')
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get single order
  getOrder: async (id) => {
    try {
      const response = await api.get(`/api/orders/${id}`)
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Create order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/orders', orderData)
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Update order
  updateOrder: async (id, orderData) => {
    try {
      const response = await api.put(`/api/orders/${id}`, orderData)
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Cancel order
  cancelOrder: async (id) => {
    try {
      const response = await api.post(`/api/orders/${id}/cancel`)
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get seller orders
  getSellerOrders: async () => {
    try {
      const response = await api.get('/seller/orders')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}

// Users API functions
export const usersAPI = {
  // Get user profile (from localStorage)
  getProfile: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userType = localStorage.getItem('userType');
      return { user, userType };
    } catch (error) {
      throw { message: 'No user logged in' };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const userType = localStorage.getItem('userType');
      
      let response;
      if (userType === 'seller') {
        response = await api.put('/seller/me', profileData);
      } else if (userType === 'customer') {
        response = await api.put('/customers/me', profileData);
      } else if (userType === 'admin') {
        response = await api.put('/users/me', profileData);
      } else {
        throw new Error('Invalid user type');
      }
      
      // Update localStorage with new data
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user orders
  getUserOrders: async () => {
    try {
      const userType = localStorage.getItem('userType');
      
      if (userType === 'customer') {
        return await ordersAPI.getOrders();
      } else if (userType === 'seller') {
        return await ordersAPI.getSellerOrders();
      } else {
        throw new Error('Invalid user type for orders');
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

// Sellers API functions
export const sellersAPI = {
  // Get all sellers (admin only)
  getAllSellers: async (params = {}) => {
    try {
      const response = await api.get('/admin/sellers', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get seller profile
  getSellerProfile: async (id) => {
    try {
      const response = await api.get(`/admin/sellers/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get seller's products
  getSellerProducts: async (id, params = {}) => {
    try {
      const response = await api.get('/api/products', { 
        params: { seller_id: id, ...params } 
      })
      return response.data.data || response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get current seller profile
  getCurrentSeller: async () => {
    try {
      const response = await api.get('/seller/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }
}