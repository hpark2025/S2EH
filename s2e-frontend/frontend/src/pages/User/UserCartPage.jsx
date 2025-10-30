import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import UserFooter from '../../components/partials/UserFooter.jsx'
import { RemoveFromCartModal, ClearCartModal } from '../../components/UserModals'

export default function UserCartPage() {
  const { state } = useAppState()
  const { isLoggedIn } = state

  // States
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Modal state
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [itemToRemove, setItemToRemove] = useState(null)

  // Load cart from localStorage
  const loadCart = () => {
    try {
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
      setLoading(false)
    }
  }

  // Load cart on mount
  useEffect(() => {
    loadCart()
    
    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      console.log('🔄 Cart updated from another component, reloading...')
      loadCart()
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
      console.log('💾 Cart saved to localStorage:', cartItems)
      // Dispatch event to update cart badge
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }, [cartItems, loading])

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
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    setCartItems(items =>
      items.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
    )
  }

  const handleRemoveClick = (item) => {
    setItemToRemove(item)
    setShowRemoveModal(true)
  }

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      setCartItems(items => items.filter(i => i.id !== itemToRemove.id))
      setItemToRemove(null)
    }
    setShowRemoveModal(false)
  }

  const handleClearClick = () => {
    setShowClearModal(true)
  }

  const confirmClearCart = () => {
    setCartItems([])
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
            <div className="text-center">
              <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
              <h3 className="mt-3">Your basket is empty</h3>
              <p className="text-muted mb-4">Start shopping to add items to your basket</p>
              <Link
                to="/user/home"
                className="btn btn-primary"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="row">
              {/* Cart Items */}
              <div className="col-lg-8">
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Basket Items ({cartItems.length})</h5>
                    <div className="d-flex gap-2">
                      <Link
                        to="/user/home"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-arrow-left"></i> Continue Shopping
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleClearClick}
                      >
                        Clear Basket
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {cartItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`cart-item ${index < cartItems.length - 1 ? 'mb-4 pb-3 border-bottom' : ''}`}
                      >
                        <div className="row align-items-center">
                          <div className="col-md-2 col-4">
                            <img
                              src={(() => {
                                const img = item.thumbnail || item.image || item.images?.[0];
                                if (!img) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                                if (img.startsWith('http') || img.startsWith('data:')) return img;
                                return `http://localhost:8080/S2EH/s2e-backend${img}`;
                              })()}
                              alt={item.title}
                              className="img-fluid rounded"
                              onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E' }}
                            />
                          </div>

                          <div className="col-md-4 col-8">
                            <h5 className="mb-1">{item.title}</h5>
                            <p className="mb-1 text-muted small">
                              {item.seller_name ? `By: ${item.seller_name}` : 'Seller info unavailable'}
                            </p>
                            <span className="badge bg-success">LGU Validated</span>
                          </div>

                          <div className="col-md-2 col-4 mt-3 mt-md-0">
                            <p className="mb-0">₱{parseFloat(item.price).toFixed(2)}</p>
                            {item.originalPrice && (
                              <small className="text-muted text-decoration-line-through">
                                ₱{parseFloat(item.originalPrice).toFixed(2)}
                              </small>
                            )}
                          </div>

                          <div className="col-md-2 col-4 mt-3 mt-md-0">
                            <div className="quantity-selector d-flex align-items-center justify-content-center gap-1">
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                style={{ 
                                  minWidth: '30px', 
                                  height: '30px',
                                  padding: '0',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  lineHeight: '1'
                                }}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                value={item.quantity}
                                min="1"
                                max="99"
                                onChange={(e) =>
                                  updateQuantity(item.id, parseInt(e.target.value) || 1)
                                }
                                style={{ 
                                  width: '50px',
                                  height: '30px',
                                  fontSize: '0.9rem',
                                  fontWeight: '600'
                                }}
                              />
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{ 
                                  minWidth: '30px', 
                                  height: '30px',
                                  padding: '0',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  lineHeight: '1'
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="col-md-2 col-4 mt-3 mt-md-0 text-end">
                            <p className="mb-2 fw-bold">
                              ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveClick(item)}
                            >
                              <i className="bi bi-trash"></i> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary & Shipping Information */}
              <div className="col-lg-4 mt-4 mt-lg-0">
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  {/* Order Summary Card */}
                  <div className="card mb-3 shadow-sm">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">Order Summary</h5>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span className="fw-bold">₱{subtotal.toFixed(2)}</span>
                      </div>
                      {/* Shipping removed from summary */}
                      <div className="d-flex justify-content-between mb-3">
                        <span>Discount {discount > 0 && `(${(discountRate * 100).toFixed(0)}%)`}:</span>
                        <span className="fw-bold text-danger">
                          {discount > 0 ? `-₱${discount.toFixed(2)}` : '₱0.00'}
                        </span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between mb-4">
                        <span className="fw-bold">Total:</span>
                        <span className="fw-bold text-success" style={{ fontSize: '1.2rem' }}>
                          ₱{total.toFixed(2)}
                        </span>
                      </div>

                      <Link 
                        to="/user/checkout"
                        className="btn btn-success w-100 mb-3"
                      >
                        Proceed to Checkout <i className="bi bi-arrow-right"></i>
                      </Link>

                      <div className="d-flex gap-3 align-items-center justify-content-center">
                        <div className="d-flex align-items-center gap-1">
                          <i className="bi bi-cash-coin text-success" style={{ fontSize: '1.5rem' }}></i>
                          <small>Cash on Delivery</small>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <span className="badge bg-danger">QR</span>
                          <span className="fw-bold text-primary">Ph</span>
                          <small>QRph</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping information removed from cart page */}
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