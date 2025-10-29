import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SellerAuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userType = localStorage.getItem('userType');
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      console.log('🔍 SellerAuthCheck:', { 
        isLoggedIn, 
        userType, 
        user,
        currentPath: window.location.pathname
      });

      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/seller/login') {
        if (!isLoggedIn || userType !== 'seller' || !user || user.role !== 'seller') {
          console.log('❌ Redirecting to login - Auth failed');
          navigate('/seller/login');
        } else {
          console.log('✅ Authentication OK');
        }
      }
    };

    // Check immediately and also after a short delay
    checkAuth();
    const timer = setTimeout(checkAuth, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return null; // This component doesn't render anything
}

