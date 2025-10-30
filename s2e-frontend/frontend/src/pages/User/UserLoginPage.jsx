import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import UserAuthBasicLayout from '../../layout/UserAuthBasicLayout.jsx'
import { useAppState } from '../../context/AppContext.jsx'
import { authAPI } from '../../services/authAPI'

export default function UserLoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { dispatch, login } = useAppState()

  // Redirect to authenticated area if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (isLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userRole = user.role
      
      if (userRole === 'admin') {
        navigate('/admin/dashboard')
      } else if (userRole === 'seller') {
        navigate('/seller/dashboard')
      } else {
        navigate('/auth/home')
      }
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')

    if (!email || !password) {
      setError('Please fill in both email and password fields')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔍 Attempting customer login with:', { email, password })
      
      // Use MedusaJS customer authentication
      const loginData = {
        email: email,
        password: password
      }

      const response = await authAPI.customerLogin(loginData)

      console.log('🔍 Full login response:', response)

      // Check if login was successful
      if (!response.success && response.message) {
        // Backend returned an error message
        throw new Error(response.message)
      }

      // PHP backend returns: { success, message, data: { user, token, expires_at, user_type } }
      if (response.data?.token || response.token || response.access_token) {
        const token = response.data?.token || response.token || response.access_token;
        
        // Get customer profile from localStorage (set by authAPI)
        const userData = localStorage.getItem('user');
        console.log('🔍 Raw user data from localStorage:', userData);
        
        let customerUser;
        
        if (!userData || userData === 'undefined' || userData === 'null') {
          console.warn('🔍 No user data in localStorage, creating basic customer profile');
          // Create a basic customer profile from login data
          customerUser = {
            id: 'temp_' + Date.now(),
            email: loginData.email,
            first_name: 'Customer',
            last_name: 'User',
            has_account: true
          };
          localStorage.setItem('user', JSON.stringify(customerUser));
        } else {
          try {
            customerUser = JSON.parse(userData);
            console.log('🔍 Parsed customer user:', customerUser);
          } catch (parseError) {
            console.error('🔍 Failed to parse user data:', parseError);
            // Create a basic customer profile as fallback
            customerUser = {
              id: 'temp_' + Date.now(),
              email: loginData.email,
              first_name: 'Customer',
              last_name: 'User',
              has_account: true
            };
            localStorage.setItem('user', JSON.stringify(customerUser));
          }
        }
        
        // Validate that we have customer data
        if (!customerUser || !customerUser.id) {
          throw new Error('Failed to retrieve customer profile - invalid data');
        }
        
        // Use AppContext login function to store in both localStorage and cookies
        login(customerUser, token, 'customer')

        toast.success('✅ Customer login successful!')
        console.log('🍪 Customer authenticated, navigating to home');
        navigate('/auth/home', { replace: true })
      } else {
        throw new Error('Login failed - no token received')
      }

    } catch (error) {
      console.error('Customer login error:', error)
      
      // Check if it's a seller trying to log in
      const errorMessage = error.response?.data?.message || error.message
      
      if (errorMessage.includes('seller')) {
        setError('⚠️ This email is registered as a seller. Please use the seller login page at /seller/login')
      } else if (errorMessage.includes('pending approval')) {
        setError('⏳ Your account is pending admin approval. Please wait for verification.')
      } else if (errorMessage.includes('Invalid email or password')) {
        setError('❌ Invalid email or password. Please check your credentials.')
      } else {
        setError(`❌ Login failed: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UserAuthBasicLayout title="Login">
      <form className="login-form auth-form" id="loginForm" noValidate onSubmit={handleSubmit}>
        <h3>Log in to your account</h3>

        {error && (
          <div className="alert alert-warning border-0 rounded-3 mb-3" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-circle me-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="login-email" className="form-label">
            Email Address
          </label>
          <input 
            type="email" 
            className="form-control" 
            id="login-email" 
            name="email" 
            placeholder="example@email.com" 
            defaultValue={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <input 
            type="password" 
            className="form-control" 
            id="login-password" 
            name="password" 
            placeholder="Enter your password" 
            required 
            minLength="8"
            autoComplete="current-password"
          />
        </div>

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-login" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              'LOG IN'
            )}
          </button>
        </div>

        <div className="text-end mb-3">
          <NavLink to="/reset" className="highlight-link">
            Forgot password?
          </NavLink>
        </div>

        <hr />

        <div className="text-center mt-4">
          <p className="mb-0">
            New to S2EH? <NavLink to="/register" className="highlight-link">Sign Up</NavLink>
          </p>
        </div>
      </form>
    </UserAuthBasicLayout>
  )
}