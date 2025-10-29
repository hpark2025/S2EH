import api from './api';
import { cookieAuth } from '../utils/cookieAuth';

export const accountAPI = {
  // CREATE - Account Registration
  createAccount: {
    // Customer registration
    createCustomer: async (customerData) => {
      try {
        console.log('🔧 Creating customer account:', customerData);
        const response = await api.post('/auth/customer/emailpass/register', customerData);
        
        if (response.data.token) {
          // Set authentication cookies
          const customerProfile = {
            id: response.data.customer?.id || 'unknown',
            email: customerData.email,
            first_name: customerData.first_name || '',
            last_name: customerData.last_name || '',
            phone: customerData.phone || '',
            role: 'customer',
            ...response.data.customer
          };
          
          cookieAuth.setAuth(customerProfile, response.data.token, 'customer');
          console.log('✅ Customer account created and authenticated');
        }
        
        return response.data;
      } catch (error) {
        console.error('❌ Failed to create customer account:', error);
        throw error;
      }
    },

    // Seller registration
    createSeller: async (sellerData) => {
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
            status: 'pending'
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
            status: 'pending',
            role: 'seller',
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

    // Admin account creation (admin only)
    createAdmin: async (adminData) => {
      try {
        console.log('🔧 Creating admin account:', adminData);
        const response = await api.post('/admin/users', adminData);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to create admin account:', error);
        throw error;
      }
    }
  },

  // READ - Get Account Information
  getAccount: {
    // Get current user profile
    getCurrentProfile: async () => {
      try {
        const auth = cookieAuth.getAuth();
        
        if (!auth.isLoggedIn || !auth.userType) {
          throw new Error('User not authenticated');
        }

        let response;
        if (auth.userType === 'customer') {
          response = await api.get('/customers/me');
          return response.data.customer;
        } else if (auth.userType === 'seller') {
          response = await api.get('/seller/me');
          return response.data.seller;
        } else if (auth.userType === 'admin') {
          response = await api.get('/users/me');
          return response.data.user;
        } else {
          throw new Error('Invalid user type');
        }
      } catch (error) {
        console.error('❌ Failed to get current profile:', error);
        throw error;
      }
    },

    // Get account by ID (admin only)
    getAccountById: async (accountId, accountType = 'customer') => {
      try {
        let response;
        if (accountType === 'customer') {
          response = await api.get(`/admin/customers/${accountId}`);
        } else if (accountType === 'seller') {
          response = await api.get(`/admin/sellers/${accountId}`);
        } else if (accountType === 'admin') {
          response = await api.get(`/admin/users/${accountId}`);
        } else {
          throw new Error('Invalid account type');
        }
        return response.data;
      } catch (error) {
        console.error('❌ Failed to get account by ID:', error);
        throw error;
      }
    },

    // Get all accounts (admin only)
    getAllAccounts: async (accountType = 'customer', params = {}) => {
      try {
        let response;
        if (accountType === 'customer') {
          response = await api.get('/admin/customers', { params });
        } else if (accountType === 'seller') {
          response = await api.get('/admin/sellers', { params });
        } else if (accountType === 'admin') {
          response = await api.get('/admin/users', { params });
        } else {
          throw new Error('Invalid account type');
        }
        return response.data;
      } catch (error) {
        console.error('❌ Failed to get all accounts:', error);
        throw error;
      }
    }
  },

  // UPDATE - Update Account Information
  updateAccount: {
    // Update current user profile
    updateCurrentProfile: async (profileData) => {
      try {
        const auth = cookieAuth.getAuth();
        
        if (!auth.isLoggedIn || !auth.userType) {
          throw new Error('User not authenticated');
        }

        let response;
        if (auth.userType === 'customer') {
          response = await api.put('/customers/me', profileData);
        } else if (auth.userType === 'seller') {
          response = await api.put('/seller/me', profileData);
        } else if (auth.userType === 'admin') {
          response = await api.put('/users/me', profileData);
        } else {
          throw new Error('Invalid user type');
        }

        // Update cookies with new profile data
        const updatedProfile = {
          ...auth.user,
          ...profileData
        };
        cookieAuth.setAuth(updatedProfile, auth.token, auth.userType);

        console.log('✅ Profile updated successfully');
        return response.data;
      } catch (error) {
        console.error('❌ Failed to update profile:', error);
        throw error;
      }
    },

    // Update account by ID (admin only)
    updateAccountById: async (accountId, accountData, accountType = 'customer') => {
      try {
        let response;
        if (accountType === 'customer') {
          response = await api.put(`/admin/customers/${accountId}`, accountData);
        } else if (accountType === 'seller') {
          response = await api.put(`/admin/sellers/${accountId}`, accountData);
        } else if (accountType === 'admin') {
          response = await api.put(`/admin/users/${accountId}`, accountData);
        } else {
          throw new Error('Invalid account type');
        }
        return response.data;
      } catch (error) {
        console.error('❌ Failed to update account by ID:', error);
        throw error;
      }
    },

    // Update account status (admin only)
    updateAccountStatus: async (accountId, status, accountType = 'customer') => {
      try {
        const statusData = { status };
        return await accountAPI.updateAccount.updateAccountById(accountId, statusData, accountType);
      } catch (error) {
        console.error('❌ Failed to update account status:', error);
        throw error;
      }
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
      try {
        const auth = cookieAuth.getAuth();
        
        if (!auth.isLoggedIn || !auth.userType) {
          throw new Error('User not authenticated');
        }

        const passwordData = {
          current_password: currentPassword,
          new_password: newPassword
        };

        let response;
        if (auth.userType === 'customer') {
          response = await api.put('/customers/me', passwordData);
        } else if (auth.userType === 'seller') {
          response = await api.put('/seller/me', passwordData);
        } else if (auth.userType === 'admin') {
          response = await api.put('/users/me', passwordData);
        } else {
          throw new Error('Invalid user type');
        }

        console.log('✅ Password changed successfully');
        return response.data;
      } catch (error) {
        console.error('❌ Failed to change password:', error);
        throw error;
      }
    }
  },

  // DELETE - Account Management
  deleteAccount: {
    // Deactivate current account
    deactivateCurrentAccount: async (reason = '') => {
      try {
        const auth = cookieAuth.getAuth();
        
        if (!auth.isLoggedIn || !auth.userType) {
          throw new Error('User not authenticated');
        }

        const deactivationData = {
          status: 'inactive',
          deactivation_reason: reason,
          deactivated_at: new Date().toISOString()
        };

        let response;
        if (auth.userType === 'customer') {
          response = await api.put('/customers/me', deactivationData);
        } else if (auth.userType === 'seller') {
          response = await api.put('/seller/me', deactivationData);
        } else if (auth.userType === 'admin') {
          response = await api.put('/users/me', deactivationData);
        } else {
          throw new Error('Invalid user type');
        }

        // Clear authentication
        cookieAuth.clearAuth();
        console.log('✅ Account deactivated successfully');
        return response.data;
      } catch (error) {
        console.error('❌ Failed to deactivate account:', error);
        throw error;
      }
    },

    // Delete account by ID (admin only)
    deleteAccountById: async (accountId, accountType = 'customer') => {
      try {
        let response;
        if (accountType === 'customer') {
          response = await api.delete(`/admin/customers/${accountId}`);
        } else if (accountType === 'seller') {
          response = await api.delete(`/admin/sellers/${accountId}`);
        } else if (accountType === 'admin') {
          response = await api.delete(`/admin/users/${accountId}`);
        } else {
          throw new Error('Invalid account type');
        }
        return response.data;
      } catch (error) {
        console.error('❌ Failed to delete account by ID:', error);
        throw error;
      }
    }
  },

  // UTILITY FUNCTIONS
  utilities: {
    // Check if account exists
    accountExists: async (email) => {
      try {
        // Try to get account info (this will fail if account doesn't exist)
        await api.get(`/customers?email=${email}`);
        return true;
      } catch (error) {
        if (error.response?.status === 404) {
          return false;
        }
        throw error;
      }
    },

    // Get account statistics (admin only)
    getAccountStats: async () => {
      try {
        const [customers, sellers, admins] = await Promise.all([
          api.get('/admin/customers?limit=1'),
          api.get('/admin/sellers?limit=1'),
          api.get('/admin/users?limit=1')
        ]);

        return {
          total_customers: customers.data.count || 0,
          total_sellers: sellers.data.count || 0,
          total_admins: admins.data.count || 0
        };
      } catch (error) {
        console.error('❌ Failed to get account statistics:', error);
        throw error;
      }
    },

    // Search accounts (admin only)
    searchAccounts: async (query, accountType = 'customer') => {
      try {
        const params = { q: query, limit: 50 };
        return await accountAPI.getAccount.getAllAccounts(accountType, params);
      } catch (error) {
        console.error('❌ Failed to search accounts:', error);
        throw error;
      }
    }
  }
};

export default accountAPI;

