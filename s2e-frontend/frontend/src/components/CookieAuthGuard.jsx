import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cookieAuth } from '../utils/cookieAuth.js';

export default function CookieAuthGuard({ children, userType = 'seller' }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      console.log('🍪 Checking cookie authentication for:', userType);
      
      let isAuth = false;
      
      if (userType === 'seller') {
        isAuth = cookieAuth.isSellerAuthenticated();
      } else if (userType === 'admin') {
        isAuth = cookieAuth.isAdminAuthenticated();
      } else if (userType === 'customer') {
        isAuth = cookieAuth.isCustomerAuthenticated();
      }
      
      console.log('🍪 Authentication result:', { isAuth, userType });
      
      if (!isAuth) {
        console.log('❌ Authentication failed, redirecting to login');
        if (userType === 'seller') {
          navigate('/seller/login');
        } else if (userType === 'admin') {
          navigate('/admin/login');
        } else {
          navigate('/login');
        }
        return;
      }
      
      console.log('✅ Authentication successful');
      setIsAuthenticated(true);
      setIsChecking(false);
    };

    // Small delay to ensure cookies are available
    const timer = setTimeout(checkAuthentication, 100);
    return () => clearTimeout(timer);
  }, [navigate, userType]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return children;
}

