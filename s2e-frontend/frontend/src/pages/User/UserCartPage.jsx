import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import UserFooter from '../../components/partials/UserFooter.jsx'
import { RemoveFromCartModal, ClearCartModal } from '../../components/UserModals'
import { userCartAPI } from '../../services/userCartAPI.js'
import { cookieAuth } from '../../utils/cookieAuth.js'

export default function UserCartPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { isLoggedIn } = state

  // States
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Modal state
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [itemToRemove, setItemToRemove] = useState(null)
  
  // Checkbox selection state
  const [selectedItems, setSelectedItems] = useState({})
  const [selectAll, setSelectAll] = useState(false)
  
  // Cart items from database
  const [cartItems, setCartItems] = useState([])

  // Check authentication before loading cart
  useEffect(() => {
    const checkAuth = () => {
      console.log('🔒 Cart - Checking authentication...')
      
      // Check multiple auth sources
      const cookieAuthData = cookieAuth.getAuth()
      const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('token='))
      const token = tokenCookie ? tokenCookie.split('=')[1] : null
      const localStorageToken = localStorage.getItem('token') || localStorage.getItem('customerToken') || localStorage.getItem('userToken')
      const localStorageLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      const localStorageUser = localStorage.getItem('user')
      
      // Parse user from localStorage
      let user = null
      try {
        user = localStorageUser ? JSON.parse(localStorageUser) : null
      } catch (e) {
        console.error('Error parsing user from localStorage:', e)
      }
      
      // Check if user is authenticated (not seller, not admin - must be customer/regular user)
      const isSellerAuth = cookieAuth.isSellerAuthenticated()
      const isAdminAuth = cookieAuth.isAdminAuthenticated()
      const hasToken = !!(token || localStorageToken)
      const isLoggedIn = cookieAuthData.isLoggedIn || localStorageLoggedIn
      const userRole = cookieAuthData.user?.role || user?.role
      
      // User is authenticated if:
      // 1. Has token AND is logged in AND is NOT a seller/admin
      // 2. OR cookieAuth shows customer authentication
      const isCustomerAuth = (hasToken && isLoggedIn && userRole !== 'seller' && userRole !== 'admin') ||
                            cookieAuth.isCustomerAuthenticated() ||
                            (hasToken && isLoggedIn && (!userRole || userRole === 'customer' || userRole === 'user'))
      
      console.log('🔒 Cart - Auth check results:', {
        cookieAuth: cookieAuth.isCustomerAuthenticated(),
        isSellerAuth,
        isAdminAuth,
        hasToken,
        isLoggedIn,
        userRole,
        isCustomerAuth
      })
      
      if (!isCustomerAuth) {
        console.log('❌ Cart - User not authenticated, redirecting to login...')
        // Store current URL to redirect back after login
        const currentPath = window.location.hash.replace('#', '') || '/user/cart'
        localStorage.setItem('redirectAfterLogin', currentPath)
        navigate('/login', { replace: true })
        return
      }
      
      console.log('✅ Cart - User authenticated')
      setIsCheckingAuth(false)
    }
    
    // Small delay to ensure cookies are available
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [navigate])

  // Load cart from database or localStorage
  const loadCart = async () => {
    try {
    setLoading(true)
      setError(false)
      
      // Check if user is logged in - prioritize token check over app state
      // Token is more reliable on page reload as app state might not be initialized yet
      const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('token='))
      const token = tokenCookie ? tokenCookie.split('=')[1] : null
      
      // Also check localStorage for token as fallback
      const localStorageToken = localStorage.getItem('token') || localStorage.getItem('customerToken') || localStorage.getItem('userToken')
      
      // Use token if available (more reliable than isLoggedIn state on page reload)
      const hasAuth = token || localStorageToken
      
      console.log('📦 Cart - Auth check - Token from cookie:', !!token)
      console.log('📦 Cart - Auth check - Token from localStorage:', !!localStorageToken)
      console.log('📦 Cart - Auth check - isLoggedIn state:', isLoggedIn)
      console.log('📦 Cart - Auth check - hasAuth:', hasAuth)
      
      if (hasAuth) {
        // Load from database
        console.log('📦 Cart - Loading cart from database...')
        try {
          const response = await userCartAPI.getCart()
          console.log('✅ Cart - Database cart response:', response)
          
          // Handle response structure: response.data contains the cart data
          const cartData = response || {}
          const items = cartData.items || []
          
          console.log('📦 Cart - Cart items array:', items)
          console.log('📦 Cart - Items count:', items.length)
          
          if (items && Array.isArray(items) && items.length > 0) {
            // Map database items to cart format
            const mappedItems = items.map(item => {
              console.log('📦 Cart - Mapping item:', item)
              
              // Build image URL if it's a relative path
              let imageUrl = item.product_image || item.thumbnail || item.image || null
              if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                imageUrl = `http://localhost:8080/S2EH/s2e-backend${imageUrl}`
              }
              
              const mappedItem = {
                id: item.product_id,
                title: item.product_name || item.product_title || item.title || 'Product',
                price: parseFloat(item.current_price || item.price || item.product_price || 0),
                quantity: parseInt(item.quantity || 1),
                thumbnail: imageUrl || '/images/unknown.jpg',
                image: imageUrl,
                images: imageUrl ? [imageUrl] : [],
                seller_name: item.seller_name || 'Unknown Seller',
                sku: item.product_sku || item.sku || null,
                cart_item_id: item.id // Store cart item ID for database operations
              }
              
              console.log('📦 Cart - Mapped item:', mappedItem)
              return mappedItem
            })
            
            console.log('📦 Cart - Mapped cart items:', mappedItems)
            console.log('📦 Cart - Setting cart items, count:', mappedItems.length)
            
            setCartItems(mappedItems)
            
            // Sync to localStorage for backward compatibility
            localStorage.setItem('cart', JSON.stringify(mappedItems))
            
            setLoading(false)
            setIsInitialLoad(false)
            return
          } else {
            console.log('📦 Cart - No items in database cart or empty array')
            console.log('📦 Cart - Items value:', items)
            setCartItems([])
            localStorage.setItem('cart', JSON.stringify([]))
            setLoading(false)
            setIsInitialLoad(false)
            return
          }
        } catch (dbError) {
          console.error('❌ Cart - Error loading from database, falling back to localStorage:', dbError)
          console.error('❌ Cart - Error details:', dbError.message)
          // Fall through to localStorage loading
        }
      } else {
        console.log('📦 Cart - User not logged in or no token, loading from localStorage')
      }
      
      // Fallback to localStorage
      console.log('📦 Cart - Loading cart from localStorage...')
      const cartData = localStorage.getItem('cart')
      if (cartData) {
        const parsedCart = JSON.parse(cartData)
        console.log('📦 Cart - Loaded cart from localStorage:', parsedCart)
        setCartItems(parsedCart)
      } else {
        console.log('📦 Cart - No cart found in localStorage')
        setCartItems([])
      }
      
      setLoading(false)
      setIsInitialLoad(false)
    } catch (err) {
      console.error('❌ Cart - Error loading cart:', err)
      setError(true)
      setLoading(false)
      setIsInitialLoad(false)
    }
  }

  // Load cart on mount (only after auth check passes)
  useEffect(() => {
    if (!isCheckingAuth) {
    loadCart()
    }
  }, [isCheckingAuth])
  
  // Initialize selected items when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      const initialSelectedState = {}
      cartItems.forEach(item => {
        initialSelectedState[item.id] = selectAll
      })
      setSelectedItems(initialSelectedState)
    }
  }, [cartItems, selectAll])

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('🔄 Cart updated from another component, reloading cart...')
      loadCart()
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    if (cartItems.length >= 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      console.log('💾 Cart saved to localStorage')
    }
  }, [cartItems])

  // Get number of selected items
  const selectedCount = Object.values(selectedItems).filter(Boolean).length
  
  // Get selected cart items
  const selectedCartItems = cartItems.filter(item => selectedItems[item.id])
  
  // Calculate totals for selected items only
  const selectedItemsSubtotal = cartItems.reduce((total, item) => {
    if (selectedItems[item.id]) {
    const price = parseFloat(item.price) || 0
    return total + (price * item.quantity)
    }
    return total
  }, 0)
  
  // Always use selected items total (will be 0 if nothing is selected)
  const subtotal = selectedItemsSubtotal
  
  // No discount applied
  const total = subtotal

  // Handle checkout - navigate to checkout page with selected items
  const handleCheckout = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (selectedCount === 0) {
      console.warn('⚠️ No items selected, cannot proceed to checkout')
      return // Button should be disabled anyway
    }
    
    console.log('🛒 Checkout button clicked')
    console.log('🛒 Selected items count:', selectedCount)
    console.log('🛒 Selected cart items:', selectedCartItems)
    
    // Store selected item IDs in localStorage for checkout page to use
    const selectedItemIds = selectedCartItems.map(item => item.id)
    
    console.log('🛒 Selected item IDs:', selectedItemIds)
    
    localStorage.setItem('checkoutSelectedItems', JSON.stringify(selectedItemIds))
    
    // Also store the full selected items if needed
    localStorage.setItem('checkoutSelectedCartItems', JSON.stringify(selectedCartItems))
    
    console.log('🛒 Saved to localStorage:', {
      checkoutSelectedItems: selectedItemIds,
      checkoutSelectedCartItems: selectedCartItems
    })
    
    console.log('🛒 Navigating to /user/checkout...')
    
    try {
      navigate('/user/checkout')
      console.log('✅ Navigation called successfully')
    } catch (error) {
      console.error('❌ Navigation error:', error)
      // Fallback: try using window.location
      window.location.hash = '#/user/checkout'
    }
  }

  // Update quantity - syncs with database if logged in
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return
    
    // Find the item to get cart_item_id
    const item = cartItems.find(i => i.id === id)
    if (!item) return
    
    // Update local state immediately for UI feedback and sync to localStorage
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(i => (i.id === id ? { ...i, quantity: newQuantity } : i))
      localStorage.setItem('cart', JSON.stringify(updatedItems))
      return updatedItems
    })
    
    // Check if user is logged in
    const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('token='))
    const token = tokenCookie ? tokenCookie.split('=')[1] : null
    const localStorageToken = localStorage.getItem('token') || localStorage.getItem('customerToken') || localStorage.getItem('userToken')
    const hasAuth = token || localStorageToken
    
    // If logged in and has cart_item_id, update in database
    if (hasAuth && item.cart_item_id) {
      try {
        console.log('📦 Cart - Updating quantity in database:', { cart_item_id: item.cart_item_id, quantity: newQuantity })
        await userCartAPI.updateCartItem(item.cart_item_id, newQuantity)
        console.log('✅ Cart - Quantity updated in database')
      } catch (error) {
        console.error('❌ Cart - Failed to update quantity in database:', error)
        // Reload cart to sync
        loadCart()
        return
      }
    }
    
    // Dispatch event to update cart badge
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemoveClick = (item) => {
    setItemToRemove(item)
    setShowRemoveModal(true)
  }

  const confirmRemoveItem = async () => {
    if (itemToRemove) {
      // Check if user is logged in
      const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('token='))
      const token = tokenCookie ? tokenCookie.split('=')[1] : null
      const localStorageToken = localStorage.getItem('token') || localStorage.getItem('customerToken') || localStorage.getItem('userToken')
      const hasAuth = token || localStorageToken
      
      // If logged in and has cart_item_id, remove from database
      if (hasAuth && itemToRemove.cart_item_id) {
        try {
          console.log('📦 Cart - Removing item from database:', itemToRemove.cart_item_id)
          await userCartAPI.removeFromCart(itemToRemove.cart_item_id)
          console.log('✅ Cart - Item removed from database')
        } catch (error) {
          console.error('❌ Cart - Failed to remove item from database:', error)
          // Reload cart to sync
          loadCart()
          setItemToRemove(null)
          setShowRemoveModal(false)
          return
        }
      }
      
      // Remove from local state and sync to localStorage
      setCartItems(prevItems => {
        const updatedItems = prevItems.filter(i => i.id !== itemToRemove.id)
        localStorage.setItem('cart', JSON.stringify(updatedItems))
        return updatedItems
      })
      
      // Dispatch event to update cart badge
      window.dispatchEvent(new Event('cartUpdated'))
      setItemToRemove(null)
    }
    setShowRemoveModal(false)
  }

  const handleClearClick = () => {
    setShowClearModal(true)
  }

  const confirmClearCart = async () => {
    // Check if user is logged in
    const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('token='))
    const token = tokenCookie ? tokenCookie.split('=')[1] : null
    const localStorageToken = localStorage.getItem('token') || localStorage.getItem('customerToken') || localStorage.getItem('userToken')
    const hasAuth = token || localStorageToken
    
    // Clear local state immediately
    setCartItems([])
    
    // If logged in, clear from database
    if (hasAuth) {
      try {
        console.log('📦 Cart - Clearing cart from database...')
        await userCartAPI.clearCart()
        console.log('✅ Cart - Cart cleared from database')
      } catch (error) {
        console.error('❌ Cart - Failed to clear cart from database:', error)
        // Reload cart to sync
        loadCart()
        setShowClearModal(false)
        return
      }
    }
    
    // Clear localStorage
    localStorage.setItem('cart', JSON.stringify([]))
    
    // Dispatch event to update cart badge
    window.dispatchEvent(new Event('cartUpdated'))
    setShowClearModal(false)
  }
  
  // Handle checkbox selection
  const handleSelectItem = (id) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }
  
  // Handle select all checkbox
  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    
    const updatedSelectedItems = {}
    cartItems.forEach(item => {
      updatedSelectedItems[item.id] = newSelectAll
    })
    setSelectedItems(updatedSelectedItems)
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Checking authentication...</span>
          </div>
          <p className="mt-3 text-muted">Verifying your account...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Add spacing for fixed navbar */}
      <div style={{ height: '72px' }}></div>

      {/* Cart Header */}
      <section className="border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center py-3">
            <h1 className="h3 mb-0">Shopping Cart</h1>
            <Link to="/user/home" className="text-decoration-none text-primary">
              <i className="bi bi-arrow-left me-1"></i> Continue Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-4">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">Unable to load cart</h5>
              <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">Your cart is empty</h5>
              <Link to="/user/home" className="btn btn-sm btn-primary mt-2">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {/* Left Side: Cart Items */}
              <div className="col-lg-8 order-1 order-lg-0 mb-4 mb-lg-0">
                {/* Cart Items List */}
                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-header bg-white border-0 py-2">

                    <div className="d-flex align-items-center mt-2">
                      <div className="form-check me-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllCheckbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                        <label className="form-check-label" htmlFor="selectAllCheckbox">
                          Select All
                        </label>
                      </div>
                      <span className="fw-bold me-2" style={{ fontSize: '1.1rem' }}>{cartItems.length}</span>
                      <span style={{ color: '#6c757d' }}>items in cart</span>
                      {selectedCount > 0 && (
                        <span className="ms-2 badge bg-primary">{selectedCount} selected</span>
                      )}
                    </div>

                                        <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-sm text-danger d-flex align-items-center border-0 p-0"
                        onClick={handleClearClick}
                      >
                        <i className="bi bi-trash me-1"></i> <span style={{ color: '#dc3545' }}>Clear All</span>
                      </button>
                    </div>
                  </div>
                  <div className="card-body p-0">
                    {cartItems.map((item, index) => {
                      // Use dynamic data from item
                      const sku = item.sku || 'N/A';
                      const priceLabel = `₱${parseFloat(item.price || 0).toFixed(2)}`;
                      
                      return (
                        <div 
                          key={item.id}
                          className={`p-3 ${index < cartItems.length - 1 ? 'border-bottom' : ''}`}
                        >
                        <div className="row align-items-center">
                          {/* Checkbox */}
                          <div className="col-1 text-center">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`item-${item.id}`}
                                checked={selectedItems[item.id] || false}
                                onChange={() => handleSelectItem(item.id)}
                              />
                            </div>
                          </div>
                          
                          {/* Product Image */}
                          <div className="col-3 col-md-2 text-center">
                            <img
                              src={item.thumbnail || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23adb5bd"%3ENo Image%3C/text%3E%3C/svg%3E'}
                              alt={item.title}
                              className="img-fluid"
                              style={{ aspectRatio: '1/1', objectFit: 'cover', maxWidth: '60px' }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="col-8 col-md-3 mb-3 mb-md-0">
                            <h6 className="mb-1 fw-bold" style={{ fontSize: '1rem' }}>{item.title}</h6>
                            <small className="text-muted d-block" style={{ fontSize: '0.8rem' }}>{sku}</small>
                            <small className="text-muted d-block" style={{ fontSize: '0.8rem', color: '#6c757d' }}>{item.seller_name}</small>
                          </div>

                            {/* Price, Quantity, Total, Remove - Responsive Layouts */}
                            <div className="col-12 col-md-6">
                              <div className="row align-items-center mt-2 mt-md-0">
                                {/* Price */}
                                <div className="col-3 col-md-2">
                                  <div className="d-flex align-items-center justify-content-center">
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{priceLabel}</span>
                                  </div>
                                </div>

                                {/* Quantity */}
                                <div className="col-4 col-md-4">
                                  <div className="d-flex align-items-center justify-content-center">
                                    <button
                                      className="btn btn-sm px-2 py-0"
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      style={{ border: '1px solid #dee2e6' }}
                                    >
                                      −
                                    </button>
                                    <span className="mx-2" style={{ width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button
                                      className="btn btn-sm px-2 py-0"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      style={{ border: '1px solid #dee2e6' }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Total Price */}
                                <div className="col-3 col-md-3">
                                  <div className="d-flex align-items-center justify-content-center">
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 'bold' }}>₱{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>

                                {/* Remove Button */}
                                <div className="col-2 col-md-3 text-center">
                                  <button
                                    className="btn btn-sm text-danger border-0 p-0"
                                    onClick={() => handleRemoveClick(item)}
                                    title="Remove item"
                                  >
                                    <i className="bi bi-trash text-danger"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Side: Order Summary */}
              <div className="col-lg-4 order-0 order-lg-1 mb-4 mb-lg-0">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="mb-3">Order Summary</h5>
                    
                    {selectedCount > 0 ? (
                      <div className="alert alert-info mb-3 py-2" role="alert">
                        <small><i className="bi bi-info-circle me-1"></i> Showing total for {selectedCount} selected items</small>
                      </div>
                    ) : (
                      <div className="alert alert-warning mb-3 py-2" role="alert">
                        <small><i className="bi bi-exclamation-circle me-1"></i> No items selected. Select items to see total.</small>
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between mb-3">
                      <span style={{ fontSize: '0.95rem' }}>Subtotal</span>
                      <span className="fw-bold" style={{ fontFamily: 'monospace' }}>₱{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <hr className="my-3" />
                    
                    <div className="d-flex justify-content-between mb-4">
                      <span className="fw-bold fs-5" style={{ color: '#1B5E20' }}>Total</span>
                      <span className="fw-bold fs-5" style={{ color: '#1B5E20', fontFamily: 'monospace' }}>₱{subtotal.toFixed(2)}</span>
                    </div>

                    
                    {selectedCount > 0 ? (
                      <div className="mb-3">
                        <button 
                          className="btn btn-success w-100"
                          onClick={handleCheckout}
                      style={{ 
                        backgroundColor: '#2E7D32',
                        borderColor: '#2E7D32',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#1B5E20';
                        e.currentTarget.style.borderColor = '#1B5E20';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#2E7D32';
                        e.currentTarget.style.borderColor = '#2E7D32';
                      }}
                        >
                          Checkout Selected Items ({selectedCount})
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <button 
                          className="btn btn-secondary w-100"
                          disabled
                          style={{ 
                            backgroundColor: '#6c757d',
                            borderColor: '#6c757d',
                            cursor: 'not-allowed'
                          }}
                        >
                          Select Items to Checkout
                        </button>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <p className="mb-2 small">We Accept</p>
                      <div className="d-flex justify-content-center" style={{ gap: '8px' }}>
                        <i className="bi bi-cash-coin fs-5"></i>
                        <i className="bi bi-credit-card fs-5"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <UserFooter />

      {/* Simplified Modals */}
      <RemoveFromCartModal
        show={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false)
          setItemToRemove(null)
        }}
        onConfirm={confirmRemoveItem}
        item={itemToRemove}
      />

      <ClearCartModal
        show={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClearCart}
        itemCount={cartItems.length}
      />
    </>
  )
}