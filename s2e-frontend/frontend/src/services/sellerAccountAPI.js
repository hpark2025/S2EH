import api from './api';
import { cookieAuth } from '../utils/cookieAuth';

export const sellerAccountAPI = {
  // CREATE - Seller Account Registration
  createSellerAccount: async (sellerData) => {
    try {
      console.log('🔧 Creating seller account:', sellerData);
      
      // First register the authentication identity
      const authResponse = await api.post('/auth/seller/emailpass/register', {
        email: sellerData.email,
        password: sellerData.password
      });

      if (authResponse.data.token) {
        // Create seller profile
        const profileData = {
          email: sellerData.email,
          first_name: sellerData.first_name,
          last_name: sellerData.last_name,
          phone: sellerData.phone,
          business_name: sellerData.business_name,
          business_type: sellerData.business_type,
          business_address: sellerData.business_address,
          status: 'pending' // New sellers start as pending
        };

        const profileResponse = await api.post('/seller', profileData);
        
        // Set authentication cookies
        const sellerProfile = {
          id: profileResponse.data.seller?.id || 'unknown',
          email: sellerData.email,
          first_name: sellerData.first_name,
          last_name: sellerData.last_name,
          phone: sellerData.phone,
          business_name: sellerData.business_name,
          business_type: sellerData.business_type,
          business_address: sellerData.business_address,
          status: 'pending',
          role: 'seller',
          created_at: new Date().toISOString(),
          ...profileResponse.data.seller
        };
        
        cookieAuth.setAuth(sellerProfile, authResponse.data.token, 'seller');
        console.log('✅ Seller account created and authenticated');
      }

      return authResponse.data;
    } catch (error) {
      console.error('❌ Failed to create seller account:', error);
      throw error;
    }
  },

  // READ - Get Seller Account Information
  getSellerProfile: async () => {
    try {
      const auth = cookieAuth.getAuth();
      
      if (!auth.isLoggedIn || auth.userType !== 'seller') {
        throw new Error('Seller not authenticated');
      }

      const response = await api.get('/seller/me');
      return response.data.seller;
    } catch (error) {
      console.error('❌ Failed to get seller profile:', error);
      throw error;
    }
  },

  // Get seller by ID (for admin purposes)
  getSellerById: async (sellerId) => {
    try {
      const response = await api.get(`/admin/sellers/${sellerId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get seller by ID:', error);
      throw error;
    }
  },

  // Get all sellers (admin only)
  getAllSellers: async (params = {}) => {
    try {
      const response = await api.get('/admin/sellers', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get all sellers:', error);
      throw error;
    }
  },

  // UPDATE - Update Seller Account
  updateSellerProfile: async (profileData) => {
    try {
      const auth = cookieAuth.getAuth();
      
      if (!auth.isLoggedIn || auth.userType !== 'seller') {
        throw new Error('Seller not authenticated');
      }

      const response = await api.put('/seller/me', profileData);

      // Update cookies with new profile data
      const updatedProfile = {
        ...auth.user,
        ...profileData
      };
      cookieAuth.setAuth(updatedProfile, auth.token, auth.userType);

      console.log('✅ Seller profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update seller profile:', error);
      throw error;
    }
  },

  // Update seller by ID (admin only)
  updateSellerById: async (sellerId, sellerData) => {
    try {
      const response = await api.put(`/admin/sellers/${sellerId}`, sellerData);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update seller by ID:', error);
      throw error;
    }
  },

  // Update seller status (admin only)
  updateSellerStatus: async (sellerId, status, reason = '') => {
    try {
      const statusData = { 
        status,
        status_reason: reason,
        status_updated_at: new Date().toISOString()
      };
      return await sellerAccountAPI.updateSellerById(sellerId, statusData);
    } catch (error) {
      console.error('❌ Failed to update seller status:', error);
      throw error;
    }
  },

  // Change seller password
  changeSellerPassword: async (currentPassword, newPassword) => {
    try {
      const auth = cookieAuth.getAuth();
      
      if (!auth.isLoggedIn || auth.userType !== 'seller') {
        throw new Error('Seller not authenticated');
      }

      const passwordData = {
        current_password: currentPassword,
        new_password: newPassword
      };

      const response = await api.put('/seller/me', passwordData);
      console.log('✅ Seller password changed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to change seller password:', error);
      throw error;
    }
  },

  // DELETE - Seller Account Management
  deactivateSellerAccount: async (reason = '') => {
    try {
      const auth = cookieAuth.getAuth();
      
      if (!auth.isLoggedIn || auth.userType !== 'seller') {
        throw new Error('Seller not authenticated');
      }

      const deactivationData = {
        status: 'inactive',
        deactivation_reason: reason,
        deactivated_at: new Date().toISOString()
      };

      const response = await api.put('/seller/me', deactivationData);

      // Clear authentication
      cookieAuth.clearAuth();
      console.log('✅ Seller account deactivated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to deactivate seller account:', error);
      throw error;
    }
  },

  // Delete seller by ID (admin only)
  deleteSellerById: async (sellerId) => {
    try {
      const response = await api.delete(`/admin/sellers/${sellerId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete seller by ID:', error);
      throw error;
    }
  },

  // UTILITY FUNCTIONS
  utilities: {
    // Check if seller account exists
    sellerExists: async (email) => {
      try {
        const response = await api.get(`/admin/sellers?email=${email}`);
        return response.data.sellers && response.data.sellers.length > 0;
      } catch (error) {
        if (error.response?.status === 404) {
          return false;
        }
        throw error;
      }
    },

    // Get seller statistics (admin only)
    getSellerStats: async () => {
      try {
        const response = await api.get('/admin/sellers?limit=1');
        return {
          total_sellers: response.data.count || 0,
          active_sellers: response.data.sellers?.filter(s => s.status === 'active').length || 0,
          pending_sellers: response.data.sellers?.filter(s => s.status === 'pending').length || 0,
          inactive_sellers: response.data.sellers?.filter(s => s.status === 'inactive').length || 0
        };
      } catch (error) {
        console.error('❌ Failed to get seller statistics:', error);
        throw error;
      }
    },

    // Search sellers (admin only)
    searchSellers: async (query) => {
      try {
        const params = { q: query, limit: 50 };
        const response = await api.get('/admin/sellers', { params });
        return response.data;
      } catch (error) {
        console.error('❌ Failed to search sellers:', error);
        throw error;
      }
    },

    // Get seller verification status
    getSellerVerificationStatus: async () => {
      try {
        const profile = await sellerAccountAPI.getSellerProfile();
        return {
          is_verified: profile.status === 'active',
          status: profile.status,
          verification_date: profile.verified_at,
          verification_documents: profile.verification_documents || []
        };
      } catch (error) {
        console.error('❌ Failed to get verification status:', error);
        throw error;
      }
    }
  }
};

export default sellerAccountAPI;

