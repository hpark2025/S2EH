import api from './api'
import { MEDUSA_CONFIG } from '../config/medusa'
import { cookieAuth } from '../utils/cookieAuth.js'

export const cartAPI = {
  // Get available regions
  getRegions: async () => {
    try {
      console.log('🔍 Getting available regions...');
      const response = await api.get('/store/regions', {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY
        }
      });
      console.log('🔍 Regions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get regions:', error);
      throw error;
    }
  },

  // Get default region (first available region)
  getDefaultRegion: async () => {
    try {
      console.log('🔍 Getting default region...');
      const regionsResponse = await cartAPI.getRegions();
      const regions = regionsResponse.regions || [];
      
      if (regions.length === 0) {
        throw new Error('No regions available');
      }
      
      const defaultRegion = regions[0];
      console.log('🔍 Default region selected:', defaultRegion);
      return defaultRegion;
    } catch (error) {
      console.error('Failed to get default region:', error);
      throw error;
    }
  },


  // Get or create cart
  getCart: async () => {
    try {
      console.log('🔍 Getting cart...');
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      // Try to get existing cart from localStorage first
      let cartId = localStorage.getItem('cart_id');
      
      if (cartId) {
        console.log('🔍 Found existing cart ID:', cartId);
        try {
          const response = await api.get(`/store/carts/${cartId}`, {
            headers: {
              'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('🔍 Existing cart response:', response.data);
          return response.data;
        } catch (error) {
          console.warn('🔍 Existing cart not found, creating new one');
          // Clear invalid cart ID
          localStorage.removeItem('cart_id');
          cartId = null;
        }
      }
      
      // Create new cart if none exists
      if (!cartId) {
        console.log('🔍 Creating new cart...');
        
        // Get default region
        const defaultRegion = await cartAPI.getDefaultRegion();
        const regionId = defaultRegion.id;
        console.log('🔍 Using region ID:', regionId);
        console.log('🔍 Region details:', defaultRegion);
        
        const response = await api.post('/store/carts', {
          region_id: regionId
        }, {
          headers: {
            'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('🔍 New cart response:', response.data);
        cartId = response.data.cart.id;
        localStorage.setItem('cart_id', cartId);
        return response.data;
      }
      
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw error;
    }
  },

  // Validate variant has pricing before adding to cart
  validateVariantPricing: async (variantId) => {
    try {
      console.log('🔍 Validating variant pricing for:', variantId);
      
      // Get variant details with pricing information
      const response = await api.get(`/store/variants/${variantId}`, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY
        }
      });
      
      const variant = response.data.variant;
      console.log('🔍 Variant details:', variant);
      
      // Check if variant has pricing
      if (!variant.prices || variant.prices.length === 0) {
        throw new Error('Variant has no pricing configured');
      }
      
      // Check if variant has calculated price
      if (!variant.calculated_price) {
        console.warn('🔍 Variant has no calculated price, but has prices array');
      }
      
      return variant;
    } catch (error) {
      console.error('🔍 Variant pricing validation failed:', error);
      throw new Error(`Variant pricing validation failed: ${error.message}`);
    }
  },

  // Add item to cart
  addItem: async (variantId, quantity = 1, metadata = {}) => {
    try {
      console.log('🔍 Adding item to cart:', { variantId, quantity, metadata });
      
      // Validate inputs
      if (!variantId) {
        throw new Error('Variant ID is required');
      }
      
      if (!quantity || quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }
      
      // Log variant ID for debugging
      console.log('🔍 Using variant_id:', variantId);
      
      // Validate variant has proper pricing
      try {
        const variant = await cartAPI.validateVariantPricing(variantId);
        console.log('🔍 Variant pricing validation passed:', variant);
      } catch (validationError) {
        console.error('🔍 Variant pricing validation failed:', validationError);
        throw new Error(`Cannot add variant to cart: ${validationError.message}. Please ensure the product has proper pricing configured in the backend.`);
      }
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      // Get cart ID
      let cartId = localStorage.getItem('cart_id');
      
      if (!cartId) {
        // Create cart first
        const cartResponse = await cartAPI.getCart();
        cartId = cartResponse.cart.id;
      }
      
      console.log('🔍 Using cart ID:', cartId);
      
      // Prepare request body
      const requestBody = {
        variant_id: variantId,
        quantity: parseInt(quantity)
      };
      
      // Only add metadata if it's not empty
      if (metadata && Object.keys(metadata).length > 0) {
        requestBody.metadata = metadata;
      }
      
      console.log('🔍 Request body:', requestBody);
      console.log('🔍 Cart ID:', cartId);
      console.log('🔍 Headers:', {
        'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
        'Authorization': `Bearer ${token ? 'Present' : 'Missing'}`
      });
      
      const response = await api.post(`/store/carts/${cartId}/line-items`, requestBody, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Add item response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Update line item quantity
  updateLineItem: async (lineItemId, quantity) => {
    try {
      console.log('🔍 Updating line item:', { lineItemId, quantity });
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        throw new Error('No cart found');
      }
      
      const response = await api.post(`/store/carts/${cartId}/line-items/${lineItemId}`, {
        quantity: quantity
      }, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Update line item response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update line item:', error);
      throw error;
    }
  },

  // Remove line item from cart
  removeLineItem: async (lineItemId) => {
    try {
      console.log('🔍 Removing line item:', lineItemId);
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        throw new Error('No cart found');
      }
      
      const response = await api.delete(`/store/carts/${cartId}/line-items/${lineItemId}`, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Remove line item response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to remove line item:', error);
      throw error;
    }
  },

  // Update cart
  updateCart: async (updateData) => {
    try {
      console.log('🔍 Updating cart:', updateData);
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        throw new Error('No cart found');
      }
      
      const response = await api.post(`/store/carts/${cartId}`, updateData, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Update cart response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    }
  },

  // Add shipping method
  addShippingMethod: async (optionId) => {
    try {
      console.log('🔍 Adding shipping method:', optionId);
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        throw new Error('No cart found');
      }
      
      const response = await api.post(`/store/carts/${cartId}/shipping-methods`, {
        option_id: optionId
      }, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Add shipping method response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add shipping method:', error);
      throw error;
    }
  },

  // Add discount code
  addDiscount: async (code) => {
    try {
      console.log('🔍 Adding discount code:', code);
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        throw new Error('No cart found');
      }
      
      const response = await api.post(`/store/carts/${cartId}`, {
        discounts: [{ code: code }]
      }, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Add discount response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to add discount:', error);
      throw error;
    }
  },

  // Remove discount
  removeDiscount: async (code) => {
    try {
      console.log('🔍 Removing discount code:', code);
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        throw new Error('No cart found');
      }
      
      const response = await api.delete(`/store/carts/${cartId}/discounts/${code}`, {
        headers: {
          'x-publishable-api-key': MEDUSA_CONFIG.PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Remove discount response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to remove discount:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      console.log('🔍 Clearing cart...');
      
      // Get authentication token from cookies
      const auth = cookieAuth.getAuth();
      const token = auth.token;
      
      if (!token) {
        throw new Error('No authentication token found in cookies');
      }
      
      const cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        console.log('🔍 No cart to clear');
        return;
      }
      
      // Get current cart to remove all line items
      const cartResponse = await cartAPI.getCart();
      const lineItems = cartResponse.cart.items || [];
      
      // Remove each line item
      for (const item of lineItems) {
        await cartAPI.removeLineItem(item.id);
      }
      
      console.log('🔍 Cart cleared successfully');
      return { cart: { items: [] } };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  // Get cart totals
  getCartTotals: (cart) => {
    if (!cart || !cart.items) {
      return {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      };
    }

    const subtotal = cart.subtotal || 0;
    const tax = cart.tax_total || 0;
    const shipping = cart.shipping_total || 0;
    const discount = cart.discount_total || 0;
    const total = cart.total || 0;
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: subtotal / 100, // Convert from cents
      tax: tax / 100,
      shipping: shipping / 100,
      discount: discount / 100,
      total: total / 100,
      itemCount
    };
  }
}


