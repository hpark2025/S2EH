import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import UserFooter from '../../components/partials/UserFooter.jsx'
import { RemoveFromCartModal, ClearCartModal } from '../../components/UserModals'
import { userCartAPI } from '../../services/userCartAPI.js'

export default function UserCartPage() {
  const { state } = useAppState()
  const { isLoggedIn } = state

  // States - using static data for visualization
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(false)
  
  // Modal state
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [itemToRemove, setItemToRemove] = useState(null)
  
  // Checkbox selection state
  const [selectedItems, setSelectedItems] = useState({})
  const [selectAll, setSelectAll] = useState(false)
  
  // Static cart data for visualization matching the screenshot
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod-001',
      title: 'Organic Pili Nuts (250g)',
      price: 180,
      quantity: 2,
      thumbnail: '/images/unknown.jpg',
      seller_name: "Maria's Farm",
      sku: 'PILI-250G'
    },
    {
      id: 'prod-002',
      title: 'Fresh Tilapia (1kg)',
      price: 150,
      quantity: 1,
      thumbnail: '/images/unknown.jpg',
      seller_name: 'Sagnay Fisheries',
      sku: 'FISH-TLP-1KG'
    },
    {
      id: 'prod-003',
      title: 'Handwoven Basket (Medium)',
      price: 350,
      quantity: 1,
      thumbnail: '/images/unknown.jpg',
      seller_name: 'Sagnay Crafts',
      sku: 'CRAFT-BSK-M'
    }
  ])

  // Simplified loadCart function for static demo
  const loadCart = () => {
    // We're using static data, so we just need to simulate loading
    setLoading(true)
    
    // Simulate a brief loading time
    setTimeout(() => {
      setLoading(false)
      setIsInitialLoad(false)
      // Static data is already set in the state
    }, 500)
  }

  // Load cart on mount
  useEffect(() => {
    loadCart()
  }, [])
  
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
      console.log('🔄 Cart updated from another component')
      // For static demo, we don't need to reload
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
  
  // Calculate totals for all items
  const allItemsSubtotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price) || 0
    return total + (price * item.quantity)
  }, 0)
  
  // Calculate totals for selected items only
  const selectedItemsSubtotal = cartItems.reduce((total, item) => {
    if (selectedItems[item.id]) {
      const price = parseFloat(item.price) || 0
      return total + (price * item.quantity)
    }
    return total
  }, 0)
  
  // Use selected items total if any are selected, otherwise use all items total
  const subtotal = selectedCount > 0 ? selectedItemsSubtotal : allItemsSubtotal
  
  // No discount applied
  const total = subtotal

  // Simplified quantity handlers for static demo
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    
    // Update local state immediately for UI feedback
    setCartItems(items =>
      items.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item))
    )
    
    // Dispatch event to update cart badge
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemoveClick = (item) => {
    setItemToRemove(item)
    setShowRemoveModal(true)
  }

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      // Remove from local state immediately
      setCartItems(items => items.filter(i => i.id !== itemToRemove.id))
      
      // Dispatch event to update cart badge
      window.dispatchEvent(new Event('cartUpdated'))
      setItemToRemove(null)
    }
    setShowRemoveModal(false)
  }

  const handleClearClick = () => {
    setShowClearModal(true)
  }

  const confirmClearCart = () => {
    // Clear local state immediately
    setCartItems([])
    
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
                      // Customize data to match the screenshot
                      let sku = '';
                      let priceLabel = '';
                      
                      if (index === 0) {
                        sku = 'PILI-250G';
                        priceLabel = '₱180.00';
                      } else if (index === 1) {
                        sku = 'FISH-TLP-1KG';
                        priceLabel = '₱150.00';
                      } else {
                        sku = 'CRAFT-BSK-M';
                        priceLabel = '₱350.00';
                      }
                      
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
                      <div className="alert alert-secondary mb-3 py-2" role="alert">
                        <small><i className="bi bi-info-circle me-1"></i> Showing total for all items</small>
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
                          onClick={() => alert(`Checkout with ${selectedCount} selected items for ₱${selectedItemsSubtotal.toFixed(2)}`)}
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
                      <Link 
                        to="/user/checkout"
                        className="btn btn-success w-100 mb-3"
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
                        onMouseDown={(e) => {
                          e.currentTarget.style.backgroundColor = '#0A3D12';
                          e.currentTarget.style.borderColor = '#0A3D12';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.backgroundColor = '#1B5E20';
                          e.currentTarget.style.borderColor = '#1B5E20';
                        }}
                    >
                      Proceed to Checkout
                    </Link>
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