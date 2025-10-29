import React, { useState } from 'react';
import { authAPI } from '../services/authAPI';

/**
 * Test component for seller login functionality
 * This component can be used to test the login API without the full form
 */
export default function SellerLoginTest() {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('Testing seller login...');
      
      const response = await authAPI.sellerLogin({
        email: 'seller@example.com',
        password: 'password123'
      });

      console.log('Login response:', response);
      
      setTestResult({
        success: true,
        message: 'Login successful!',
        data: response
      });

    } catch (error) {
      console.error('Login test failed:', error);
      
      setTestResult({
        success: false,
        message: error.message || 'Login failed',
        error: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testGuestLogin = () => {
    console.log('Testing guest login...');
    
    // Simulate guest login
    const guestUser = {
      id: 'guest',
      email: 'guest@s2eh.com',
      role: 'seller',
      firstName: 'Guest',
      lastName: 'Seller',
      businessName: 'Guest Business',
      isGuest: true
    };

    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('userType', 'seller');
    localStorage.setItem('isLoggedIn', 'true');

    setTestResult({
      success: true,
      message: 'Guest login successful!',
      data: guestUser
    });
  };

  const clearStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    
    setTestResult({
      success: true,
      message: 'Storage cleared!'
    });
  };

  return (
    <div className="seller-login-test p-4">
      <h4>Seller Login Test</h4>
      
      <div className="mb-3">
        <button 
          className="btn btn-primary me-2" 
          onClick={testLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Real Login'}
        </button>
        
        <button 
          className="btn btn-secondary me-2" 
          onClick={testGuestLogin}
        >
          Test Guest Login
        </button>
        
        <button 
          className="btn btn-warning" 
          onClick={clearStorage}
        >
          Clear Storage
        </button>
      </div>

      {testResult && (
        <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'}`}>
          <h6>{testResult.success ? '✅ Success' : '❌ Error'}</h6>
          <p>{testResult.message}</p>
          {testResult.data && (
            <details>
              <summary>Response Data</summary>
              <pre className="mt-2">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </details>
          )}
          {testResult.error && (
            <details>
              <summary>Error Details</summary>
              <pre className="mt-2">
                {JSON.stringify(testResult.error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="mt-3">
        <h6>Current Storage:</h6>
        <div className="bg-light p-2 rounded">
          <strong>User:</strong> {localStorage.getItem('user') || 'None'}<br />
          <strong>User Type:</strong> {localStorage.getItem('userType') || 'None'}<br />
          <strong>Is Logged In:</strong> {localStorage.getItem('isLoggedIn') || 'None'}<br />
          <strong>Seller Token:</strong> {localStorage.getItem('sellerToken') ? 'Present' : 'None'}
        </div>
      </div>
    </div>
  );
}

