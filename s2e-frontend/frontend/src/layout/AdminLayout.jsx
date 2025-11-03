import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppState } from '../context/AppContext.jsx'
import useLegacyAdminInit from '../legacy/useLegacyAdminInit.js'
import AdminSidebar from '../components/partials/AdminSidebar.jsx'
import AdminTopbar from '../components/partials/AdminTopbar.jsx'
import '../styles/admin.css'

export default function AdminLayout() {
  const { state, dispatch } = useAppState()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  // Auto-logout disabled for admin interface
  // useAdminAutoLogout(() => {
  //   console.log('Admin auto-logout triggered')
  // })

  // Initialize legacy admin functionality
  useLegacyAdminInit()

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem('adminToken')
      const adminUser = localStorage.getItem('adminUser')
      
      if (adminToken && adminUser) {
        try {
          const user = JSON.parse(adminUser)
          // Accept both 'admin' and 'super_admin' roles
          if (user.role === 'admin' || user.role === 'super_admin') {
            // User is authenticated as admin
            dispatch({ type: 'auth/login', user })
          } else {
            // User exists but not admin role
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUser')
          }
        } catch (error) {
          console.error('Error parsing admin user data:', error)
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
        }
      }
      setIsAuthChecked(true)
    }

    checkAdminAuth()
  }, [dispatch])

  // Dynamic page titles based on current route
  const getPageTitle = () => {
    const path = location.pathname
    const titleMap = {
      '/admin/dashboard': 'Dashboard',
      '/admin/products': 'Products Management',
      '/admin/orders': 'Orders Management',
      '/admin/users': 'Users Management',
      '/admin/producers': 'Producers Management',
      '/admin/messages': 'Messages'
    }
    return titleMap[path] || 'Admin Panel'
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    dispatch({ type: 'auth/logout' })
    // Redirect to home page on port 5173
    window.location.href = 'http://localhost:5173/'
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Show loading while checking authentication
  if (!isAuthChecked) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="spinner"></div>
        <div>Checking authentication...</div>
      </div>
    )
  }

  // Check if user is authenticated and has admin role
  const adminToken = localStorage.getItem('adminToken')
  const adminUser = localStorage.getItem('adminUser')
  
  if (!adminToken || !adminUser) {
    return <Navigate to="/admin/login" replace />
  }

  try {
    const user = JSON.parse(adminUser)
    // Accept both 'admin' and 'super_admin' roles
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      console.log('❌ Access denied: User role is', user.role)
      return <Navigate to="/admin/login" replace />
    }
  } catch (error) {
    console.error('Error parsing admin user:', error)
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar Component */}
      <AdminSidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <div className={`admin-main${sidebarCollapsed ? ' expanded' : ''}`}>
        {/* Admin Topbar Component */}
        <AdminTopbar 
          pageTitle={getPageTitle()}
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          notificationCount={5}
        />
        
        {/* Content Area */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
      
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        .admin-main {
          margin-left: 250px;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
          position: relative;
          overflow-x: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .admin-main.expanded {
          margin-left: 70px;
        }
        
        .admin-content {
          padding: 30px;
          flex: 1;
        }
        
        .spinner {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #2c853f;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .admin-main {
            margin-left: 0;
          }
          
          .admin-content {
            padding: 20px 15px;
          }
        }
      `}</style>
    </div>
  )
}


