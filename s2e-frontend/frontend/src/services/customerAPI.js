import api from './api'
import { MEDUSA_CONFIG } from '../config/medusa'
import { cookieAuth } from '../utils/cookieAuth.js'

export const customerAPI = {
  // Get customer profile
  getProfile: async () => {
    try {
      console.log('🔍 Getting customer profile from cookies...');
      
      // Get user data directly from cookies (no API call needed)
      const auth = cookieAuth.getAuth();
      const user = auth.user;
      const userType = auth.userType;
      
      console.log('🔍 User from cookie:', user);
      console.log('🔍 User Type:', userType);
      
      if (!user) {
        throw new Error('No user data found in cookies');
      }
      
      // Return user data in the expected format
      return { customer: user };
    } catch (error) {
      console.error('Failed to get customer profile from cookies:', error);
      throw error;
    }
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    try {
      console.log('🔍 Updating customer profile:', profileData);
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      const user = auth.user;
      
      console.log('🔍 Token from cookie:', token);
      console.log('🔍 Current user:', user);
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      console.log('🔍 Using token for customer profile update');
      
      // Use POST method as per Medusa documentation
      const response = await api.post('/store/customers/me', profileData, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Customer profile update response:', response.data);
      
      // Update the cookie with new user data if available
      if (response.data.customer) {
        console.log('🔍 Updating cookie with new customer data');
        cookieAuth.setAuth(response.data.customer, token, 'customer');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to update customer profile:', error);
      throw error;
    }
  },

  // Get customer addresses
  getAddresses: async () => {
    try {
      console.log('🔍 Fetching customer addresses...');
      
      // Get authentication token from cookies (primary source)
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const response = await api.get('/store/customers/me/addresses', {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Customer addresses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer addresses:', error);
      throw error;
    }
  },

  // Add customer address
  addAddress: async (addressData) => {
    try {
      console.log('🔍 Adding customer address:', addressData);
      
      // Get authentication token from cookies (primary source)
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const response = await api.post('/store/customers/me/addresses', addressData, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Add address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add customer address:', error);
      throw error;
    }
  },

  // Update customer address
  updateAddress: async (addressId, addressData) => {
    try {
      console.log('🔍 Updating customer address:', addressId, addressData);
      
      // Get authentication token from cookies (primary source)
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const response = await api.put(`/store/customers/me/addresses/${addressId}`, addressData, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Update address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update customer address:', error);
      throw error;
    }
  },

  // Delete customer address
  deleteAddress: async (addressId) => {
    try {
      console.log('🔍 Deleting customer address:', addressId);
      
      // Get authentication token from cookies (primary source)
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const response = await api.delete(`/store/customers/me/addresses/${addressId}`, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Delete address response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to delete customer address:', error);
      throw error;
    }
  },

  // Get customer orders
  getOrders: async (params = {}) => {
    try {
      console.log('🔍 Fetching customer orders...');
      
      // Get authentication token from cookies (primary source)
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const response = await api.get('/store/customers/me/orders', {
        params,
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Customer orders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      throw error;
    }
  }
}


