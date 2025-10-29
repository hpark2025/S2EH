import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAccountAPI } from '../services/sellerAccountAPI';
import { cookieAuth } from '../utils/cookieAuth';

export default function SellerAccountManagement() {
  const [currentTab, setCurrentTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [auth, setAuth] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
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

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [deactivationForm, setDeactivationForm] = useState({
    reason: '',
    confirm: false
  });

  useEffect(() => {
    loadSellerProfile();
  }, []);

  const loadSellerProfile = async () => {
    try {
      setLoading(true);
      const authData = cookieAuth.getAuth();
      setAuth(authData);

      if (authData.isLoggedIn && authData.userType === 'seller') {
        const profileData = await sellerAccountAPI.getSellerProfile();
        setProfile(profileData);
        setProfileForm({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          business_name: profileData.business_name || '',
          business_type: profileData.business_type || '',
          business_address: profileData.business_address || {
            address_1: '',
            address_2: '',
            city: '',
            province: '',
            postal_code: '',
            country_code: 'ph'
          }
        });
      }
    } catch (error) {
      console.error('Failed to load seller profile:', error);
      toast.error('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await sellerAccountAPI.updateSellerProfile(profileForm);
      toast.success('Profile updated successfully!');
      await loadSellerProfile(); // Reload profile
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      if (passwordForm.new_password !== passwordForm.confirm_password) {
        toast.error('New passwords do not match');
        return;
      }

      setLoading(true);
      await sellerAccountAPI.changeSellerPassword(
        passwordForm.current_password,
        passwordForm.new_password
      );
      toast.success('Password changed successfully!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async (e) => {
    e.preventDefault();
    try {
      if (!deactivationForm.confirm) {
        toast.error('Please confirm account deactivation');
        return;
      }

      setLoading(true);
      await sellerAccountAPI.deactivateSellerAccount(deactivationForm.reason);
      toast.success('Account deactivated successfully');
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/seller/login';
      }, 2000);
    } catch (error) {
      console.error('Failed to deactivate account:', error);
      toast.error('Failed to deactivate account');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!auth?.isLoggedIn || auth?.userType !== 'seller') {
    return (
      <div className="alert alert-warning">
        <h5>Seller Authentication Required</h5>
        <p>Please log in as a seller to manage your account.</p>
      </div>
    );
  }

  return (
    <div className="seller-account-management">
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h6>Seller Account</h6>
            </div>
            <div className="card-body p-0">
              <nav className="nav nav-pills flex-column">
                <button
                  className={`nav-link ${currentTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('profile')}
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
                </button>
                <button
                  className={`nav-link ${currentTab === 'business' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('business')}
                >
                  <i className="bi bi-building me-2"></i>
                  Business Info
                </button>
                <button
                  className={`nav-link ${currentTab === 'security' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('security')}
                >
                  <i className="bi bi-shield-lock me-2"></i>
                  Security
                </button>
                <button
                  className={`nav-link ${currentTab === 'status' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('status')}
                >
                  <i className="bi bi-info-circle me-2"></i>
                  Account Status
                </button>
                <button
                  className={`nav-link ${currentTab === 'danger' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('danger')}
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Danger Zone
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <h5>
                {currentTab === 'profile' && 'Personal Information'}
                {currentTab === 'business' && 'Business Information'}
                {currentTab === 'security' && 'Security Settings'}
                {currentTab === 'status' && 'Account Status'}
                {currentTab === 'danger' && 'Danger Zone'}
              </h5>
            </div>
            <div className="card-body">
              {/* Profile Tab */}
              {currentTab === 'profile' && (
                <div>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profileForm.first_name}
                          onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profileForm.last_name}
                          onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </form>
                </div>
              )}

              {/* Business Tab */}
              {currentTab === 'business' && (
                <div>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Business Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={profileForm.business_name}
                          onChange={(e) => setProfileForm({...profileForm, business_name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Business Type</label>
                        <select
                          className="form-control"
                          value={profileForm.business_type}
                          onChange={(e) => setProfileForm({...profileForm, business_type: e.target.value})}
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
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Business Address</label>
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Address Line 1"
                        value={profileForm.business_address.address_1}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          business_address: {...profileForm.business_address, address_1: e.target.value}
                        })}
                        required
                      />
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Address Line 2"
                        value={profileForm.business_address.address_2}
                        onChange={(e) => setProfileForm({
                          ...profileForm,
                          business_address: {...profileForm.business_address, address_2: e.target.value}
                        })}
                      />
                      <div className="row">
                        <div className="col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="City"
                            value={profileForm.business_address.city}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              business_address: {...profileForm.business_address, city: e.target.value}
                            })}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Province"
                            value={profileForm.business_address.province}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              business_address: {...profileForm.business_address, province: e.target.value}
                            })}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Postal Code"
                            value={profileForm.business_address.postal_code}
                            onChange={(e) => setProfileForm({
                              ...profileForm,
                              business_address: {...profileForm.business_address, postal_code: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Business Info'}
                    </button>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {currentTab === 'security' && (
                <div>
                  <form onSubmit={handleChangePassword}>
                    <div className="mb-3">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                        required
                        minLength="6"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                        required
                        minLength="6"
                      />
                    </div>
                    <button type="submit" className="btn btn-warning" disabled={loading}>
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Status Tab */}
              {currentTab === 'status' && (
                <div>
                  <div className="alert alert-info">
                    <h6>Account Status</h6>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${
                        profile?.status === 'active' ? 'bg-success' :
                        profile?.status === 'pending' ? 'bg-warning' :
                        profile?.status === 'inactive' ? 'bg-danger' :
                        'bg-secondary'
                      }`}>
                        {profile?.status || 'Unknown'}
                      </span>
                    </p>
                    <p><strong>Member Since:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
                    {profile?.verified_at && (
                      <p><strong>Verified:</strong> {new Date(profile.verified_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  
                  {profile?.status === 'pending' && (
                    <div className="alert alert-warning">
                      <h6>Account Pending Approval</h6>
                      <p>Your seller account is currently under review. You'll receive an email notification once it's approved.</p>
                    </div>
                  )}

                  {profile?.status === 'inactive' && (
                    <div className="alert alert-danger">
                      <h6>Account Inactive</h6>
                      <p>Your seller account has been deactivated. Please contact support for assistance.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Danger Zone Tab */}
              {currentTab === 'danger' && (
                <div>
                  <div className="alert alert-danger">
                    <h6>Deactivate Seller Account</h6>
                    <p>Deactivating your seller account will make it inaccessible but preserve your data and products.</p>
                  </div>

                  <form onSubmit={handleDeactivateAccount}>
                    <div className="mb-3">
                      <label className="form-label">Reason for Deactivation</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={deactivationForm.reason}
                        onChange={(e) => setDeactivationForm({...deactivationForm, reason: e.target.value})}
                        placeholder="Please tell us why you're deactivating your seller account..."
                      />
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="confirmDeactivation"
                          checked={deactivationForm.confirm}
                          onChange={(e) => setDeactivationForm({...deactivationForm, confirm: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="confirmDeactivation">
                          I understand that deactivating my seller account will make it inaccessible
                        </label>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-danger" 
                      disabled={loading || !deactivationForm.confirm}
                    >
                      {loading ? 'Deactivating...' : 'Deactivate Seller Account'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

