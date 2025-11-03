import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppState } from '../context/AppContext.jsx'
import { authAPI } from '../services/authAPI.js'
import { toast } from 'react-hot-toast'

export default function UserAccountLayout() {
  const navigate = useNavigate()
  const { state, dispatch } = useAppState()
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('/images/unknown.jpg')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
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
        const user = response.data.user
        setUserData(user)
        
        // Set avatar preview if user has avatar
        if (user.avatar) {
          setAvatarPreview('http://localhost:8080' + user.avatar)
        }
        
        // Update context with fresh user data
        dispatch({ 
          type: 'auth/login', 
          user: user
        })
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // Fallback to stored user data
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setUserData(user)
          if (user.avatar) {
            setAvatarPreview('http://localhost:8080' + user.avatar)
          }
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    try {
      setUploading(true)
      console.log('📤 Uploading avatar to database...')
      
      // Get auth token
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('avatar', selectedFile)
      
      // Upload to backend
      const response = await fetch('http://localhost:8080/S2EH/s2e-backend/api/users/avatar/', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
          // Don't set Content-Type header, let browser set it for FormData
        },
        body: formData
      })

      console.log('✅ Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Avatar uploaded:', data)

      // Update avatar preview with new path
      if (data.data?.avatar) {
        const newAvatarPath = 'http://localhost:8080' + data.data.avatar
        setAvatarPreview(newAvatarPath)
        
        // Update userData
        setUserData(prev => ({
          ...prev,
          avatar: data.data.avatar
        }))
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        currentUser.avatar = data.data.avatar
        localStorage.setItem('user', JSON.stringify(currentUser))
      }

      toast.success('✅ Profile picture updated successfully!')
      setShowAvatarModal(false)
      setSelectedFile(null)
      
      // Reload user data to get fresh avatar
      await loadUserData()
      
    } catch (error) {
      console.error('❌ Failed to upload avatar:', error)
      toast.error(error.message || 'Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
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
                  {(() => {
                    if (loading) return 'Loading...'
                    if (!userData) return 'User Name'
                    const firstName = userData.first_name || userData.firstName || ''
                    const lastName = userData.last_name || userData.lastName || ''
                    const fullName = `${firstName} ${lastName}`.trim()
                    return fullName || 'User Name'
                  })()}
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
                      <i className="bi bi-person me-2"></i>Profile
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink 
                      to="/auth/account/orders" 
                      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                      <i className="bi bi-box-seam me-2"></i>Orders
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
                  onClick={() => {
                    setShowAvatarModal(false)
                    setSelectedFile(null)
                    // Reset to current avatar if user canceled
                    if (userData?.avatar) {
                      setAvatarPreview('http://localhost:8080' + userData.avatar)
                    } else {
                      setAvatarPreview('/images/unknown.jpg')
                    }
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleUploadAvatar}
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-1"></i>Upload
                    </>
                  )}
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


