import { NavLink, Outlet } from 'react-router-dom'
import { useAppState } from '../context/AppContext.jsx'
import { useCustomerAutoLogout } from '../hooks/useAutoLogout.js'
import { useCart } from '../hooks/useCart.js'
import { useUnreadMessages } from '../hooks/useUnreadMessages.js'
import { cookieAuth } from '../utils/cookieAuth.js'

function Header() {
  const { state, logout: contextLogout } = useAppState()
  const { isLoggedIn } = state
  const { cartCount } = useCart()
  const { unreadCount } = useUnreadMessages()
  const { logout } = useCustomerAutoLogout(() => {
    console.log('Customer auto-logout triggered')
  })

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('token')
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('cart') // Clear cart on logout
    
    // Clear cookies
    cookieAuth.clearAuth()
    
    // Clear cookies manually (backup)
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'userType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Update app context
    contextLogout()
    
    // Redirect to home page
    window.location.href = '/home'
  }

  return (
    <header className="header-wrapper">
      <div className="header-with-search-wrapper">
        <div className="logo-wrapper">
          <NavLink 
            to={isLoggedIn ? "/auth/home" : "/home"} 
            aria-label="Home"
          >
            <img src="/logos/s2eh.png" alt="Logo" />
          </NavLink>
        </div>
        <div className="search-wrapper">
          <input type="text" className="search-input" placeholder="Search..." />
          <button className="search-button">
            <i className="bi bi-search"></i>
          </button>
        </div>
        <div className="cart-account-wrapper">
          {isLoggedIn ? (
            // Show cart and account for logged in users
            <>
              <NavLink to="/auth/chat" className="chat-wrapper" aria-label="Chat">
                <i className="bi bi-chat-dots cart-icon"></i>
                {unreadCount > 0 && (
                  <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">{unreadCount}</span>
                )}
              </NavLink>
              <NavLink to="/user/cart" className="basket-wrapper" aria-label="Basket">
                <i className="bi bi-basket cart-icon"></i>
                {cartCount > 0 && (
                  <span className="basket-badge">{cartCount}</span>
                )}
              </NavLink>
              <NavLink to="/auth/account/profile" className="account-wrapper" aria-label="Account">
                <i className="bi bi-person-fill"></i>
              </NavLink>
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm ms-2">
                Logout
              </button>
            </>
          ) : (
            // Show login/signup for non-logged in users
            <div className="d-flex align-items-center gap-2 auth-buttons">
              <NavLink to="/login" className="btn btn-outline-primary btn-sm">
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn-sm" style={{ backgroundColor: 'var(--highlight-color)', borderColor: 'var(--highlight-color)', color: 'white' }}>
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function UserLayout() {
  return (
    <div className="site-root">
      <Header />
      <Outlet />
    </div>
  )
}


