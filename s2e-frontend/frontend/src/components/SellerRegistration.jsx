import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { sellerAccountAPI } from '../services/sellerAccountAPI';

export default function SellerRegistration() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Seller form data
  const [sellerForm, setSellerForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    business_name: '',
    business_type: '',
    business_address: {
      address_1: '',
      address_2: '',
      city: '',
      province: '',
      postal_code: '',
      country_code: 'ph'
    }
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!sellerForm.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!sellerForm.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!sellerForm.email.trim()) newErrors.email = 'Email is required';
    if (!sellerForm.password) newErrors.password = 'Password is required';
    if (!sellerForm.business_name.trim()) newErrors.business_name = 'Business name is required';
    if (!sellerForm.business_type) newErrors.business_type = 'Business type is required';

    // Email validation
    if (sellerForm.email && !/\S+@\S+\.\S+/.test(sellerForm.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (sellerForm.password && sellerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (sellerForm.password !== sellerForm.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Business address validation
    if (!sellerForm.business_address.address_1.trim()) {
      newErrors.business_address = 'Business address is required';
    }
    if (!sellerForm.business_address.city.trim()) {
      newErrors.business_address = 'City is required';
    }
    if (!sellerForm.business_address.province.trim()) {
      newErrors.business_address = 'Province is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      setLoading(true);
      const { confirm_password, ...sellerData } = sellerForm;
      await sellerAccountAPI.createSellerAccount(sellerData);
      
      toast.success('Seller account created successfully! Your account is pending approval.');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Seller registration failed:', error);
      toast.error('Failed to create seller account');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSellerForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setSellerForm(prev => ({
      ...prev,
      business_address: {
        ...prev.business_address,
        [field]: value
      }
    }));
    
    // Clear address error when user starts typing
    if (errors.business_address) {
      setErrors(prev => ({
        ...prev,
        business_address: ''
      }));
    }
  };

  return (
    <div className="seller-registration">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4>Become a Seller</h4>
              <p className="mb-0">Join our marketplace and start selling your products</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="mb-4">
                  <h5>Personal Information</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        value={sellerForm.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        required
                      />
                      {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        value={sellerForm.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        required
                      />
                      {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={sellerForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={sellerForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        value={sellerForm.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        minLength="6"
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password *</label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                        value={sellerForm.confirm_password}
                        onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                        required
                        minLength="6"
                      />
                      {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="mb-4">
                  <h5>Business Information</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Business Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.business_name ? 'is-invalid' : ''}`}
                        value={sellerForm.business_name}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        required
                      />
                      {errors.business_name && <div className="invalid-feedback">{errors.business_name}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Business Type *</label>
                      <select
                        className={`form-control ${errors.business_type ? 'is-invalid' : ''}`}
                        value={sellerForm.business_type}
                        onChange={(e) => handleInputChange('business_type', e.target.value)}
                        required
                      >
                        <option value="">Select Business Type</option>
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="service">Service</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="fisheries">Fisheries</option>
                        <option value="livestock">Livestock</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.business_type && <div className="invalid-feedback">{errors.business_type}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Business Address *</label>
                    <input
                      type="text"
                      className={`form-control mb-2 ${errors.business_address ? 'is-invalid' : ''}`}
                      placeholder="Address Line 1"
                      value={sellerForm.business_address.address_1}
                      onChange={(e) => handleAddressChange('address_1', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Address Line 2"
                      value={sellerForm.business_address.address_2}
                      onChange={(e) => handleAddressChange('address_2', e.target.value)}
                    />
                    <div className="row">
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="City"
                          value={sellerForm.business_address.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Province"
                          value={sellerForm.business_address.province}
                          onChange={(e) => handleAddressChange('province', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Postal Code"
                          value={sellerForm.business_address.postal_code}
                          onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                        />
                      </div>
                    </div>
                    {errors.business_address && <div className="invalid-feedback">{errors.business_address}</div>}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-4">
                  <div className="alert alert-info">
                    <h6>Seller Account Information</h6>
                    <ul className="mb-0">
                      <li>Your seller account will be reviewed before activation</li>
                      <li>You'll receive an email notification once your account is approved</li>
                      <li>You can start adding products after approval</li>
                      <li>All business information must be accurate and up-to-date</li>
                    </ul>
                  </div>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Seller Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

