import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/authAPI.js';
import { useAppState } from '../../context/AppContext.jsx';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { dispatch, login } = useAppState();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting admin login with:', formData);

      // Call the backend API for admin login
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        user_type: 'admin'
      });

      if (response.success && response.data) {
        const { user, token } = response.data;

        // Use AppContext login function to store in both localStorage and cookies
        login(user, token, 'admin');

        toast.success('✅ Admin login successful!');
        navigate('/admin/dashboard', { replace: true });

      } else {
        throw new Error('Invalid email or password.');
      }

    } catch (error) {
      console.error('Admin login error:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials. Please check your email and password.';

      toast.error(`❌ Login Failed\n\n${errorMessage}`, {
        duration: 5000,
        style: {
          background: '#fee',
          border: '1px solid #f66',
          color: '#d33',
          fontSize: '14px',
          lineHeight: '1.4',
          whiteSpace: 'pre-line',
          maxWidth: '350px'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="card admin-login-card">
          {/* Admin Logo/Header */}
          <div className="admin-logo">
            <i className="fas fa-shield-alt"></i>
          </div>

          <h1 className="admin-title text-center">Admin Portal</h1>
          <p className="admin-subtitle text-center">Sign in to access admin dashboard</p>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <i className="fas fa-envelope me-2"></i>Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter admin email"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-lock me-2"></i>Password
              </label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="sign-in-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="footer-text">
            <i className="fas fa-shield-alt me-1"></i>
            Authorized personnel only
          </div>

          <Link to="/" className="back-to-home">
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
