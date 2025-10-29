import React from 'react';
import { useAppState } from '../context/AppContext.jsx';

export default function SellerAuthDebug() {
  const { state } = useAppState();
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userType = localStorage.getItem('userType');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const sellerToken = localStorage.getItem('sellerToken');
  const token = localStorage.getItem('token');

  return (
    <div className="alert alert-info mb-3">
      <h6>🔍 Seller Authentication Debug</h6>
      <div className="row">
        <div className="col-md-6">
          <strong>App State:</strong><br />
          isLoggedIn: {state.isLoggedIn ? 'true' : 'false'}<br />
          user: {state.user ? JSON.stringify(state.user, null, 2) : 'null'}<br />
        </div>
        <div className="col-md-6">
          <strong>Local Storage:</strong><br />
          isLoggedIn: {isLoggedIn ? 'true' : 'false'}<br />
          userType: {userType || 'null'}<br />
          user: {user ? JSON.stringify(user, null, 2) : 'null'}<br />
          sellerToken: {sellerToken ? 'exists' : 'null'}<br />
          token: {token ? 'exists' : 'null'}<br />
        </div>
      </div>
      <div className="mt-2">
        <strong>Authentication Status:</strong> {
          isLoggedIn && userType === 'seller' && user?.role === 'seller' 
            ? '✅ Authenticated as Seller' 
            : '❌ Not Authenticated as Seller'
        }
      </div>
    </div>
  );
}

