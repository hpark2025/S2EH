import React from 'react';

export default function StockLocationAPIInfo() {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h6>📋 Stock Locations API - Seller Scoped</h6>
      </div>
      <div className="card-body">
        <p className="mb-2">
          <strong>✅ Security Implementation:</strong> All stock location endpoints are seller-scoped, meaning sellers can only access their own locations.
        </p>
        
        <div className="row">
          <div className="col-md-6">
            <h6>🔒 Protected Endpoints:</h6>
            <ul className="list-unstyled">
              <li><code>GET /seller/stock-locations</code> - Only returns seller's own locations</li>
              <li><code>GET /seller/stock-locations/&#123;id&#125;</code> - Only returns if it belongs to seller</li>
              <li><code>POST /seller/stock-locations</code> - Creates location for authenticated seller</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>🛡️ Security Features:</h6>
            <ul className="list-unstyled">
              <li><code>PUT /seller/stock-locations/&#123;id&#125;</code> - Only updates seller's own locations</li>
              <li><code>DELETE /seller/stock-locations/&#123;id&#125;</code> - Only deletes seller's own locations</li>
              <li>🔐 JWT token authentication required</li>
              <li>🍪 Cookie-based session management</li>
            </ul>
          </div>
        </div>
        
        <div className="alert alert-success mt-3 mb-0">
          <strong>✅ Benefits:</strong> Each seller can only see and manage their own stock locations, ensuring data privacy and security.
        </div>
      </div>
    </div>
  );
}
