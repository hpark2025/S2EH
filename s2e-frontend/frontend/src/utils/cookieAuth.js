import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_CONFIG = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // Only secure in production
  sameSite: 'lax', // CSRF protection
  path: '/'
};

// Cookie keys
export const COOKIE_KEYS = {
  IS_LOGGED_IN: 'isLoggedIn',
  USER_TYPE: 'userType', 
  USER: 'user',
  TOKEN: 'token',
  SELLER_TOKEN: 'sellerToken',
  ADMIN_TOKEN: 'adminToken'
};

// Authentication utilities
export const cookieAuth = {
  // Set authentication data
  setAuth: (userData, token, userType = 'seller') => {
    try {
      // Set basic auth cookies
      Cookies.set(COOKIE_KEYS.IS_LOGGED_IN, 'true', COOKIE_CONFIG);
      Cookies.set(COOKIE_KEYS.USER_TYPE, userType, COOKIE_CONFIG);
      Cookies.set(COOKIE_KEYS.USER, JSON.stringify(userData), COOKIE_CONFIG);
      
      // Set token based on user type
      if (userType === 'seller') {
        Cookies.set(COOKIE_KEYS.SELLER_TOKEN, token, COOKIE_CONFIG);
      } else if (userType === 'admin') {
        Cookies.set(COOKIE_KEYS.ADMIN_TOKEN, token, COOKIE_CONFIG);
      } else {
        Cookies.set(COOKIE_KEYS.TOKEN, token, COOKIE_CONFIG);
      }
      
      console.log('✅ Auth cookies set successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to set auth cookies:', error);
      return false;
    }
  },

  // Get authentication data
  getAuth: () => {
    try {
      const isLoggedIn = Cookies.get(COOKIE_KEYS.IS_LOGGED_IN) === 'true';
      const userType = Cookies.get(COOKIE_KEYS.USER_TYPE);
      const user = JSON.parse(Cookies.get(COOKIE_KEYS.USER) || 'null');
        
      // Get token based on user type
      let token = null;
      if (userType === 'seller') {
        token = Cookies.get(COOKIE_KEYS.SELLER_TOKEN);
      } else if (userType === 'admin') {
        token = Cookies.get(COOKIE_KEYS.ADMIN_TOKEN);
      } else {
        token = Cookies.get(COOKIE_KEYS.TOKEN);
      }

      return {
        isLoggedIn,
        userType,
        user,
        token
      };
    } catch (error) {
      console.error('❌ Failed to get auth cookies:', error);
      return {
        isLoggedIn: false,
        userType: null,
        user: null,
        token: null
      };
    }
  },

  // Check if user is authenticated as seller
  isSellerAuthenticated: () => {
    const auth = cookieAuth.getAuth();
    return auth.isLoggedIn && 
           auth.userType === 'seller' && 
           auth.user && 
           auth.token;
  },

  // Check if user is authenticated as admin
  isAdminAuthenticated: () => {
    const auth = cookieAuth.getAuth();
    return auth.isLoggedIn && 
           auth.userType === 'admin' && 
           auth.user && 
           (auth.user.role === 'admin' || auth.user.role === 'super_admin' || auth.user.role === 'moderator') &&
           auth.token;
  },

  // Check if user is authenticated as customer
  isCustomerAuthenticated: () => {
    const auth = cookieAuth.getAuth();
    return auth.isLoggedIn && 
           auth.userType === 'customer' && 
           auth.user && 
           auth.token;
  },

  // Clear all authentication data
  clearAuth: () => {
    try {
      // Clear all auth cookies
      Object.values(COOKIE_KEYS).forEach(key => {
        Cookies.remove(key, { path: '/' });
      });
      
      console.log('✅ Auth cookies cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear auth cookies:', error);
      return false;
    }
  },

  // Get current token for API requests
  getCurrentToken: () => {
    const auth = cookieAuth.getAuth();
    return auth.token;
  },

  // Debug authentication status
  debugAuth: () => {
    const auth = cookieAuth.getAuth();
    console.log('🍪 Cookie Auth Debug:', {
      isLoggedIn: auth.isLoggedIn,
      userType: auth.userType,
      user: auth.user,
      hasToken: !!auth.token,
      isSeller: cookieAuth.isSellerAuthenticated(),
      isAdmin: cookieAuth.isAdminAuthenticated(),
      isCustomer: cookieAuth.isCustomerAuthenticated()
    });
    return auth;
  }
};

export default cookieAuth;

