import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppContext.jsx';

export default function SellerAuthGuard({ children }) {
  const { state } = useAppState();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userType = localStorage.getItem('userType');
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      console.log('🔍 Auth Check:', { 
        isLoggedIn, 
        userType, 
        user, 
        appState: { isLoggedIn: state.isLoggedIn, user: state.user }
      });

      // Check if user is logged in and is a seller
      if (!isLoggedIn || userType !== 'seller' || !user) {
        console.log('❌ Seller authentication failed:', { isLoggedIn, userType, user });
        navigate('/seller/login');
        return;
      }

      // Additional check: ensure user has seller role
      if (user.role !== 'seller') {
        console.log('❌ User is not a seller:', user.role);
        navigate('/seller/login');
        return;
      }

      console.log('✅ Seller authentication successful:', { isLoggedIn, userType, user });
      setIsChecking(false);
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [navigate, state.isLoggedIn, state.user]);

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

  return children;
}
