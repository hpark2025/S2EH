import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import UserFooter from '../../components/partials/UserFooter.jsx'
import { RemoveFromCartModal, ClearCartModal } from '../../components/UserModals'
import { userCartAPI } from '../../services/userCartAPI.js'

export default function UserCartPage() {
  const { state } = useAppState()
  const { isLoggedIn } = state

  // States
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Modal state
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [itemToRemove, setItemToRemove] = useState(null)

  // Load cart from database or localStorage
  const loadCart = async () => {
    try {
      setLoading(true)
      
      // Check if user is logged in - prioritize token check over app state
      // Token is more reliable on page reload as app state might not be initialized yet
      const tokenCookie = document.cookie.split(';').find(c => c.trim().startsWith('token='))
      const token = tokenCookie ? tokenCookie.split('=')[1] : null
      
      // Also check localStorage for token as fallback
      const localStorageToken = localStorage.getItem('token') || localStorage.getItem('customerToken') || localStorage.getItem('userToken')
      
      // Use token if available (more reliable than isLoggedIn state on page reload)
      const hasAuth = token || localStorageToken
      
      console.log('🛒 Auth check - Token from cookie:', !!token)
      console.log('🛒 Auth check - Token from localStorage:', !!localStorageToken)
      console.log('🛒 Auth check - isLoggedIn state:', isLoggedIn)
      console.log('🛒 Auth check - hasAuth:', hasAuth)
      
      if (hasAuth) {
        // Load from database
        console.log('🛒 Loading cart from database...')
        console.log('🛒 User logged in:', isLoggedIn)
        console.log('🛒 Token found:', !!token)
        try {
          const response = await userCartAPI.getCart()
          console.log('✅ Database cart response:', response)
          console.log('✅ Response type:', typeof response)
          console.log('✅ Response keys:', response ? Object.keys(response) : 'null')
          
          // Handle response structure: response.data contains the cart data
          const cartData = response || {}
          const items = cartData.items || []
          
          console.log('🛒 Cart items array:', items)
          console.log('🛒 Items count:', items.length)
          
          if (items && Array.isArray(items) && items.length > 0) {
            // Map database items to cart format
            const mappedItems = items.map(item => {
              console.log('🛒 Mapping item:', item)
              
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
                thumbnail: imageUrl,
                image: imageUrl,
                images: imageUrl ? [imageUrl] : [],
                seller_name: item.seller_name || 'Unknown Seller',
                sku: item.product_sku || item.sku || null,
                cart_item_id: item.id // Store cart item ID for database operations
              }
              
              console.log('🛒 Mapped item:', mappedItem)
              return mappedItem
            })
            
            console.log('🛒 Mapped cart items:', mappedItems)
            console.log('🛒 Setting cart items, count:', mappedItems.length)
            
            setCartItems(mappedItems)
            
            // Sync to localStorage for backward compatibility
            localStorage.setItem('cart', JSON.stringify(mappedItems))
            
            setIsInitialLoad(false)
            setLoading(false)
            return
          } else {
            console.log('🛒 No items in database cart or empty array')
            console.log('🛒 Items value:', items)
            setCartItems([])
            localStorage.setItem('cart', JSON.stringify([]))
            setIsInitialLoad(false)
            setLoading(false)
            return
          }
        } catch (dbError) {
          console.error('❌ Error loading from database, falling back to localStorage:', dbError)
          console.error('❌ Error details:', dbError.message)
          console.error('❌ Error stack:', dbError.stack)
          // Fall through to localStorage loading
        }
      } else {
        console.log('🛒 User not logged in or no token, skipping database load')
      }
      
      // Fallback to localStorage
      console.log('🛒 Loading cart from localStorage...')
      const cartData = localStorage.getItem('cart')
      if (cartData) {
        const parsedCart = JSON.parse(cartData)
        console.log('🛒 Loaded cart from localStorage:', parsedCart)
        setCartItems(parsedCart)
      } else {
        console.log('🛒 No cart found in localStorage')
        setCartItems([])
      }
    } catch (err) {
      console.error('❌ Error loading cart:', err)
      setError(true)
      setCartItems([])
    } finally {
      setIsInitialLoad(false)
      setLoading(false)
    }
  }

  // Load cart on mount
  useEffect(() => {
    loadCart()
  }, [])

  // Listen for cart updates from other components (but skip during initial load)
  useEffect(() => {
    if (isInitialLoad) return // Don't listen during initial load
    
    const handleCartUpdate = () => {
      console.log('🔄 Cart updated from another component, reloading...')
      loadCart()
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [isInitialLoad])

  // Save cart to localStorage whenever cartItems changes (but not during initial load)
  useEffect(() => {
    if (!loading && !isInitialLoad && cartItems.length >= 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      console.log('💾 Cart saved to localStorage:', cartItems)
      // Dispatch event to update cart badge only if not initial load
      // This prevents infinite loop during initial cart loading
    }
  }, [cartItems, loading, isInitialLoad])

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price) || 0
    return total + (price * item.quantity)
  }, 0)
  
  // Discount calculation: 10% discount for orders above ₱500
  const discountRate = subtotal >= 500 ? 0.10 : 0
  const discount = subtotal * discountRate

  // Total calculation (shipping removed)
  const total = subtotal - discount

  // Quantity handlers
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return
    
    // Find the item to get cart_item_id
    const item = cartItems.find(i => i.id === id)
    
    // Update local state immediately for UI feedback
    setCartItems(items =>
      items.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
    )
    
    // Update in database if logged in
    if (isLoggedIn && item?.cart_item_id) {
      try {
        await userCartAPI.updateCartItem(item.cart_item_id, newQuantity)
        console.log('✅ Updated quantity in database')
        // Dispatch event to update cart badge
        window.dispatchEvent(new Event('cartUpdated'))
      } catch (error) {
        console.error('❌ Failed to update quantity in database:', error)
        // Reload cart to sync with database
        await loadCart()
      }
    } else {
      // Update cart badge even if not logged in
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }

  const handleRemoveClick = (item) => {
    setItemToRemove(item)
    setShowRemoveModal(true)
  }

  const confirmRemoveItem = async () => {
    if (itemToRemove) {
      // Remove from local state immediately
      setCartItems(items => items.filter(i => i.id !== itemToRemove.id))
      
      // Remove from database if logged in
      if (isLoggedIn && itemToRemove.cart_item_id) {
        try {
          await userCartAPI.removeFromCart(itemToRemove.cart_item_id)
          console.log('✅ Removed item from database')
        } catch (error) {
          console.error('❌ Failed to remove from database:', error)
          // Reload cart to sync with database
          await loadCart()
        }
      }
      
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
    // Clear local state immediately
    setCartItems([])
    
    // Clear database cart if logged in
    if (isLoggedIn) {
      try {
        await userCartAPI.clearCart()
        console.log('✅ Cleared cart from database')
      } catch (error) {
        console.error('❌ Failed to clear database cart:', error)
        // Reload cart to sync with database
        await loadCart()
      }
    }
    
    // Dispatch event to update cart badge
    window.dispatchEvent(new Event('cartUpdated'))
    setShowClearModal(false)
  }

  return (
    <>
      {/* Add spacing for fixed navbar */}
      <div style={{ height: '72px' }}></div>

      {/* Cart Header */}
      <section className="bg-light py-4">
        <div className="container">
          <h1>Shopping Basket</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/user/home">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Shopping Basket
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-5">
        <div className="container">
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your basket...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <i className="bi bi-wifi-off" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
              <h3 className="mt-3">Unable to Load Cart</h3>
              <p className="text-muted mb-4">
                Please check your internet connection and try again.
              </p>
              <button
                className="btn btn-primary me-2"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <Link to="/user/home" className="btn btn-outline-secondary">
                Continue Shopping
              </Link>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#dee2e6' }}></i>
              </div>
              <h3 className="mt-3 mb-2">Your basket is empty</h3>
              <p className="text-muted mb-4">Start shopping to add items to your basket</p>
              <Link
                to="/user/home"
                className="btn btn-primary btn-lg"
              >
                <i className="bi bi-arrow-left me-2"></i>Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {/* Cart Items */}
              <div className="col-lg-9">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                    <h5 className="mb-0 fw-bold">
                      <i className="bi bi-cart3 me-2 text-primary"></i>
                      Basket Items ({cartItems.length})
                    </h5>
                    <div className="d-flex gap-2">
                      <Link
                        to="/user/home"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-arrow-left me-1"></i> Continue Shopping
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleClearClick}
                      >
                        <i className="bi bi-trash me-1"></i> Clear Basket
                      </button>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    {cartItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`cart-item bg-white rounded mb-3 ${index < cartItems.length - 1 ? '' : ''}`}
                        style={{ 
                          transition: 'all 0.3s ease', 
                          padding: '20px',
                          border: '1px solid #dee2e6',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="row align-items-center">
                          {/* Product Image */}
                          <div className="col-lg-2 col-md-3 col-4 mb-3 mb-lg-0">
                            <Link to={`/user/products/${item.id}`} className="text-decoration-none d-block">
                              <div className="position-relative mx-auto" style={{ width: '100px', height: '100px', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                                <img
                                  src={(() => {
                                    const img = item.thumbnail || item.image || item.images?.[0];
                                    if (!img) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23adb5bd"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    if (img.startsWith('http') || img.startsWith('data:')) return img;
                                    return `http://localhost:8080/S2EH/s2e-backend${img}`;
                                  })()}
                                  alt={item.title}
                                  className="img-fluid w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => { 
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f8f9fa"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23adb5bd"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </div>
                            </Link>
                          </div>

                          {/* Product Name & Store */}
                          <div className="col-lg-2 col-md-3 col-8 mb-3 mb-lg-0">
                            <Link to={`/user/products/${item.id}`} className="text-decoration-none text-dark">
                              <h6 className="mb-1 fw-bold" style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>{item.title}</h6>
                            </Link>
                            <p className="mb-0 text-muted small d-flex align-items-center">
                              <i className="bi bi-shop me-1"></i>
                              <span>{item.seller_name ? item.seller_name : 'Seller info unavailable'}</span>
                            </p>
                          </div>

                          {/* LGU Badge */}
                          <div className="col-lg-1 col-md-1 col-auto mb-3 mb-lg-0 d-flex align-items-center justify-content-center">
                            <span className="badge" style={{ backgroundColor: '#28a745', color: '#fff', padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                              <i className="bi bi-shield-check me-1"></i>LGU
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-lg-6 col-md-4 col-12 mb-3 mb-lg-0 d-flex align-items-center justify-content-lg-end justify-content-center">
                            <div 
                              className="quantity-selector d-flex align-items-center border rounded" 
                              style={{ 
                                width: 'fit-content',
                                minWidth: '140px',
                                flexShrink: 0
                              }}
                            >
                              <button
                                className="btn btn-light border-0"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                style={{ 
                                  minWidth: '40px', 
                                  width: '40px',
                                  height: '40px',
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                  color: item.quantity <= 1 ? '#adb5bd' : '#000',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0',
                                  flexShrink: 0
                                }}
                                title="Decrease quantity"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                className="form-control border-0 text-center"
                                value={item.quantity}
                                min="1"
                                max="99"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1
                                  updateQuantity(item.id, Math.max(1, Math.min(99, val)))
                                }}
                                style={{ 
                                  width: '60px',
                                  minWidth: '60px',
                                  height: '40px',
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  padding: '0',
                                  flexShrink: 0
                                }}
                              />
                              <button
                                className="btn btn-light border-0"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ 
                                  minWidth: '40px', 
                                  width: '40px',
                                  height: '40px',
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '0',
                                  flexShrink: 0
                                }}
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Trash Icon */}
                          <div className="col-lg-1 col-md-1 col-12 d-flex justify-content-lg-end justify-content-center">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveClick(item)}
                              title="Remove item"
                              style={{ 
                                width: '45px', 
                                height: '45px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary & Shipping Information */}
              <div className="col-lg-3">
                <div className="sticky-top" style={{ top: '20px' }}>
                  {/* Order Summary Card */}
                  <div className="card mb-3 shadow-sm border-0">
                    <div className="card-header bg-primary text-white py-3">
                      <h5 className="mb-0 fw-bold">
                        <i className="bi bi-receipt me-2"></i>Order Summary
                      </h5>
                    </div>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted">Subtotal:</span>
                        <span className="fw-bold fs-6">₱{subtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted">
                          Discount {discount > 0 && <span className="badge bg-success">({(discountRate * 100).toFixed(0)}% OFF)</span>}:
                        </span>
                        <span className="fw-bold text-danger">
                          {discount > 0 ? `-₱${discount.toFixed(2)}` : '₱0.00'}
                        </span>
                      </div>
                      
                      <hr className="my-3" />
                      
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <span className="fw-bold fs-5">Total:</span>
                        <span className="fw-bold text-success fs-4">
                          ₱{total.toFixed(2)}
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="alert alert-success py-2 mb-3">
                          <i className="bi bi-check-circle me-1"></i>
                          <small>You saved ₱{discount.toFixed(2)}!</small>
                        </div>
                      )}

                      <Link 
                        to="/user/checkout"
                        className="btn btn-success w-100 btn-lg mb-3 fw-bold"
                      >
                        <i className="bi bi-arrow-right-circle me-2"></i>
                        Checkout
                      </Link>

                      <div className="text-center mb-3">
                        <small className="text-muted">
                          <i className="bi bi-shield-check text-success me-1"></i>
                          Secure checkout
                        </small>
                      </div>

                      <hr className="my-3" />

                      <div className="text-center">
                        <p className="small text-muted mb-2 fw-bold">Accepted Payment Methods</p>
                        <div className="d-flex gap-3 align-items-center justify-content-center flex-wrap">
                          <div className="d-flex flex-column align-items-center gap-1">
                            <i className="bi bi-cash-coin text-success" style={{ fontSize: '2rem' }}></i>
                            <small className="text-muted">Cash on Delivery</small>
                          </div>
                          <div className="d-flex flex-column align-items-center gap-1">
                            <div className="d-flex align-items-center gap-1">
                              <span className="badge bg-danger rounded px-2 py-1">QR</span>
                              <span className="fw-bold text-primary" style={{ fontSize: '1.2rem' }}>Ph</span>
                            </div>
                            <small className="text-muted">QR Ph</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info Card */}
                  <div className="card border-0 shadow-sm bg-light">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-start gap-2">
                        <i className="bi bi-info-circle text-primary mt-1"></i>
                        <div>
                          <small className="text-muted">
                            <strong>Free delivery</strong> for orders above ₱500. 
                            Secure payment and easy returns available.
                          </small>
                        </div>
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

      {/* Modals */}
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