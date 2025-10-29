// Backend API Configuration (PHP MySQL Backend)
export const MEDUSA_CONFIG = {
  // Publishable key for client-side requests (legacy - not used with PHP backend)
  PUBLISHABLE_KEY: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || 'pk_01H1234567890abcdef',
  
  // Backend URL - PHP backend on XAMPP port 8080
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? '' : 'http://localhost:8080/S2EH/s2e-backend'),
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      CUSTOMER_LOGIN: '/auth/customer/emailpass',
      CUSTOMER_REGISTER: '/auth/customer/emailpass/register',
      SELLER_LOGIN: '/auth/seller/emailpass',
      SELLER_REGISTER: '/auth/seller/emailpass/register',
      USER_LOGIN: '/auth/user/emailpass',
    },
    
    // Store endpoints (public)
    STORE: {
      PRODUCTS: '/store/products',
      PRODUCT_CATEGORIES: '/store/product-categories',
      ORDERS: '/store/orders',
      CUSTOMERS: '/customers/me',
    },
    
    // Seller endpoints (authenticated)
    SELLER: {
      PROFILE: '/seller/me',
      PRODUCTS: '/seller/products',
      ORDERS: '/seller/orders',
      ANALYTICS: '/seller/analytics',
      CUSTOMERS: '/seller/customers',
    },
    
    // Admin endpoints (authenticated)
    ADMIN: {
      USERS: '/admin/users',
      SELLERS: '/admin/sellers',
      CUSTOMERS: '/admin/customers',
      PRODUCTS: '/admin/products',
      PRODUCT_CATEGORIES: '/admin/product-categories',
      ORDERS: '/admin/orders',
    }
  }
};

// Helper function to get headers (PHP backend - no publishable key needed)
export const getMedusaHeaders = (additionalHeaders = {}) => {
  return {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
};

// Helper function to get authenticated headers
export const getAuthenticatedHeaders = (token, additionalHeaders = {}) => {
  return {
    ...getMedusaHeaders(),
    'Authorization': `Bearer ${token}`,
    ...additionalHeaders
  };
};
