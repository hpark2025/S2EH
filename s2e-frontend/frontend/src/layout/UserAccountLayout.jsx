import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppState } from '../context/AppContext.jsx'
import { authAPI } from '../services/authAPI.js'

export default function UserAccountLayout() {
  const navigate = useNavigate()
  const { state, dispatch } = useAppState()
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('/images/unknown.jpg')
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load current user data
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      if (response.success) {
        setUserData(response.data.user)
        // Update context with fresh user data
        dispatch({ 
          type: 'auth/login', 
          user: response.data.user 
        })
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // Fallback to stored user data
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser))
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError)
          // If no stored data, use context data
          setUserData(state.user)
        }
      } else {
        // Use context data as final fallback
        setUserData(state.user)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      dispatch({ type: 'auth/logout' })
      // Redirect to home page after logout
      window.location.href = '/home'
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadAvatar = () => {
    // Simulate upload
    alert('Profile picture updated successfully!')
    setShowAvatarModal(false)
  }

  return (
    <>
      {/* Add spacing for fixed navbar */}
      <div style={{ height: '90px' }}></div>

      {/* Account Content */}
      <div className="container-fluid">
        <div className="row g-0">
          {/* Account Sidebar */}
          <div className="col-lg-3 col-md-4">
            <div className="account-sidebar bg-white border rounded p-4 sticky-top" style={{ top: '100px' }}>
              {/* User Info */}
              <div className="user-info text-center mb-4 pb-4 border-bottom">
                <div className="position-relative d-inline-block mb-3">
                  <img 
                    src={avatarPreview} 
                    alt="Profile" 
                    className="profile-avatar rounded-circle" 
                    width="80" 
                    height="80"
                    style={{ objectFit: 'cover' }}
                  />
                  <button 
                    className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle" 
                    style={{ width: '30px', height: '30px' }}
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <i className="bi bi-camera-fill"></i>
                  </button>
                </div>
                <h5 className="mb-1">
                  {loading ? 'Loading...' : userData ? `${userData.firstName} ${userData.lastName}` : 'User Name'}
                </h5>
                <p className="text-muted mb-2">
                  {loading ? 'Loading...' : userData?.email || 'user@email.com'}
                </p>
                <span className="badge bg-success">
                  <i className="bi bi-shield-check me-1"></i>
                  {userData?.status === 'active' ? 'Verified Account' : 'Account Status: ' + (userData?.status || 'Unknown')}
                </span>
              </div>

              {/* Navigation Menu */}
              <nav className="account-nav">
                <ul className="nav nav-pills flex-column">
                  <li className="nav-item">
                    <NavLink 
                      to="/auth/account/profile" 
                      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                      <i className="bi bi-person me-2"></i>My Profile
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink 
                      to="/auth/account/orders" 
                      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                      <i className="bi bi-box-seam me-2"></i>My Orders
                      <span className="badge bg-primary ms-auto ">3</span>
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink 
                      to="/auth/account/settings" 
                      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                      <i className="bi bi-geo-alt me-2"></i>Addresses
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink 
                      to="/auth/account/notifications" 
                      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                      <i className="bi bi-bell me-2"></i>Notifications
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink 
                      to="/auth/account/security" 
                      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                      <i className="bi bi-shield-lock me-2"></i>Security
                    </NavLink>
                  </li>
                  <li className="nav-item mt-3 pt-3 border-top">
                    <a 
                      className="nav-link text-danger" 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault()
                        handleLogout()
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-lg-9 col-md-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Profile Picture</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAvatarModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center">
                  <img 
                    src={avatarPreview} 
                    alt="Preview" 
                    className="preview-avatar rounded-circle mb-3" 
                    width="150" 
                    height="150"
                    style={{ objectFit: 'cover' }}
                  />
                  <div>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <small className="text-muted">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAvatarModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleUploadAvatar}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-light py-5 border-top mt-5">
        <div className="container">
          <div className="text-center">
            <p className="text-muted mb-0">
              <i className="bi bi-c-circle me-1"></i>2025 From Sagnay to Every Home. All rights reserved.
            </p>
            <p className="text-muted small">
              <i className="bi bi-shop me-1"></i>An e-commerce platform connecting local producers in Sagnay, Camarines Sur with customers nationwide.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}


