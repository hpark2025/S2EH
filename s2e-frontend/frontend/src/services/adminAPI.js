// Helper function to get auth token
const getAuthToken = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('adminToken='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Use Vite proxy to avoid CORS issues - browser security blocks direct backend calls
// Vite proxy will rewrite /api/* to http://localhost:8080/S2EH/s2e-backend/api/*
// This makes requests appear same-origin to the browser

// Helper function for fetch requests
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    // Use Vite proxy path - this bypasses browser CORS blocking
    const url = `/api${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`📡 Fetching via Vite proxy: ${url}`);
    console.log(`📡 Headers:`, headers);
    console.log(`📡 Method:`, options.method || 'GET');
    
    let response;
    try {
      response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body,
        credentials: 'omit' // Use omit since we use Bearer tokens, not cookies
      });
      console.log(`✅ Response received:`, response);
      console.log(`✅ Response status: ${response.status}`);
    } catch (fetchError) {
      console.error(`❌ Fetch failed:`, fetchError);
      console.error(`❌ URL was: ${url}`);
      console.error(`❌ This usually means: network error, server down, or CORS issue`);
      throw fetchError;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Response data:`, data);
    return data;
  } catch (error) {
    console.error('❌ fetchAPI error:', error.message);
    console.error('❌ Full error:', error);
    throw error;
  }
};

export const adminAPI = {
  // Sellers management (for Admin Producers Page)
  sellers: {
    getAll: async (params = {}) => {
      try {
        console.log('📡 Fetching sellers with params:', params);
        
        // Build query string
        const queryParams = new URLSearchParams();
        if (params.verification_status) {
          queryParams.append('verification_status', params.verification_status);
        }
        if (params.status) {
          queryParams.append('status', params.status);
        }
        
        const queryString = queryParams.toString();
        const endpoint = `/sellers${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetchAPI(endpoint);
        console.log('✅ Sellers response:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to fetch sellers:', error);
        throw error;
      }
    },
    
    create: async (sellerData) => {
      try {
        console.log('📡 Creating seller:', sellerData);
        const response = await fetchAPI('/sellers/create', {
          method: 'POST',
          body: JSON.stringify(sellerData)
        });
        console.log('✅ Seller created:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to create seller:', error);
        throw error;
      }
    },
    
    approve: async (sellerId) => {
      try {
        const response = await fetchAPI('/sellers/approve', {
          method: 'POST',
          body: JSON.stringify({ seller_id: sellerId })
        });
        console.log('✅ Seller approved:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to approve seller:', error);
        throw error;
      }
    },
    
    reject: async (sellerId, reason = null) => {
      try {
        const response = await fetchAPI('/sellers/reject', {
          method: 'POST',
          body: JSON.stringify({ seller_id: sellerId, reason })
        });
        console.log('✅ Seller rejected:', response);
        return response;
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
        let endpoint = '/users';
        
        // Use appropriate endpoint based on role
        if (role === 'seller') {
          endpoint = '/sellers';
        } else if (role === 'customer' || role === 'user') {
          endpoint = '/users';
        }
        
        // Build query params
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (status) queryParams.append('status', status);
        if (search) queryParams.append('search', search);
        
        const queryString = queryParams.toString();
        const fullEndpoint = `${endpoint}${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetchAPI(fullEndpoint);
        console.log('✅ Admin API Users Response:', response);
        
        return response;
      } catch (error) {
        console.error('❌ Failed to fetch users:', error);
        throw error;
      }
    },
    
    approveUser: async (userId) => {
      try {
        const response = await fetchAPI('/users/approve', {
          method: 'POST',
          body: JSON.stringify({ user_id: userId })
        });
        console.log('✅ User approved:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to approve user:', error);
        throw error;
      }
    },
    
    rejectUser: async (userId, reason = null) => {
      try {
        const response = await fetchAPI('/users/reject', {
          method: 'POST',
          body: JSON.stringify({ user_id: userId, reason })
        });
        console.log('✅ User rejected:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to reject user:', error);
        throw error;
      }
    },
    
    createUser: async (userData, userType = 'seller') => {
      try {
        let endpoint;
        if (userType === 'seller') {
          endpoint = '/sellers/create';
        } else if (userType === 'customer') {
          endpoint = '/auth/register';
        } else {
          throw new Error('Invalid user type');
        }
        
        const response = await fetchAPI(endpoint, {
          method: 'POST',
          body: JSON.stringify(userData)
        });
        return response;
      } catch (error) {
        console.error('Failed to create user:', error);
        throw error;
      }
    },
    
    updateUser: async (userId, userData, userType = 'seller') => {
      try {
        let endpoint;

        // Standardize endpoint per user type
        if (userType === 'seller') {
          endpoint = `/sellers/${userId}`;
        } else if (userType === 'customer') {
          endpoint = `/users/${userId}`;
        } else {
          throw new Error('Invalid user type for status update');
        }

        const response = await fetchAPI(endpoint, {
          method: 'PUT',
          body: JSON.stringify(userData)
        });

        return response;
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
        const [sellersResponse, customersResponse, productsResponse] = await Promise.all([
          fetchAPI('/sellers'),
          fetchAPI('/users'),
          fetchAPI('/products/admin')
        ]);

        // Extract sellers and customers arrays
        const sellers = sellersResponse.data?.sellers || sellersResponse.sellers || [];
        const customers = customersResponse.data?.users || customersResponse.users || [];
        const products = productsResponse.data?.products || productsResponse.products || [];

        const data = {
          stats: {
            sellers: {
              pending_sellers: sellers.filter(seller => seller.verification_status === 'pending').length || 0,
              approved_sellers: sellers.filter(seller => seller.verification_status === 'verified').length || 0,
              rejected_sellers: sellers.filter(seller => seller.verification_status === 'rejected').length || 0,
              total_seller_applications: sellers.length || 0
            },
            users: {
              total_customers: customers.length || 0,
              active_sellers: sellers.filter(seller => seller.verification_status === 'verified').length || 0,
              total_admins: 1, // We have one admin
              total_users: customers.length + sellers.length + 1
            },
            products: {
              active_products: products.filter(product => product.status === 'published').length || 0,
              inactive_products: products.filter(product => product.status !== 'published').length || 0,
              total_products: products.length || 0
            },
            orders: {
              pending_orders: 0,
              completed_orders: 0,
              total_orders: 0,
              total_revenue: 0
            }
          },
          recentApplications: sellers
            .filter(seller => seller.verification_status === 'pending')
            .map(seller => ({
              id: seller.id,
              applicantName: seller.owner_name || 'N/A',
              businessType: seller.business_type || 'N/A',
              businessName: seller.business_name || 'N/A',
              appliedAt: seller.created_at,
              status: seller.verification_status
            }))
        };

        return { data };
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw error;
      }
    }
  },

  // Products management (for Admin Products Page)
  products: {
    getAll: async (params = {}) => {
      try {
        console.log('📡 Fetching products with params:', params);
        
        // Build query string
        const queryParams = new URLSearchParams();
        if (params.status !== undefined && params.status !== null) {
          queryParams.append('status', params.status);
        }
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        const queryString = queryParams.toString();
        const endpoint = `/products/admin${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetchAPI(endpoint);
        console.log('✅ Products response:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to fetch products:', error);
        throw error;
      }
    },

    approve: async (productId) => {
      try {
        const response = await fetchAPI('/products/approve', {
          method: 'POST',
          body: JSON.stringify({ product_id: productId })
        });
        console.log('✅ Product approved:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to approve product:', error);
        throw error;
      }
    },

    reject: async (productId, reason = null) => {
      try {
        const response = await fetchAPI('/products/reject', {
          method: 'POST',
          body: JSON.stringify({ product_id: productId, reason })
        });
        console.log('✅ Product rejected:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to reject product:', error);
        throw error;
      }
    }
  },

  // Orders management (for Admin Orders Page)
  orders: {
    getAll: async () => {
      try {
        console.log('📡 Fetching all orders for admin...');
        const response = await fetchAPI('/orders');
        console.log('✅ Orders response:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to fetch orders:', error);
        throw error;
      }
    },

    updateStatus: async (orderId, status) => {
      try {
        const response = await fetchAPI(`/orders/update?id=${orderId}`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
        console.log('✅ Order status updated:', response);
        return response;
      } catch (error) {
        console.error('❌ Failed to update order status:', error);
        throw error;
      }
    }
  }
};
