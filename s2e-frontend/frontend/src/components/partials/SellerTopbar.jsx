import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sellerAPI } from '../../services/sellerAPI'
import { useAppState } from '../../context/AppContext'

export default function SellerTopbar({ 
  pageTitle = "Dashboard", 
  onToggleSidebar, 
  onLogout
}) {
  const navigate = useNavigate()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [sellerProfile, setSellerProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avatarError, setAvatarError] = useState(false)
  const [dropdownAvatarError, setDropdownAvatarError] = useState(false)
  const { state } = useAppState()

  useEffect(() => {
    loadSellerProfile()
  }, [])

  const loadSellerProfile = async () => {
    try {
      setLoading(true)
      // Try to get profile from API first
      try {
        const response = await sellerAPI.getProfile()
        console.log('📡 Raw API response:', response)
        console.log('📡 Response type:', typeof response)
        console.log('📡 Response keys:', response ? Object.keys(response) : 'No response')
        
        // Backend returns { success: true, message: '...', data: {...seller} }
        // sellerAPI.getProfile() returns response.data from axios
        // So response = { success: true, message: '...', data: {...seller} }
        let profileData = null
        
        // Check if response has nested data structure
        if (response?.success && response?.data) {
          // Response structure: { success: true, data: {...seller} }
          profileData = response.data
          console.log('📦 Using response.data (nested structure)')
        } else if (response?.data && typeof response.data === 'object' && !response.data.success) {
          // Response structure might be different
          profileData = response.data
          console.log('📦 Using response.data (alternative structure)')
        } else if (response && typeof response === 'object' && response.id) {
          // Response is directly the seller object
          profileData = response
          console.log('📦 Using response directly (seller object)')
        } else {
          // Try fallback - maybe response itself is the seller
          profileData = response
          console.log('📦 Using response as fallback')
        }
        
        console.log('📦 Extracted seller profile data:', profileData)
        console.log('📦 Seller avatar field:', profileData?.avatar)
        console.log('📦 All seller profile keys:', profileData ? Object.keys(profileData) : 'No profile data')
        
        if (profileData && typeof profileData === 'object' && (profileData.id || profileData.email)) {
          setSellerProfile(profileData)
          // Reset avatar error states when profile loads
          setAvatarError(false)
          setDropdownAvatarError(false)
        } else {
          console.error('❌ Invalid profile data structure:', profileData)
          throw new Error('Could not extract profile data from response')
        }
      } catch (apiError) {
        console.log('API profile fetch failed, using stored data:', apiError)
        // Fallback to stored user data
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (storedUser && Object.keys(storedUser).length > 0) {
          console.log('📦 Using stored user data:', storedUser)
          setSellerProfile(storedUser)
        } else {
          throw apiError
        }
      }
    } catch (error) {
      console.error('Failed to load seller profile:', error)
      // Use fallback data only if nothing else available
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser && Object.keys(storedUser).length > 0) {
        setSellerProfile(storedUser)
      } else {
        setSellerProfile({
          owner_name: 'Seller',
          business_name: 'Business',
          email: 'seller@example.com'
        })
      }
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
    
    // Check for owner_name (sellers table field)
    if (sellerProfile.owner_name) {
      return sellerProfile.owner_name
    }
    
    // Check for business_name (sellers table field)
    if (sellerProfile.business_name) {
      return sellerProfile.business_name
    }
    
    // Fallback to camelCase versions
    if (sellerProfile.businessName) {
      return sellerProfile.businessName
    }
    
    // Check for first/last name (if stored in different format)
    if (sellerProfile.firstName && sellerProfile.lastName) {
      return `${sellerProfile.firstName} ${sellerProfile.lastName}`
    }
    
    if (sellerProfile.first_name && sellerProfile.last_name) {
      return `${sellerProfile.first_name} ${sellerProfile.last_name}`
    }
    
    // Final fallback
    return sellerProfile.email || 'Seller'
  }

  const getInitials = () => {
    if (!sellerProfile) return 'S'
    
    // Check for owner_name first
    if (sellerProfile.owner_name) {
      const names = sellerProfile.owner_name.trim().split(' ')
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      }
      return sellerProfile.owner_name.charAt(0).toUpperCase()
    }
    
    // Check for first/last name
    if (sellerProfile.firstName && sellerProfile.lastName) {
      return `${sellerProfile.firstName.charAt(0)}${sellerProfile.lastName.charAt(0)}`.toUpperCase()
    }
    
    if (sellerProfile.first_name && sellerProfile.last_name) {
      return `${sellerProfile.first_name.charAt(0)}${sellerProfile.last_name.charAt(0)}`.toUpperCase()
    }
    
    // Check for business_name
    if (sellerProfile.business_name) {
      const businessName = sellerProfile.business_name.trim()
      const words = businessName.split(' ')
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
      }
      return businessName.charAt(0).toUpperCase()
    }
    
    if (sellerProfile.businessName) {
      const businessName = sellerProfile.businessName.trim()
      const words = businessName.split(' ')
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
      }
      return businessName.charAt(0).toUpperCase()
    }
    
    return 'S'
  }

  const getEmail = () => {
    if (!sellerProfile) return ''
    return sellerProfile.email || ''
  }

  const getAvatarUrl = () => {
    if (!sellerProfile) {
      console.log('📦 No sellerProfile for avatar')
      return null
    }
    
    if (!sellerProfile.avatar) {
      console.log('📦 No avatar field in sellerProfile:', sellerProfile)
      return null
    }
    
    const avatarPath = sellerProfile.avatar
    console.log('📦 Avatar path:', avatarPath)
    
    if (avatarPath.startsWith('http')) {
      console.log('📦 Using full URL:', avatarPath)
      return avatarPath
    }
    
    // Check if path already includes /S2EH/s2e-backend or /s2e-backend
    let fullUrl
    if (avatarPath.startsWith('/S2EH/s2e-backend') || avatarPath.startsWith('/s2e-backend')) {
      // Path already includes backend path, just add domain
      fullUrl = `http://localhost:8080${avatarPath}`
    } else {
      // Path is relative, add backend path
      fullUrl = `http://localhost:8080/S2EH/s2e-backend${avatarPath}`
    }
    
    console.log('📦 Formatted avatar URL:', fullUrl)
    return fullUrl
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
            ) : (() => {
              const avatarUrl = getAvatarUrl()
              if (avatarUrl && !avatarError) {
                return (
                  <img 
                    src={avatarUrl} 
                    alt={getDisplayName()}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                    onError={() => setAvatarError(true)}
                  />
                )
              }
              return getInitials()
            })()}
          </div>
          <span>{getDisplayName()}</span>
          <i className="bi bi-chevron-down"></i>
          
          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">
                    {(() => {
                      const avatarUrl = getAvatarUrl()
                      if (avatarUrl && !dropdownAvatarError) {
                        return (
                          <img 
                            src={avatarUrl} 
                            alt={getDisplayName()}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%'
                            }}
                            onError={() => setDropdownAvatarError(true)}
                          />
                        )
                      }
                      return getInitials()
                    })()}
                  </div>
                  <div className="dropdown-user-details">
                    <div className="dropdown-name">{getDisplayName()}</div>
                    <div className="dropdown-email">{getEmail() || 'No email'}</div>
                  </div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item" 
                onClick={() => {
                  setShowProfileDropdown(false)
                  navigate('/seller/profile')
                }}
              >
                <i className="bi bi-person" style={{ color: 'green' }}></i>
                Profile
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={handleLogoutClick}>
                <i className="bi bi-box-arrow-right" style={{ color: 'red' }}></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}