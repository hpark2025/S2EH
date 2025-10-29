import { NavLink, Outlet } from 'react-router-dom'
import { useAppState } from '../context/AppContext.jsx'
import { useCart } from '../hooks/useCart.js'

function Header() {
  const { dispatch } = useAppState()
  const { cartCount } = useCart()

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('cart') // Clear cart on logout
    dispatch({ type: 'auth/logout' })
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
          <input type="text" className="search-input" placeholder="Search..." />
          <button className="search-button">
            <i className="bi bi-search"></i>
          </button>
        </div>
        <div className="cart-account-wrapper">
          <NavLink to="/auth/chat" className="chat-wrapper" aria-label="Chat">
            <i className="bi bi-chat-dots cart-icon"></i>
            <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">3</span>
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

