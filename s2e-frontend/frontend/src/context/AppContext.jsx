import { createContext, useContext, useMemo, useReducer, useEffect } from 'react'
import { authAPI } from '../services/authAPI'
import { cookieAuth } from '../utils/cookieAuth'

const AppStateContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'cart/add':
      return { ...state, cart: [...state.cart, action.item] }
    case 'cart/remove':
      return { ...state, cart: state.cart.filter((x) => x.id !== action.id) }
    case 'auth/login':
      return { ...state, isLoggedIn: true, user: action.user }
    case 'auth/logout':
      return { ...state, isLoggedIn: false, user: null, cart: [], searchTerm: '' }
    case 'auth/check':
      return { ...state, isLoggedIn: action.isLoggedIn, user: action.user }
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload || '' }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { 
    cart: [], 
    isLoggedIn: false, 
    user: { 
      id: null,
      name: 'Guest', 
      email: 'guest@example.com', 
      status: 'Guest',
      role: 'guest'
    },
    searchTerm: ''
  })

  // Check authentication status on app load
  useEffect(() => {
    // First, try to get auth from cookies (primary source)
    const cookieAuthData = cookieAuth.getAuth()
    
    // Fallback to localStorage for backward compatibility
    const localStorageLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const localStorageUser = localStorage.getItem('user')
    
    // Use cookie auth if available, otherwise fallback to localStorage
    if (cookieAuthData.isLoggedIn && cookieAuthData.user && cookieAuthData.token) {
      dispatch({ 
        type: 'auth/check', 
        isLoggedIn: true, 
        user: cookieAuthData.user
      })
    } else if (localStorageLoggedIn && localStorageUser) {
      try {
        const user = JSON.parse(localStorageUser)
        dispatch({ 
          type: 'auth/check', 
          isLoggedIn: true, 
          user: user || { 
            id: null,
            name: 'Guest', 
            email: 'guest@example.com', 
            status: 'Guest',
            role: 'guest'
          } 
        })
      } catch (error) {
        console.error('Error parsing localStorage user data:', error)
        // Clear corrupted data
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('user')
      }
    } else {
      // Clear any invalid data
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')
      cookieAuth.clearAuth()
    }

    // No cleanup needed for auto-logout
    return () => {}
  }, [])

  const value = useMemo(() => ({ 
    state, 
    dispatch,
    // Helper functions
    login: (user, token, userType = 'customer') => {
      // Store in both localStorage and cookies for consistency
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('userType', userType)
      if (token) {
        localStorage.setItem('token', token)
        
        // Store type-specific tokens for backward compatibility
        if (userType === 'admin') {
          localStorage.setItem('adminToken', token)
          localStorage.setItem('adminUser', JSON.stringify(user))
        } else if (userType === 'seller') {
          localStorage.setItem('sellerToken', token)
        }
      }
      
      // Also store in cookies
      if (token) {
        cookieAuth.setAuth(user, token, userType)
      }
      
      dispatch({ type: 'auth/login', user })
    },
    logout: () => {
      // Clear local storage
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('user')
      localStorage.removeItem('userType')
      localStorage.removeItem('token')
      localStorage.removeItem('sellerToken')
      localStorage.removeItem('adminToken')
      
      // Clear cookies
      cookieAuth.clearAuth()
      
      // Dispatch logout action
      dispatch({ type: 'auth/logout' })
    },
    addToCart: (item) => {
      dispatch({ type: 'cart/add', item })
    },
    removeFromCart: (id) => {
      dispatch({ type: 'cart/remove', id })
    }
  }), [state])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}


