import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAppState } from '../context/AppContext.jsx'
import SellerSidebar from '../components/partials/SellerSidebar.jsx'
import SellerTopbar from '../components/partials/SellerTopbar.jsx'
import CookieAuthGuard from '../components/CookieAuthGuard.jsx'

export default function SellerLayout() {
  const { dispatch } = useAppState()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Dynamic page titles based on current route
  const getPageTitle = () => {
    const path = location.pathname
    const titleMap = {
      '/seller/dashboard': 'Dashboard',
      '/seller/products': 'My Products', 
      '/seller/orders': 'Orders',
      '/seller/messages': 'Messages',
      '/seller/settings': 'Settings',
      '/seller/inventory': 'Inventory',
      '/seller/customers': 'Customers',
      '/seller/analytics': 'Analytics',
      '/seller/account': 'Account Management',
      '/seller/profile': 'My Profile'
    }
    return titleMap[path] || 'Seller Portal'
  }

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('userType')
    
    // Clear any cookies
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'sellerToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Update app state
    dispatch({ type: 'auth/logout' })
    
    // Redirect to home page after logout
    window.location.href = '/'
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <CookieAuthGuard userType="seller">
      <div className="seller-layout">
        {/* Seller Sidebar Component */}
        <SellerSidebar collapsed={sidebarCollapsed} />

        {/* Main Content */}
        <div className={`seller-main-wrapper${sidebarCollapsed ? ' expanded' : ''}`}>
          {/* Seller Topbar Component */}
          <SellerTopbar 
            pageTitle={getPageTitle()}
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
          />
          
          <div className="seller-content">
            <Outlet />
          </div>
        </div>
      </div>
    </CookieAuthGuard>
  )
}


