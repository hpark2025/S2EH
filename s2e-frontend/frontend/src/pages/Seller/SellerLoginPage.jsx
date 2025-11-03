import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import SellerAuthLayout from '../../layout/SellerAuthLayout.jsx'
import { authAPI } from '../../services/authAPI.js'
import { useAppState } from '../../context/AppContext.jsx'
import { toast } from 'react-hot-toast'
import { cookieAuth } from '../../utils/cookieAuth.js'

export default function SellerLoginPage() {
  const [credentials, setCredentials] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { dispatch, login } = useAppState()

  // 🔹 Redirect to seller dashboard if already logged in as seller
  useEffect(() => {
    // Check cookie-based authentication first
    if (cookieAuth.isSellerAuthenticated()) {
      console.log('✅ Seller already authenticated via cookies, redirecting to dashboard');
      navigate('/seller/dashboard');
      return;
    }
    
    // Fallback to localStorage check for backward compatibility
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    if (isLoggedIn && user.role === 'seller') {
      console.log('✅ Seller already authenticated via localStorage, redirecting to dashboard');
      navigate('/seller/dashboard')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.target)
    const credentials = formData.get('credentials')
    const password = formData.get('password')

    if (!credentials || !password) {
      setError('Please fill in both credentials and password fields.')
      setIsLoading(false)
      return
    }

    try {
      console.log('Attempting seller login with:', { credentials, password })

      // Use MedusaJS seller authentication
      const loginData = {
        email: credentials.includes('@') ? credentials : null,
        phone: !credentials.includes('@') ? credentials : null,
        password: password
      }

      const response = await authAPI.sellerLogin(loginData)

      if (response.token) {
        // Get seller profile from cookies (set by authAPI)
        const auth = cookieAuth.getAuth();
        const sellerUser = auth.user;
        
        // Validate that we have seller data
        if (!sellerUser || !sellerUser.id) {
          throw new Error('Failed to retrieve seller profile')
        }
        
        // Use AppContext login function to store in both localStorage and cookies
        login(sellerUser, response.token, 'seller')

        toast.success('✅ Seller login successful!')
        console.log('🍪 Seller authenticated via cookies, navigating to dashboard');
        navigate('/seller/dashboard', { replace: true })
      } else {
        throw new Error('Login failed - no token received')
      }

    } catch (error) {
      console.error('Seller login error:', error)

      // Handle specific error cases
      let errorMessage = 'Invalid credentials. Please check your email/phone and password.'
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email/phone or password. Please try again.'
      } else if (error.response?.status === 404) {
        errorMessage = 'Seller account not found. Please check your credentials or register for a new account.'
      } else if (error.response?.status === 403) {
        errorMessage = 'Your seller account is not approved yet. Please contact support.'
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (error.message) {
        errorMessage = error.message
      }

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
      })

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = () => {
    console.log('Guest login button clicked');
    
    try {
      // Create mock guest seller user
      const guestUser = {
        id: 'guest',
        email: 'guest@s2eh.com',
        phone: '+63 000 000 0000',
        role: 'seller',
        firstName: 'Guest',
        lastName: 'Seller',
        businessName: 'Guest Business',
        businessType: 'General',
        status: 'approved',
        isActive: true,
        avatar: 'GS',
        isGuest: true
      }

      const guestToken = 'mock-guest-token-' + Date.now()

      // Use AppContext login function to store in both localStorage and cookies
      login(guestUser, guestToken, 'seller')

      toast.success('✅ Guest login successful!')
      console.log('🍪 Guest seller authenticated via cookies, navigating to dashboard');
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Guest login error:', error);
      toast.error('❌ Guest login failed. Please try again.');
    }
  };

  return (
    <SellerAuthLayout title="Seller Login">
      <form
        className="seller-login-form auth-form"
        id="sellerLoginForm"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="seller-login-header mb-4">
          <h3 className="seller-login-title">Welcome to Seller Center</h3>
          <p className="seller-login-subtitle">
            Manage your business and reach more customers
          </p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 rounded-3 mb-3" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="seller-credentials" className="form-label">
            <i className="bi bi-person me-2"></i>
            Email Address or Phone Number
          </label>
          <input
            type="text"
            className={`form-control seller-input ${error ? 'is-invalid' : ''}`}
            id="seller-credentials"
            name="credentials"
            placeholder="Enter Email"
            value={credentials}
            onChange={(e) => {
              setCredentials(e.target.value)
              if (error) setError('') // Clear error when user starts typing
            }}
            required
            disabled={isLoading}
          />
          <div className="form-text">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              You can use either your email address or phone number to login
            </small>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="seller-password" className="form-label">
            <i className="bi bi-lock me-2"></i>
            Password
          </label>
          <input
            type="password"
            className={`form-control seller-input ${error ? 'is-invalid' : ''}`}
            id="seller-password"
            name="password"
            placeholder="Enter Password"
            required
            minLength="8"
            autoComplete="current-password"
            disabled={isLoading}
            onChange={() => {
              if (error) setError('') // Clear error when user starts typing
            }}
          />
        </div>

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-seller-login" disabled={isLoading}>
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in to Seller Center...
              </>
            ) : (
              <>
               
                LOGIN
              </>
            )}
          </button>
        </div>

        <div className="text-center mb-2">
          <NavLink to="/seller/forgot-password" className="seller-link">
            <i className="bi bi-question-circle me-1"></i>
            Forgot your password?
          </NavLink>
        </div>

       

        <hr className="seller-divider my-2" />

        <div className="seller-info-section">
          <div className="text-center">
            <p className="seller-info-text mb-2">
              <i className="bi bi-info-circle me-2"></i>
              New to selling on S2EH?
            </p>
            <NavLink to="/seller/register" className="btn btn-outline-seller">
              <i className="bi bi-shop me-2"></i>
              Create Seller Account
            </NavLink>
          </div>

          <div className="seller-features mt-4">
            <div className="row g-3">
              <div className="col-6">
                <div className="seller-feature">
                  <i className="bi bi-graph-up text-success"></i>
                  <span>Boost Sales</span>
                </div>
              </div>
              <div className="col-6">
                <div className="seller-feature">
                  <i className="bi bi-people text-primary"></i>
                  <span>Reach Customers</span>
                </div>
              </div>
              <div className="col-6">
                <div className="seller-feature">
                  <i className="bi bi-tools text-warning"></i>
                  <span>Easy Management</span>
                </div>
              </div>
              <div className="col-6">
                <div className="seller-feature">
                  <i className="bi bi-shield-check text-info"></i>
                  <span>Secure Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <NavLink to="/" className="seller-back-link">
            <i className="bi bi-arrow-left me-2"></i>
            Back to S2EH Home
          </NavLink>
        </div>
      </form>
    </SellerAuthLayout>
  )
}
