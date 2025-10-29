import React from 'react';
import SellerAccountManagement from '../../components/SellerAccountManagement';

export default function SellerAccountPage() {
  return (
    <div className="seller-account-page">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Account Management</h2>
              <div className="text-muted">
                Manage your seller account information and settings
              </div>
            </div>
            
            <SellerAccountManagement />
          </div>
        </div>
      </div>
    </div>
  );
}

