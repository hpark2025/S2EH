import { useEffect } from 'react'
import { useAppState } from '../context/AppContext.jsx'

/**
 * Custom hook for handling auto-logout functionality
 * This hook should be used in authenticated components/layouts
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableMonitoring - Whether to enable server monitoring (default: true)
 * @param {Function} options.onLogout - Custom callback when logout occurs
 * @param {string} options.userType - Type of user (customer, seller, admin) for logging
 */
export const useAutoLogout = (options = {}) => {
  const { state, logout } = useAppState()
  const { 
    enableMonitoring = true, 
    onLogout: customLogoutCallback, 
    userType = 'user' 
  } = options

  useEffect(() => {
    // Only set up auto-logout if user is logged in and monitoring is enabled
    if (state.isLoggedIn && enableMonitoring) {
      console.log(`🔐 Setting up auto-logout for ${userType}`)

      // Register custom logout callback if provided
      const handleLogout = () => {
        if (customLogoutCallback && typeof customLogoutCallback === 'function') {
          customLogoutCallback()
        }
        logout()
      }

      // Setup timeout or other monitoring logic
      const logoutTimer = setTimeout(() => {
        console.log(`🕒 Auto-logout triggered for ${userType}`)
        handleLogout()
      }, 30 * 60 * 1000) // 30 minutes

      // Cleanup function
      return () => {
        clearTimeout(logoutTimer)
      }
    }
  }, [state.isLoggedIn, enableMonitoring, customLogoutCallback, userType, logout])

  // Return helper functions
  return {
    logout: logout,
    isLoggedIn: state.isLoggedIn,
    user: state.user,
    checkServerStatus: () => {
      // Simplified server status check
      return state.isLoggedIn
    }
  }
}

/**
 * Hook specifically for customer interface
 */
export const useCustomerAutoLogout = (onLogout) => {
  return useAutoLogout({
    userType: 'customer',
    onLogout
  })
}

/**
 * Hook specifically for seller interface
 */
export const useSellerAutoLogout = (onLogout) => {
  return useAutoLogout({
    userType: 'seller',
    onLogout
  })
}

/**
 * Hook specifically for admin interface
 */
export const useAdminAutoLogout = (onLogout) => {
  return useAutoLogout({
    userType: 'admin',
    onLogout
  })
}