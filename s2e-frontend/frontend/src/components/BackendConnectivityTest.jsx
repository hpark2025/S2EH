import React, { useState } from 'react';
import api from '../services/api';
import { cookieAuth } from '../utils/cookieAuth';

export default function BackendConnectivityTest() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runConnectivityTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results = [];

    try {
      // Test 1: Basic connectivity
      results.push({
        test: '1. Basic Connectivity',
        status: 'info',
        details: 'Testing basic backend connectivity...'
      });

      try {
        // Try a simple GET request to a known endpoint
        const response = await api.get('/store/products?limit=1');
        results.push({
          test: '1. Basic Connectivity',
          status: 'success',
          details: '✅ Backend is reachable',
          data: { status: response.status, statusText: response.statusText }
        });
      } catch (error) {
        results.push({
          test: '1. Basic Connectivity',
          status: 'error',
          details: `❌ Backend not reachable: ${error.message}`,
          error: {
            status: error.response?.status,
            data: error.response?.data
          }
        });
      }

      // Test 2: Authentication headers
      results.push({
        test: '2. Authentication Headers',
        status: 'info',
        details: 'Checking authentication setup...'
      });

      const auth = cookieAuth.getAuth();
      const hasToken = !!auth.token;
      
      results.push({
        test: '2. Authentication Headers',
        status: hasToken ? 'success' : 'warning',
        details: hasToken 
          ? '✅ Authentication token present' 
          : '⚠️ No authentication token found',
        data: {
          isLoggedIn: auth.isLoggedIn,
          userType: auth.userType,
          hasToken: hasToken,
          tokenPreview: hasToken ? auth.token.substring(0, 20) + '...' : 'None'
        }
      });

      // Test 3: Seller endpoints accessibility
      results.push({
        test: '3. Seller Endpoints',
        status: 'info',
        details: 'Testing seller endpoint accessibility...'
      });

      try {
        const sellerResponse = await api.get('/seller/products?limit=1');
        results.push({
          test: '3. Seller Endpoints',
          status: 'success',
          details: '✅ Seller endpoints accessible',
          data: { status: sellerResponse.status }
        });
      } catch (error) {
        results.push({
          test: '3. Seller Endpoints',
          status: error.response?.status === 401 ? 'warning' : 'error',
          details: error.response?.status === 401 
            ? '⚠️ Seller endpoints require authentication (401 - expected)'
            : `❌ Seller endpoint error: ${error.message}`,
          error: {
            status: error.response?.status,
            data: error.response?.data
          }
        });
      }

      // Test 4: Stock locations endpoint specifically
      results.push({
        test: '4. Stock Locations Endpoint',
        status: 'info',
        details: 'Testing stock locations endpoint specifically...'
      });

      try {
        const stockResponse = await api.get('/seller/stock-locations');
        results.push({
          test: '4. Stock Locations Endpoint',
          status: 'success',
          details: '✅ Stock locations endpoint accessible',
          data: { 
            status: stockResponse.status,
            hasData: !!stockResponse.data,
            dataKeys: stockResponse.data ? Object.keys(stockResponse.data) : []
          }
        });
      } catch (error) {
        results.push({
          test: '4. Stock Locations Endpoint',
          status: error.response?.status === 401 ? 'warning' : 'error',
          details: error.response?.status === 401 
            ? '⚠️ Stock locations endpoint requires authentication (401 - expected)'
            : `❌ Stock locations endpoint error: ${error.message}`,
          error: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          }
        });
      }

      // Test 5: Request headers inspection
      results.push({
        test: '5. Request Headers',
        status: 'info',
        details: 'Inspecting request headers...'
      });

      // Create a test request to see what headers are being sent
      const testConfig = {
        url: '/seller/stock-locations',
        method: 'GET',
        headers: {}
      };

      // Simulate the interceptor logic
      const auth2 = cookieAuth.getAuth();
      let token = auth2.token;
      
      if (!token) {
        const userType = localStorage.getItem('userType');
        token = localStorage.getItem(`${userType}Token`) || localStorage.getItem('token');
      }
      
      if (token) {
        testConfig.headers.Authorization = `Bearer ${token}`;
      }

      results.push({
        test: '5. Request Headers',
        status: 'success',
        details: '✅ Request headers configured',
        data: {
          hasAuthHeader: !!testConfig.headers.Authorization,
          authHeaderPreview: testConfig.headers.Authorization ? 
            testConfig.headers.Authorization.substring(0, 20) + '...' : 'None',
          allHeaders: testConfig.headers
        }
      });

    } catch (error) {
      results.push({
        test: 'General Error',
        status: 'error',
        details: `❌ Unexpected error: ${error.message}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6>🌐 Backend Connectivity Test</h6>
        <p className="mb-0">Test backend connectivity and authentication setup</p>
      </div>
      <div className="card-body">
        <button 
          className="btn btn-primary mb-3" 
          onClick={runConnectivityTests}
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Run Connectivity Tests'}
        </button>

        {testResults.length > 0 && (
          <div className="test-results">
            <h6>Connectivity Results:</h6>
            {testResults.map((result, index) => (
              <div key={index} className={`alert ${
                result.status === 'success' ? 'alert-success' : 
                result.status === 'error' ? 'alert-danger' : 
                result.status === 'warning' ? 'alert-warning' :
                'alert-info'
              }`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{result.test}</strong>
                    <br />
                    <small>{result.details}</small>
                    {result.data && (
                      <pre className="mt-2 mb-0" style={{ fontSize: '0.8em' }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                    {result.error && (
                      <pre className="mt-2 mb-0" style={{ fontSize: '0.8em' }}>
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    )}
                  </div>
                  <span className={`badge ${
                    result.status === 'success' ? 'bg-success' : 
                    result.status === 'error' ? 'bg-danger' : 
                    result.status === 'warning' ? 'bg-warning' :
                    'bg-info'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

