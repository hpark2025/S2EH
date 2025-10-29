import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import UserFooter from '../components/partials/UserFooter.jsx'

export default function UserAuthBasicLayout({ title, children }) {
  return (
    <div className="auth-page" style={{ margin: 0, padding: 0 }}>
      <div className="shopee-navbar" style={{ marginTop: 0, paddingTop: '8px' }}>
        <div className="shopee-navbar-content">
          <div className="shopee-navbar-left">
            <NavLink to="/seller">Seller Center</NavLink>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Download App</a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <i className="bi bi-facebook me-1"></i>Follow us on Facebook
            </a>
          </div>
          <div className="shopee-navbar-right">
            <a href="#" onClick={(e) => e.preventDefault()}>
              <i className="bi bi-bell me-1"></i>Notifications
            </a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <i className="bi bi-question-circle me-1"></i>Help
            </a>
            <span className="divider">|</span>
            {title === 'Login' ? (
              <NavLink to="/register">Sign Up</NavLink>
            ) : title === 'Sign Up' ? (
              <NavLink to="/login">Login</NavLink>
            ) : (
              <NavLink to="/login">Login</NavLink>
            )}
          </div>
        </div>
      </div>

      <header className="login-header">
        <div className="login-header-inner">
          <div className="login-header-logo-container" onClick={(e) => e.preventDefault()} style={{ cursor: 'default' }}>
            <img src="/logos/s2eh.png" alt="S2EH Logo" className="login-header-logo" />
          </div>
          <span className="login-header-title">From Sagnay to Every Home</span>
          <span className="ms-auto fw-bold">{title}</span>
        </div>
      </header>

      <main className="login-main-bg">
        <div className="login-card-wrapper">
          <div className="login-left">
            <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-indicators">
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
                <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="3" aria-label="Slide 4"></button>
              </div>
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img src="/images/sagnay-tourism.jpg" className="d-block w-100" alt="Fresh Agricultural Products" />
                </div>
                <div className="carousel-item">
                  <img src="/images/fish-farming.jpg" className="d-block w-100" alt="Traditional Fish Farming" />
                </div>
                <div className="carousel-item">
                  <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80" className="d-block w-100" alt="Local Delicacies" />
                </div>
                <div className="carousel-item">
                  <img src="/images/fishes.jpg" className="d-block w-100" alt="Fresh Fish" />
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

          <div className="login-right">
            <div className="login-form-container">{children}</div>
          </div>
        </div>
      </main>

      <UserFooter />
    </div>
  )
}

UserAuthBasicLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

