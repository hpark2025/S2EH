import React, { useState } from 'react';
import { MEDUSA_CONFIG } from '../config/medusa';
import api from '../services/api';

/**
 * Test component to verify MedusaJS configuration
 */
export default function MedusaConfigTest() {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConfiguration = () => {
    setTestResult({
      success: true,
      message: 'Configuration loaded successfully!',
      data: {
        publishableKey: MEDUSA_CONFIG.PUBLISHABLE_KEY,
        backendUrl: MEDUSA_CONFIG.BACKEND_URL,
        keyPrefix: MEDUSA_CONFIG.PUBLISHABLE_KEY.substring(0, 10) + '...',
        keyLength: MEDUSA_CONFIG.PUBLISHABLE_KEY.length
      }
    });
  };

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('Testing API connection...');
      
      // Test a simple API call (this will include the publishable key)
      const response = await api.get('/store/products', {
        params: { limit: 1 }
      });

      console.log('API response:', response);
      
      setTestResult({
        success: true,
        message: 'API connection successful!',
        data: {
          status: response.status,
          headers: response.config.headers,
          hasPublishableKey: !!response.config.headers['x-publishable-api-key']
        }
      });

    } catch (error) {
      console.error('API test failed:', error);
      
      setTestResult({
        success: false,
        message: error.message || 'API connection failed',
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testStoreInfo = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('Testing store info...');
      
      // Test store info endpoint
      const response = await api.get('/store');
      
      console.log('Store info response:', response);
      
      setTestResult({
        success: true,
        message: 'Store info retrieved successfully!',
        data: response.data
      });

    } catch (error) {
      console.error('Store info test failed:', error);
      
      setTestResult({
        success: false,
        message: error.message || 'Store info test failed',
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSalesChannels = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('Testing sales channels...');
      
      // Test sales channels endpoint
      const response = await api.get('/admin/sales-channels');
      
      console.log('Sales channels response:', response);
      
      setTestResult({
        success: true,
        message: 'Sales channels retrieved successfully!',
        data: {
          salesChannels: response.data,
          count: response.data?.length || 0
        }
      });

    } catch (error) {
      console.error('Sales channels test failed:', error);
      
      setTestResult({
        success: false,
        message: error.message || 'Sales channels test failed',
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="medusa-config-test p-4">
      <h4>MedusaJS Configuration Test</h4>
      
      <div className="mb-4">
        <h6>Current Configuration:</h6>
        <div className="bg-light p-3 rounded">
          <div><strong>Publishable Key:</strong> {MEDUSA_CONFIG.PUBLISHABLE_KEY.substring(0, 20)}...</div>
          <div><strong>Backend URL:</strong> {MEDUSA_CONFIG.BACKEND_URL}</div>
          <div><strong>Key Length:</strong> {MEDUSA_CONFIG.PUBLISHABLE_KEY.length} characters</div>
          <div><strong>Key Valid:</strong> {MEDUSA_CONFIG.PUBLISHABLE_KEY.startsWith('pk_') ? '✅ Yes' : '❌ No'}</div>
        </div>
      </div>

      <div className="mb-3">
        <button 
          className="btn btn-info me-2" 
          onClick={testConfiguration}
        >
          Test Configuration
        </button>
        
        <button 
          className="btn btn-primary me-2" 
          onClick={testApiConnection}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button 
          className="btn btn-success me-2" 
          onClick={testStoreInfo}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Store Info'}
        </button>
        
        <button 
          className="btn btn-warning" 
          onClick={testSalesChannels}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Sales Channels'}
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

      <div className="mt-4">
        <h6>Setup Instructions:</h6>
        <ol>
          <li>Create a <code>.env</code> file in your frontend root</li>
          <li>Add: <code>VITE_MEDUSA_PUBLISHABLE_KEY=pk_01H...your_key_here</code></li>
          <li>Add: <code>VITE_MEDUSA_BACKEND_URL=http://localhost:9000</code></li>
          <li>Restart your development server</li>
          <li>Test the configuration above</li>
        </ol>
      </div>
    </div>
  );
}
