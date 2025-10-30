import axios from 'axios';
import { MEDUSA_CONFIG, getMedusaHeaders } from '../config/medusa';
import { cookieAuth } from '../utils/cookieAuth.js';

// Create Axios instance with MedusaJS backend configuration
const api = axios.create({
  baseURL: MEDUSA_CONFIG.BACKEND_URL,
  timeout: 10000, // 10 seconds timeout
  headers: getMedusaHeaders(),
  withCredentials: true, // Send cookies with requests
  validateStatus: status => status >= 200 && status < 500 // Handle 4xx errors in responses
});

// Request interceptor to add JWT tokens for authenticated requests
api.interceptors.request.use(
  (config) => {
    // Try to get token from cookies first
    const auth = cookieAuth.getAuth();
    let token = auth.token;
    
    // Fallback to localStorage for backward compatibility
    if (!token) {
      const userType = localStorage.getItem('userType');
      token = localStorage.getItem(`${userType}Token`) || localStorage.getItem('token') || localStorage.getItem('adminToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding token to request:', config.url, 'Token:', token.substring(0, 10) + '...');
      
      // Add seller ID to headers for seller requests
      if (config.url?.includes('/seller/')) {
        const sellerId = localStorage.getItem('sellerId') || auth.user?.id;
        if (sellerId) {
          config.headers['X-Seller-ID'] = sellerId;
        }
      }
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    
    // Handle FormData - let axios set Content-Type with boundary automatically
    if (config.data instanceof FormData) {
      console.log('📦 Detected FormData, removing Content-Type to let axios handle it');
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

export default api;


