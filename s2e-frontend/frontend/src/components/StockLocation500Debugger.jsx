import React, { useState } from 'react';
import { sellerAPI } from '../services/sellerAPI';
import { cookieAuth } from '../utils/cookieAuth';
import { toast } from 'react-hot-toast';

export default function StockLocation500Debugger() {
  const [debugResults, setDebugResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDebugResults([]);
    const results = [];

    try {
      // 1. Check Authentication
      results.push({
        step: '1. Authentication Check',
        status: 'info',
        details: 'Checking seller authentication...'
      });

      const auth = cookieAuth.getAuth();
      const isAuthenticated = cookieAuth.isSellerAuthenticated();
      
      results.push({
        step: '1. Authentication Check',
        status: isAuthenticated ? 'success' : 'error',
        details: isAuthenticated 
          ? '✅ Seller is properly authenticated' 
          : '❌ Seller authentication failed',
        data: {
          isLoggedIn: auth.isLoggedIn,
          userType: auth.userType,
          hasToken: !!auth.token,
          user: auth.user
        }
      });

      if (!isAuthenticated) {
        results.push({
          step: 'STOP',
          status: 'error',
          details: '❌ Cannot proceed - authentication required'
        });
        setDebugResults(results);
        setIsRunning(false);
        return;
      }

      // 2. Test GET endpoint first
      results.push({
        step: '2. GET Test',
        status: 'info',
        details: 'Testing GET /seller/stock-locations...'
      });

      try {
        const getResponse = await sellerAPI.stockLocations.getStockLocations();
        results.push({
          step: '2. GET Test',
          status: 'success',
          details: '✅ GET endpoint working',
          data: getResponse
        });
      } catch (getError) {
        results.push({
          step: '2. GET Test',
          status: 'error',
          details: `❌ GET endpoint failed: ${getError.message}`,
          error: {
            status: getError.response?.status,
            data: getError.response?.data
          }
        });
      }

      // 3. Test with minimal data
      results.push({
        step: '3. Minimal Data Test',
        status: 'info',
        details: 'Testing POST with minimal required data...'
      });

      const minimalData = {
        name: 'Test Location',
        address: {
          address_1: '123 Test St',
          city: 'Test City',
          country_code: 'ph'
        }
      };

      try {
        const minimalResponse = await sellerAPI.stockLocations.createStockLocation(minimalData);
        results.push({
          step: '3. Minimal Data Test',
          status: 'success',
          details: '✅ Minimal data POST successful',
          data: minimalResponse
        });
      } catch (minimalError) {
        results.push({
          step: '3. Minimal Data Test',
          status: 'error',
          details: `❌ Minimal data POST failed: ${minimalError.message}`,
          error: {
            status: minimalError.response?.status,
            statusText: minimalError.response?.statusText,
            data: minimalError.response?.data,
            headers: minimalError.response?.headers
          }
        });
      }

      // 4. Test with full data
      results.push({
        step: '4. Full Data Test',
        status: 'info',
        details: 'Testing POST with complete data structure...'
      });

      const fullData = {
        name: 'Full Test Location',
        address: {
          address_1: '123 Full Test Street',
          address_2: 'Unit 1',
          city: 'Full Test City',
          province: 'Full Test Province',
          postal_code: '1234',
          country_code: 'ph'
        },
        metadata: {
          test: true,
          created_at: new Date().toISOString()
        }
      };

      try {
        const fullResponse = await sellerAPI.stockLocations.createStockLocation(fullData);
        results.push({
          step: '4. Full Data Test',
          status: 'success',
          details: '✅ Full data POST successful',
          data: fullResponse
        });
      } catch (fullError) {
        results.push({
          step: '4. Full Data Test',
          status: 'error',
          details: `❌ Full data POST failed: ${fullError.message}`,
          error: {
            status: fullError.response?.status,
            statusText: fullError.response?.statusText,
            data: fullError.response?.data,
            headers: fullError.response?.headers
          }
        });
      }

      // 5. Test different data variations
      results.push({
        step: '5. Data Variations Test',
        status: 'info',
        details: 'Testing different data structure variations...'
      });

      const variations = [
        {
          name: 'Variation 1 - No metadata',
          data: {
            name: 'No Metadata Test',
            address: {
              address_1: '123 No Metadata St',
              city: 'No Metadata City',
              country_code: 'ph'
            }
          }
        },
        {
          name: 'Variation 2 - Empty metadata',
          data: {
            name: 'Empty Metadata Test',
            address: {
              address_1: '123 Empty Metadata St',
              city: 'Empty Metadata City',
              country_code: 'ph'
            },
            metadata: {}
          }
        },
        {
          name: 'Variation 3 - No address_2',
          data: {
            name: 'No Address2 Test',
            address: {
              address_1: '123 No Address2 St',
              city: 'No Address2 City',
              country_code: 'ph'
            }
          }
        }
      ];

      for (const variation of variations) {
        try {
          const variationResponse = await sellerAPI.stockLocations.createStockLocation(variation.data);
          results.push({
            step: `5. ${variation.name}`,
            status: 'success',
            details: `✅ ${variation.name} successful`,
            data: variationResponse
          });
        } catch (variationError) {
          results.push({
            step: `5. ${variation.name}`,
            status: 'error',
            details: `❌ ${variation.name} failed: ${variationError.message}`,
            error: {
              status: variationError.response?.status,
              data: variationError.response?.data
            }
          });
        }
      }

    } catch (error) {
      results.push({
        step: 'General Error',
        status: 'error',
        details: `❌ Unexpected error: ${error.message}`
      });
    }

    setDebugResults(results);
    setIsRunning(false);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6>🔍 Stock Location 500 Error Debugger</h6>
        <p className="mb-0">Comprehensive diagnostics to identify the root cause</p>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <button 
            className="btn btn-primary me-2" 
            onClick={runDiagnostics}
            disabled={isRunning}
          >
            {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={clearResults}
            disabled={isRunning}
          >
            Clear Results
          </button>
        </div>

        {debugResults.length > 0 && (
          <div className="debug-results">
            <h6>Diagnostic Results:</h6>
            {debugResults.map((result, index) => (
              <div key={index} className={`alert ${
                result.status === 'success' ? 'alert-success' : 
                result.status === 'error' ? 'alert-danger' : 
                'alert-info'
              }`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{result.step}</strong>
                    <br />
                    <small>{result.details}</small>
                    
                    {result.data && (
                      <div className="mt-2">
                        <strong>Response Data:</strong>
                        <pre style={{ fontSize: '0.8em', marginTop: '5px' }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="mt-2">
                        <strong>Error Details:</strong>
                        <pre style={{ fontSize: '0.8em', marginTop: '5px' }}>
                          {JSON.stringify(result.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                  <span className={`badge ${
                    result.status === 'success' ? 'bg-success' : 
                    result.status === 'error' ? 'bg-danger' : 
                    'bg-info'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="alert alert-warning mt-3">
          <h6>💡 Common 500 Error Causes:</h6>
          <ul className="mb-0">
            <li><strong>Authentication Issues:</strong> Invalid or expired JWT token</li>
            <li><strong>Database Issues:</strong> Connection problems or schema mismatches</li>
            <li><strong>Validation Errors:</strong> Backend validation failing on data structure</li>
            <li><strong>Missing Fields:</strong> Required fields not provided or incorrectly formatted</li>
            <li><strong>Backend Implementation:</strong> Endpoint not properly implemented or configured</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

