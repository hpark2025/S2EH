/**
 * User Cart API
 * Handles cart operations with database persistence
 * Uses Vite proxy to avoid CORS issues
 */

/**
 * Get authentication token from cookies or localStorage
 */
const getAuthToken = () => {
  // Try cookies first (various possible names)
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token' || name === 'token' || name === 'user_token') {
      console.log('🔑 Found token in cookie:', name);
      return value;
    }
  }
  
  // Fallback to localStorage
  const token = localStorage.getItem('token') || 
                localStorage.getItem('customerToken') || 
                localStorage.getItem('userToken');
  
  if (token) {
    console.log('🔑 Found token in localStorage');
    return token;
  }
  
  console.log('❌ No auth token found in cookies or localStorage');
  console.log('📋 Available cookies:', document.cookie);
  console.log('📋 LocalStorage token:', localStorage.getItem('token'));
  return null;
};

/**
 * Fetch wrapper with authentication (supports both direct URLs and Vite proxy)
 */
const fetchAPI = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('📡 Fetching:', url);
  console.log('📡 Headers:', headers);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  console.log('✅ Response status:', response.status);
  
  // Get response as text first to check if it's JSON
  const text = await response.text();
  console.log('📄 Response text:', text.substring(0, 500)); // Show first 500 chars
  
  let data;
  try {
    data = JSON.parse(text);
    console.log('✅ Response data:', data);
  } catch (e) {
    console.error('❌ Failed to parse JSON response:', e);
    console.error('📄 Full response:', text);
    throw new Error('Server returned invalid JSON. Check console for details.');
  }
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
};

export const userCartAPI = {
  /**
   * Get user's cart
   */
  getCart: async () => {
    try {
      console.log('📡 Fetching user cart from database...');
      const response = await fetchAPI('http://localhost:8080/S2EH/s2e-backend/api/cart/');
      console.log('✅ Cart response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch cart:', error);
      throw error;
    }
  },

  /**
   * Add item to cart
   */
  addToCart: async (productId, quantity = 1) => {
    try {
      console.log('📡 Adding item to cart:', { productId, quantity });
      
      // Use direct backend URL to avoid Vite proxy POST->GET conversion issue
      // Add trailing slash to prevent Apache redirect during CORS preflight
      const response = await fetch('http://localhost:8080/S2EH/s2e-backend/api/cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity
        })
      });
      
      console.log('✅ Response status:', response.status);
      
      const text = await response.text();
      console.log('📄 Response text:', text.substring(0, 500));
      
      const data = JSON.parse(text);
      console.log('✅ Add to cart response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }
      
      return data.data;
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      throw error;
    }
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (itemId, quantity) => {
    try {
      console.log('📡 Updating cart item:', { itemId, quantity });
      const response = await fetchAPI(`http://localhost:8080/S2EH/s2e-backend/api/cart/items/${itemId}/`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });
      console.log('✅ Update cart item response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update cart item:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (itemId) => {
    try {
      console.log('📡 Removing item from cart:', itemId);
      const response = await fetchAPI(`http://localhost:8080/S2EH/s2e-backend/api/cart/items/${itemId}/`, {
        method: 'DELETE'
      });
      console.log('✅ Remove from cart response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to remove from cart:', error);
      throw error;
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    try {
      console.log('📡 Clearing cart...');
      const response = await fetchAPI('http://localhost:8080/S2EH/s2e-backend/api/cart/', {
        method: 'DELETE'
      });
      console.log('✅ Clear cart response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      throw error;
    }
  },

  /**
   * Create order
   */
  createOrder: async (orderData) => {
    try {
      console.log('📡 Creating order:', orderData);
      
      const response = await fetch('http://localhost:8080/S2EH/s2e-backend/api/orders/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(orderData)
      });
      
      console.log('✅ Response status:', response.status);
      
      const text = await response.text();
      console.log('📄 Response text:', text.substring(0, 500));
      
      const data = JSON.parse(text);
      console.log('✅ Create order response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }
      
      return data.data || data;
    } catch (error) {
      console.error('❌ Failed to create order:', error);
      throw error;
    }
  }
};

