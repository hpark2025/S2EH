import React, { useState } from 'react';
import { sellerAPI } from '../services/sellerAPI';
import { toast } from 'react-hot-toast';

export default function StockLocationDebugForm() {
  const [testData, setTestData] = useState({
    name: 'Test Warehouse',
    address: {
      address_1: '123 Test Street',
      address_2: 'Unit 1',
      city: 'Test City',
      province: 'Test Province',
      postal_code: '1234',
      country_code: 'ph'
    },
    metadata: {
      test: true,
      created_at: new Date().toISOString()
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testCreate = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing stock location creation with:', testData);
      
      const response = await sellerAPI.stockLocations.createStockLocation(testData);
      
      setResult({
        success: true,
        data: response,
        message: 'Stock location created successfully!'
      });
      
      toast.success('Test stock location created!');
    } catch (error) {
      console.error('🧪 Test failed:', error);
      
      setResult({
        success: false,
        error: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        },
        message: 'Test failed'
      });
      
      toast.error('Test failed - check console for details');
    } finally {
      setIsLoading(false);
    }
  };

  const testMinimalData = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const minimalData = {
        name: 'Minimal Test',
        address: {
          address_1: '123 Street',
          city: 'City',
          country_code: 'ph'
        }
      };
      
      console.log('🧪 Testing with minimal data:', minimalData);
      
      const response = await sellerAPI.stockLocations.createStockLocation(minimalData);
      
      setResult({
        success: true,
        data: response,
        message: 'Minimal stock location created successfully!'
      });
      
      toast.success('Minimal test passed!');
    } catch (error) {
      console.error('🧪 Minimal test failed:', error);
      
      setResult({
        success: false,
        error: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        },
        message: 'Minimal test failed'
      });
      
      toast.error('Minimal test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6>🧪 Stock Location Debug Form</h6>
        <p className="mb-0">Test different data structures to identify the issue</p>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <h6>Test Data:</h6>
          <pre style={{ fontSize: '0.8em', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
        
        <div className="mb-3">
          <button 
            className="btn btn-primary me-2" 
            onClick={testCreate}
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Full Data'}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={testMinimalData}
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Minimal Data'}
          </button>
        </div>
        
        {result && (
          <div className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
            <h6>{result.success ? '✅ Success' : '❌ Failed'}</h6>
            <p>{result.message}</p>
            
            {result.success && result.data && (
              <div>
                <strong>Response Data:</strong>
                <pre style={{ fontSize: '0.8em', marginTop: '10px' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
            
            {!result.success && result.error && (
              <div>
                <strong>Error Details:</strong>
                <pre style={{ fontSize: '0.8em', marginTop: '10px' }}>
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

