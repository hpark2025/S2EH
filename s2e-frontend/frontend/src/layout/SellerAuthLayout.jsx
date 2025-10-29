import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import UserFooter from '../components/partials/UserFooter.jsx'

export default function SellerAuthLayout({ title, children }) {
  return (
    <div className="seller-auth-page" style={{ margin: 0, padding: 0 }}>
      {/* Seller-specific top navigation */}
      <div className="seller-navbar">
        <div className="seller-navbar-content">
          <div className="seller-navbar-left">
            <NavLink to="/">S2EH Marketplace</NavLink>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Seller Support</a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <i className="bi bi-book me-1"></i>Seller Guide
            </a>
          </div>
          <div className="seller-navbar-right">
            <a href="#" onClick={(e) => e.preventDefault()}>
              <i className="bi bi-headset me-1"></i>Help Center
            </a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <i className="bi bi-telephone me-1"></i>Contact Support
            </a>
            <span className="divider">|</span>
            {title === 'Seller Login' ? (
              <NavLink to="/seller/register">Create Account</NavLink>
            ) : (
              <NavLink to="/seller/login">Login</NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Seller-specific header */}
      <header className="seller-login-header">
        <div className="seller-login-header-inner">
          <NavLink to="/seller/login" className="seller-login-header-logo-container">
            <img src="/logos/s2eh.png" alt="S2EH Logo" className="seller-login-header-logo" />
            <div className="seller-branding">
              <span className="seller-main-title">S2EH Seller Center</span>
              <span className="seller-subtitle">Grow Your Business</span>
            </div>
          </NavLink>
          <span className="seller-page-title">{title}</span>
        </div>
      </header>

      {/* Main content area */}
      <main className="seller-login-main-bg">
        {title === 'Become a Seller' ? (
          // Full width layout for registration
          <div className="seller-register-wrapper">
            <div className="seller-register-form-container">
              {children}
            </div>
          </div>
        ) : (
          // Two-column layout for login and other pages
          <div className="seller-login-card-wrapper">
            {/* Left side - Seller benefits showcase */}
            <div className="seller-login-left">
              <div className="seller-benefits-showcase">
                <div className="seller-benefit-slide active">
                  <div className="seller-benefit-content">
                    <img 
                      src="/images/fresh produce.jpg" 
                      className="seller-benefit-image" 
                      alt="Sell Fresh Products" 
                    />
                    <div className="seller-benefit-text">
                      <h4>Sell Your Fresh Products</h4>
                      <p>Connect directly with customers who value fresh, local produce from Sagnay</p>
                    </div>
                  </div>
                </div>

                <div className="seller-benefit-features">
                  <div className="seller-feature-grid">
                    <div className="seller-feature-item">
                      <i className="bi bi-graph-up-arrow"></i>
                      <span>Increase Revenue</span>
                    </div>
                    <div className="seller-feature-item">
                      <i className="bi bi-geo-alt"></i>
                      <span>Local Market Focus</span>
                    </div>
                    <div className="seller-feature-item">
                      <i className="bi bi-shield-check"></i>
                      <span>Secure Transactions</span>
                    </div>
                    <div className="seller-feature-item">
                      <i className="bi bi-people"></i>
                      <span>Customer Support</span>
                    </div>
                  </div>
                </div>

                <div className="seller-stats">
                  <div className="seller-stat">
                    <div className="seller-stat-number">500+</div>
                    <div className="seller-stat-label">Active Sellers</div>
                  </div>
                  <div className="seller-stat">
                    <div className="seller-stat-number">1000+</div>
                    <div className="seller-stat-label">Happy Customers</div>
                  </div>
                  <div className="seller-stat">
                    <div className="seller-stat-number">24/7</div>
                    <div className="seller-stat-label">Support Available</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="seller-login-right">
              <div className="seller-login-form-container">
                {children}
              </div>
            </div>
          </div>
        )}
      </main>

      <UserFooter />
    </div>
  )
}

SellerAuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}