import { useState, useEffect } from 'react'
import { sellerAPI } from '../../services/sellerAPI'
import { useAppState } from '../../context/AppContext'

export default function SellerTopbar({ 
  pageTitle = "Dashboard", 
  onToggleSidebar, 
  onLogout
}) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [sellerProfile, setSellerProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { state } = useAppState()

  useEffect(() => {
    loadSellerProfile()
  }, [])

  const loadSellerProfile = async () => {
    try {
      setLoading(true)
      // Try to get profile from API firsts
      try {
        const response = await sellerAPI.getProfile()
        setSellerProfile(response.seller || response)
      } catch (apiError) {
        console.log('API profile fetch failed, using stored data:', apiError)
        // Fallback to stored user data
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        setSellerProfile(storedUser)
      }
    } catch (error) {
      console.error('Failed to load seller profile:', error)
      // Use fallback data
      setSellerProfile({
        firstName: 'Seller',
        lastName: 'User',
        businessName: 'Business',
        email: 'seller@example.com'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    }
    // Clear all authentication data
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('sellerToken')
    localStorage.removeItem('userType')
    // Redirect to home page
    window.location.href = '/'
  }

  // Get display name and initials
  const getDisplayName = () => {
    if (!sellerProfile) return 'Loading...'
    if (sellerProfile.businessName) return sellerProfile.businessName
    if (sellerProfile.firstName && sellerProfile.lastName) {
      return `${sellerProfile.firstName} ${sellerProfile.lastName}`
    }
    return sellerProfile.email || 'Seller'
  }

  const getInitials = () => {
    if (!sellerProfile) return 'S'
    if (sellerProfile.firstName && sellerProfile.lastName) {
      return `${sellerProfile.firstName.charAt(0)}${sellerProfile.lastName.charAt(0)}`.toUpperCase()
    }
    if (sellerProfile.businessName) {
      return sellerProfile.businessName.charAt(0).toUpperCase()
    }
    return 'S'
  }

  return (
    <header className="seller-topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
        <h1 className="page-title">{pageTitle}</h1>
      </div>
      
      <div className="topbar-right">
        <div className="seller-profile" onClick={handleProfileClick}>
          <div className="seller-avatar">
            {loading ? (
              <i className="bi bi-hourglass-split"></i>
            ) : (
              getInitials()
            )}
          </div>
          <span>{getDisplayName()}</span>
          <i className="bi bi-chevron-down"></i>
          
          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    {getInitials()}
                  </div>
                  <div className="dropdown-user-details">
                    <div className="dropdown-name">{getDisplayName()}</div>
                    <div className="dropdown-email">{sellerProfile?.email || 'seller@example.com'}</div>
                  </div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <a href="/seller/profile" className="dropdown-item">
                <i className="bi bi-person"></i>
                My Profile
              </a>
              <a href="/seller/settings" className="dropdown-item">
                <i className="bi bi-gear"></i>
                Settings
              </a>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={handleLogoutClick}>
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}