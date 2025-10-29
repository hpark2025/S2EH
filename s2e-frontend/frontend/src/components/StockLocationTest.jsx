import React, { useState, useEffect } from 'react';
import { sellerAPI } from '../services/sellerAPI';
import { cookieAuth } from '../utils/cookieAuth';

export default function StockLocationTest() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results = [];
    
    try {
      // Test 1: Check authentication
      results.push({
        test: 'Authentication Check',
        status: cookieAuth.isSellerAuthenticated() ? 'PASS' : 'FAIL',
        details: cookieAuth.isSellerAuthenticated() 
          ? 'Seller is properly authenticated' 
          : 'Seller authentication failed'
      });

      // Test 2: Fetch stock locations
      try {
        const response = await sellerAPI.stockLocations.getStockLocations();
        results.push({
          test: 'GET /seller/stock-locations',
          status: 'PASS',
          details: `Found ${response.stock_locations?.length || 0} stock locations`,
          data: response
        });
      } catch (error) {
        results.push({
          test: 'GET /seller/stock-locations',
          status: 'FAIL',
          details: `Error: ${error.message}`,
          error: error.response?.data
        });
      }

      // Test 3: Create a test stock location
      try {
        const testLocation = {
          name: `Test Location ${Date.now()}`,
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
        };

        const createResponse = await sellerAPI.stockLocations.createStockLocation(testLocation);
        results.push({
          test: 'POST /seller/stock-locations',
          status: 'PASS',
          details: 'Successfully created test stock location',
          data: createResponse
        });

        // Test 4: Get the created location
        if (createResponse.stock_location?.id) {
          try {
            const getResponse = await sellerAPI.stockLocations.getStockLocation(createResponse.stock_location.id);
            results.push({
              test: `GET /seller/stock-locations/${createResponse.stock_location.id}`,
              status: 'PASS',
              details: 'Successfully retrieved created stock location',
              data: getResponse
            });

            // Test 5: Update the location
            try {
              const updateData = {
                name: `Updated Test Location ${Date.now()}`,
                address: {
                  ...testLocation.address,
                  address_1: '456 Updated Street'
                }
              };

              const updateResponse = await sellerAPI.stockLocations.updateStockLocation(
                createResponse.stock_location.id, 
                updateData
              );
              results.push({
                test: `PUT /seller/stock-locations/${createResponse.stock_location.id}`,
                status: 'PASS',
                details: 'Successfully updated stock location',
                data: updateResponse
              });

              // Test 6: Delete the test location
              try {
                await sellerAPI.stockLocations.deleteStockLocation(createResponse.stock_location.id);
                results.push({
                  test: `DELETE /seller/stock-locations/${createResponse.stock_location.id}`,
                  status: 'PASS',
                  details: 'Successfully deleted test stock location'
                });
              } catch (deleteError) {
                results.push({
                  test: `DELETE /seller/stock-locations/${createResponse.stock_location.id}`,
                  status: 'FAIL',
                  details: `Delete failed: ${deleteError.message}`,
                  error: deleteError.response?.data
                });
              }
            } catch (updateError) {
              results.push({
                test: `PUT /seller/stock-locations/${createResponse.stock_location.id}`,
                status: 'FAIL',
                details: `Update failed: ${updateError.message}`,
                error: updateError.response?.data
              });
            }
          } catch (getError) {
            results.push({
              test: `GET /seller/stock-locations/${createResponse.stock_location.id}`,
              status: 'FAIL',
              details: `Get failed: ${getError.message}`,
              error: getError.response?.data
            });
          }
        }
      } catch (createError) {
        results.push({
          test: 'POST /seller/stock-locations',
          status: 'FAIL',
          details: `Create failed: ${createError.message}`,
          error: createError.response?.data
        });
      }

    } catch (error) {
      results.push({
        test: 'General Error',
        status: 'FAIL',
        details: `Unexpected error: ${error.message}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>🧪 Stock Locations API Test</h5>
        <p className="mb-0">Testing seller-scoped stock locations endpoints</p>
      </div>
      <div className="card-body">
        <button 
          className="btn btn-primary mb-3" 
          onClick={runTests}
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>

        {testResults.length > 0 && (
          <div className="test-results">
            <h6>Test Results:</h6>
            {testResults.map((result, index) => (
              <div key={index} className={`alert ${result.status === 'PASS' ? 'alert-success' : 'alert-danger'}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{result.test}</strong>
                    <br />
                    <small>{result.details}</small>
                    {result.error && (
                      <pre className="mt-2 mb-0" style={{ fontSize: '0.8em' }}>
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    )}
                  </div>
                  <span className={`badge ${result.status === 'PASS' ? 'bg-success' : 'bg-danger'}`}>
                    {result.status}
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

