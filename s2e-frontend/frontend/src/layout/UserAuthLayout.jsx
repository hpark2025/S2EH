import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../context/AppContext.jsx'
import { useCart } from '../hooks/useCart.js'
import { useUnreadMessages } from '../hooks/useUnreadMessages.js'
import { cookieAuth } from '../utils/cookieAuth.js'

function Header() {
  const { dispatch, logout, state } = useAppState()
  const { cartCount } = useCart()
  const { unreadCount } = useUnreadMessages()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState(state.searchTerm || '')

  // Sync search term with global state when user types
  useEffect(() => {
    if (dispatch) {
      dispatch({ type: 'SET_SEARCH_TERM', payload: searchTerm })
    }
  }, [searchTerm, dispatch])

  // Load search term from global state on mount (only once)
  useEffect(() => {
    if (state.searchTerm && searchTerm === '') {
      setSearchTerm(state.searchTerm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    // useEffect will sync to global state
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    // Navigate to products page with search if not on home page
    if (location.pathname !== '/auth/home' && location.pathname !== '/home') {
      window.location.href = `/auth/products?search=${encodeURIComponent(searchTerm)}`
    }
  }

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
    logout()
    
    // Redirect to home page after logout
    window.location.href = '/home'
  }

  return (
    <header className="header-wrapper">
      <div className="header-with-search-wrapper">
        <div className="logo-wrapper">
          <NavLink to="/auth/home" aria-label="Home">
            <img src="/logos/s2eh.png" alt="Logo" />
          </NavLink>
        </div>
        <div className="search-wrapper">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%' }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="submit" className="search-button">
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
        <div className="cart-account-wrapper">
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
        </div>
      </div>
    </header>
  )
}

export default function UserAuthLayout() {
  return (
    <div className="site-root">
      <Header />
      <div style={{ height: 72 }}></div>
      <Outlet />
    </div>
  )
}

