import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { accountAPI } from '../services/accountAPI';

export default function AccountRegistration() {
  const [accountType, setAccountType] = useState('customer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Customer form data
  const [customerForm, setCustomerForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: ''
  });

  // Seller form data
  const [sellerForm, setSellerForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    business_name: '',
    business_type: ''
  });

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    
    if (customerForm.password !== customerForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const { confirm_password, ...customerData } = customerForm;
      await accountAPI.createAccount.createCustomer(customerData);
      
      toast.success('Customer account created successfully!');
      navigate('/auth/home');
    } catch (error) {
      console.error('Customer registration failed:', error);
      toast.error('Failed to create customer account');
    } finally {
      setLoading(false);
    }
  };

  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    
    if (sellerForm.password !== sellerForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const { confirm_password, ...sellerData } = sellerForm;
      await accountAPI.createAccount.createSeller(sellerData);
      
      toast.success('Seller account created successfully!');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Seller registration failed:', error);
      toast.error('Failed to create seller account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-registration">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4>Create Account</h4>
              <p className="mb-0">Choose your account type and fill in the required information</p>
            </div>
            <div className="card-body">
              {/* Account Type Selection */}
              <div className="mb-4">
                <label className="form-label">Account Type</label>
                <div className="row">
                  <div className="col-md-4">
                    <div className={`card ${accountType === 'customer' ? 'border-primary' : ''}`}>
                      <div className="card-body text-center">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="accountType"
                          value="customer"
                          checked={accountType === 'customer'}
                          onChange={(e) => setAccountType(e.target.value)}
                        />
                        <h6 className="mt-2">Customer</h6>
                        <p className="text-muted small">Buy products and services</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={`card ${accountType === 'seller' ? 'border-primary' : ''}`}>
                      <div className="card-body text-center">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="accountType"
                          value="seller"
                          checked={accountType === 'seller'}
                          onChange={(e) => setAccountType(e.target.value)}
                        />
                        <h6 className="mt-2">Seller</h6>
                        <p className="text-muted small">Sell products and services</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Registration Form */}
              {accountType === 'customer' && (
                <form onSubmit={handleCustomerSubmit}>
                  <h5>Customer Registration</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={customerForm.first_name}
                        onChange={(e) => setCustomerForm({...customerForm, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={customerForm.last_name}
                        onChange={(e) => setCustomerForm({...customerForm, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={customerForm.password}
                        onChange={(e) => setCustomerForm({...customerForm, password: e.target.value})}
                        required
                        minLength="6"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={customerForm.confirm_password}
                        onChange={(e) => setCustomerForm({...customerForm, confirm_password: e.target.value})}
                        required
                        minLength="6"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Customer Account'}
                  </button>
                </form>
              )}

              {/* Seller Registration Form */}
              {accountType === 'seller' && (
                <form onSubmit={handleSellerSubmit}>
                  <h5>Seller Registration</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={sellerForm.first_name}
                        onChange={(e) => setSellerForm({...sellerForm, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={sellerForm.last_name}
                        onChange={(e) => setSellerForm({...sellerForm, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={sellerForm.email}
                        onChange={(e) => setSellerForm({...sellerForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={sellerForm.phone}
                        onChange={(e) => setSellerForm({...sellerForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Business Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={sellerForm.business_name}
                        onChange={(e) => setSellerForm({...sellerForm, business_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Business Type *</label>
                      <select
                        className="form-control"
                        value={sellerForm.business_type}
                        onChange={(e) => setSellerForm({...sellerForm, business_type: e.target.value})}
                        required
                      >
                        <option value="">Select Business Type</option>
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="service">Service</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={sellerForm.password}
                        onChange={(e) => setSellerForm({...sellerForm, password: e.target.value})}
                        required
                        minLength="6"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={sellerForm.confirm_password}
                        onChange={(e) => setSellerForm({...sellerForm, confirm_password: e.target.value})}
                        required
                        minLength="6"
                      />
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <h6>Seller Account Information</h6>
                    <p className="mb-0">
                      Your seller account will be reviewed before activation. 
                      You'll receive an email notification once your account is approved.
                    </p>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Seller Account'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

