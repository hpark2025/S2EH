import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { CheckoutAddAddressModal } from '../../components/UserModals'
import { toast } from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { getLocationCoordinates } from '../../services/geocodingService'
import { userCartAPI } from '../../services/userCartAPI'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function UserCheckoutPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { isLoggedIn } = state

  // Component state
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState('cod')
  const [showAddAddressModal, setShowAddAddressModal] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [addressCoordinates, setAddressCoordinates] = useState({})

  const loadCart = useCallback(async () => {
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
      
      console.log('📦 Checkout - Auth check - Token from cookie:', !!token)
      console.log('📦 Checkout - Auth check - Token from localStorage:', !!localStorageToken)
      console.log('📦 Checkout - Auth check - isLoggedIn state:', isLoggedIn)
      console.log('📦 Checkout - Auth check - hasAuth:', hasAuth)
      
      if (hasAuth) {
        // Load from database
        console.log('📦 Checkout - Loading cart from database...')
        try {
          const response = await userCartAPI.getCart()
          console.log('✅ Checkout - Database cart response:', response)
          
          // Handle response structure: response.data contains the cart data
          const cartData = response || {}
          const items = cartData.items || []
          
          console.log('📦 Checkout - Cart items array:', items)
          console.log('📦 Checkout - Items count:', items.length)
          
          if (items && Array.isArray(items) && items.length > 0) {
            // Map database items to cart format
            const mappedItems = items.map(item => {
              console.log('📦 Checkout - Mapping item:', item)
              
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
              
              console.log('📦 Checkout - Mapped item:', mappedItem)
              return mappedItem
            })
            
            console.log('📦 Checkout - Mapped cart items:', mappedItems)
            console.log('📦 Checkout - Setting cart items, count:', mappedItems.length)
            
            setCartItems(mappedItems)
            
            // Sync to localStorage for backward compatibility
            localStorage.setItem('cart', JSON.stringify(mappedItems))
            
            setLoading(false)
            return
          } else {
            console.log('📦 Checkout - No items in database cart or empty array')
            console.log('📦 Checkout - Items value:', items)
            setCartItems([])
            localStorage.setItem('cart', JSON.stringify([]))
            
            // Redirect to cart if cart is empty
            toast.error('Your cart is empty')
            navigate('/user/cart')
            setLoading(false)
            return
          }
        } catch (dbError) {
          console.error('❌ Checkout - Error loading from database, falling back to localStorage:', dbError)
          console.error('❌ Checkout - Error details:', dbError.message)
          // Fall through to localStorage loading
        }
      } else {
        console.log('📦 Checkout - User not logged in or no token, loading from localStorage')
      }
      
      // Fallback to localStorage
      console.log('📦 Checkout - Loading cart from localStorage...')
      const cartData = localStorage.getItem('cart')
      if (cartData) {
        const parsedCart = JSON.parse(cartData)
        console.log('📦 Checkout - Loaded cart from localStorage:', parsedCart)
        setCartItems(parsedCart)
        
        // Redirect to cart if cart is empty
        if (parsedCart.length === 0) {
          toast.error('Your cart is empty')
          navigate('/user/cart')
        }
      } else {
        console.log('📦 Checkout - No cart found in localStorage')
        toast.error('Your cart is empty')
        navigate('/user/cart')
      }
    } catch (error) {
      console.error('❌ Checkout - Failed to load cart:', error)
      toast.error('Failed to load cart')
      navigate('/user/cart')
    } finally {
      setLoading(false)
    }
  }, [navigate, isLoggedIn])

  // Geocode addresses to get coordinates using geocodingService
  const geocodeAddresses = async (addressList) => {
    const coordinates = {}
    
    for (const address of addressList) {
      try {
        console.log(`🗺️ Geocoding address ${address.id}: ${address.barangay}, ${address.municipality}, ${address.province}`)
        
        // Use geocodingService to get coordinates
        const result = await getLocationCoordinates(
          address.province,
          address.municipality,
          address.barangay
        )
        
        if (result && result.lat && result.lng) {
          coordinates[address.id] = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lng),
            zoom: result.zoom || 15
          }
          console.log(`✅ Geocoded address ${address.id}:`, coordinates[address.id])
        }
      } catch (error) {
        console.error(`❌ Failed to geocode address ${address.id}:`, error)
      }
    }
    
    setAddressCoordinates(coordinates)
  }

  // Load addresses from backend
  const loadAddresses = useCallback(async () => {
    console.log('🚀 loadAddresses called')
    try {
      setLoadingAddresses(true)
      const userId = localStorage.getItem('userId') || state.user?.id
      
      console.log('🔍 Loading addresses for user:', userId)
      console.log('📦 localStorage userId:', localStorage.getItem('userId'))
      console.log('👤 state.user:', state.user)
      
      if (!userId) {
        console.error('❌ No user ID found')
        setLoadingAddresses(false)
        return
      }

      const url = `http://localhost:8080/S2EH/s2e-backend/api/users/${userId}/addresses`
      console.log('📡 About to fetch from:', url)

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📥 Response received. Status:', response.status)

      if (response.ok) {
        const responseText = await response.text()
        console.log('📄 Raw response:', responseText.substring(0, 500))
        
        let data
        try {
          data = JSON.parse(responseText)
        } catch (e) {
          console.error('❌ JSON parse error:', e)
          console.error('❌ Response was:', responseText)
          throw new Error('Invalid JSON response from server')
        }
        
        console.log('✅ Addresses fetched from backend with embedded OpenStreetMap')
        console.log('📍 Loaded addresses:', data)
        
        if (data.success && data.data) {
          console.log(`✅ Found ${data.data.length} address(es)`)
          setAddresses(data.data)
          
          // Geocode all addresses
          geocodeAddresses(data.data)
          
          // Auto-select first address or default address
          const defaultAddr = data.data.find(addr => addr.is_default) || data.data[0]
          if (defaultAddr) {
            console.log('✅ Auto-selected address:', defaultAddr.id)
            setSelectedAddress(defaultAddr.id)
          }
        } else {
          console.log('⚠️ No addresses in response data')
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to load addresses. Status:', response.status)
        console.error('❌ Error response:', errorText)
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    } finally {
      setLoadingAddresses(false)
    }
  }, [state.user?.id])

  // Load cart and addresses on mount
  useEffect(() => {
    loadCart()
    loadAddresses()
  }, [loadCart, loadAddresses])

  const getProductImage = (item) => {
    if (item.thumbnail) {
      return item.thumbnail.startsWith('http') 
        ? item.thumbnail 
        : `http://localhost:8080/S2EH/s2e-backend${item.thumbnail}`
    }
    if (item.images && item.images.length > 0) {
      const image = item.images[0]
      return typeof image === 'string' 
        ? (image.startsWith('http') ? image : `http://localhost:8080/S2EH/s2e-backend${image}`)
        : image
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E'
  }

  // Format address for display
  const formatAddress = (address) => {
    const parts = []
    if (address.address_line_1) parts.push(address.address_line_1)
    if (address.address_line_2) parts.push(address.address_line_2)
    if (address.barangay) parts.push(`Barangay ${address.barangay}`)
    if (address.municipality) parts.push(address.municipality)
    if (address.province) parts.push(address.province)
    if (address.postal_code) parts.push(address.postal_code)
    return parts.join(', ')
  }

  // Calculations
  const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0)
  const deliveryFee = 0 // No delivery fee
  const serviceFee = 0 // No service fee for now
  const total = subtotal + serviceFee

  const handleAddressChange = (addressId) => {
    setSelectedAddress(addressId)
  }

  const handlePaymentChange = (paymentMethod) => {
    setSelectedPayment(paymentMethod)
  }

  const handlePlaceOrder = async () => {
    if (!selectedPayment || !selectedAddress) {
      alert('Please select a payment method and delivery address')
      return
    }

    setIsPlacingOrder(true)

    // Simulate order processing
    setTimeout(() => {
      const orderNumber = 'ORD-' + Date.now()
      alert(`Order placed successfully!\nOrder Number: ${orderNumber}\n\nYou will receive a confirmation email shortly.`)
      
      // Navigate to orders page or confirmation
      navigate('/auth/account/orders')
      setIsPlacingOrder(false)
    }, 2000)
  }

  const handleSaveAddress = (addressData) => {
    // Handle save new address
    console.log('New address:', addressData)
    alert('Address saved successfully!')
    setShowAddAddressModal(false)
  }

  const editAddress = (addressId) => {
    alert(`Edit address ${addressId} (This is a demo)`)
  }

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Debug log to verify new code is loaded
  console.log('🎯 CheckoutPage: ✅ DYNAMIC Addresses from DB + Map Display + GCash NOT AVAILABLE', new Date().toLocaleTimeString())
  console.log('✅ Addresses fetched from backend with embedded OpenStreetMap')

  return (
    <>
      {/* Add spacing for fixed navbar */}
      <div style={{ height: '90px' }}></div>

      <div className="container-fluid px-4">
        {/* Checkout Progress */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="checkout-progress bg-white border rounded p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="progress-step active">
                  <div className="step-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-check"></i>
                  </div>
                  <span className="step-label mt-2 d-block">Cart</span>
                </div>
                <div className="progress-line bg-primary flex-grow-1 mx-3" style={{ height: '2px' }}></div>
                <div className="progress-step active">
                  <div className="step-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-credit-card"></i>
                  </div>
                  <span className="step-label mt-2 d-block">Checkout</span>
                </div>
                <div className="progress-line bg-light flex-grow-1 mx-3" style={{ height: '2px' }}></div>
                <div className="progress-step">
                  <div className="step-icon bg-light text-muted rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <span className="step-label mt-2 d-block text-muted">Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Checkout Layout */}
        <div className="row g-4">
          {/* Left Side: Cards Stacked Vertically - Takes 8 columns */}
          <div className="col-lg-8 order-1" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Card 1: Delivery Information */}
            <div className="card shadow-sm mb-4" style={{ backgroundColor: '#ffffff', width: '100%' }}>
              <div className="card-body p-4">
                <h6 className="mb-4 fw-bold">
                  <i className="bi bi-truck me-2"></i>Delivery Information
                </h6>
                
                <label className="form-label fw-bold mb-3">Select Delivery Address</label>
                
                {/* Address Options */}
                <div className="mb-3">
                  {loadingAddresses ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading addresses...</span>
                      </div>
                      <p className="text-muted mt-2 small">Loading your addresses...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-geo-alt text-muted" style={{ fontSize: '2rem' }}></i>
                      <p className="text-muted mt-2">No saved addresses found</p>
                    </div>
                  ) : (
                    addresses.map((address) => {
                      return (
                        <div 
                          key={address.id} 
                          className={`form-check p-3 border rounded mb-3 ${selectedAddress === address.id ? 'border-primary bg-light' : ''}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleAddressChange(address.id)}
                        >
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="deliveryAddress" 
                            id={`address_${address.id}`}
                            value={address.id} 
                            checked={selectedAddress === address.id}
                            onChange={() => handleAddressChange(address.id)}
                          />
                          <label className="form-check-label w-100" htmlFor={`address_${address.id}`} style={{ cursor: 'pointer' }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1 fw-bold">{address.label || address.barangay || address.municipality || 'Home Address'}</h6>
                                <p className="text-muted mb-1 small">{formatAddress(address)}</p>
                                {address.is_default && (
                                  <span className="badge bg-primary mt-2">Default</span>
                                )}
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  editAddress(address.id)
                                }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            </div>
                            
                            {/* Leaflet Map Display */}
                            {addressCoordinates[address.id] && (
                              <div className="mt-2" style={{ height: '200px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
                                <MapContainer
                                  center={[addressCoordinates[address.id].lat, addressCoordinates[address.id].lng]}
                                  zoom={addressCoordinates[address.id].zoom || 15}
                                  style={{ height: '100%', width: '100%' }}
                                  dragging={false}
                                  zoomControl={false}
                                  scrollWheelZoom={false}
                                  doubleClickZoom={false}
                                  touchZoom={false}
                                >
                                  <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                  />
                                  <Marker position={[addressCoordinates[address.id].lat, addressCoordinates[address.id].lng]}>
                                    <Popup>
                                      {address.barangay && `Barangay ${address.barangay}, `}
                                      {address.municipality}, {address.province}
                                    </Popup>
                                  </Marker>
                                </MapContainer>
                              </div>
                            )}
                          </label>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Payment Method */}
            <div className="card shadow-sm mb-4" style={{ backgroundColor: '#ffffff', width: '100%' }}>
              <div className="card-body p-4">
                <h6 className="mb-3 fw-bold text-success">
                  <i className="bi bi-credit-card me-2"></i>Payment Method
                </h6>
                <div 
                  className={`form-check p-3 border rounded mb-3 ${selectedPayment === 'cod' ? 'border-primary bg-light' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePaymentChange('cod')}
                >
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="paymentMethod" 
                    id="cod" 
                    checked={selectedPayment === 'cod'}
                    onChange={() => handlePaymentChange('cod')}
                  />
                  <label className="form-check-label" htmlFor="cod">
                    <i className="bi bi-cash-coin text-success me-2"></i>
                    <strong>Cash on Delivery (COD)</strong>
                    <p className="text-muted mb-0 small">Pay when your order is delivered</p>
                  </label>
                </div>
                <div 
                  className="form-check p-3 border rounded"
                  style={{ cursor: 'not-allowed' }}
                >
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    name="paymentMethod" 
                    id="gcash"
                    disabled
                    checked={false}
                  />
                  <label className="form-check-label" htmlFor="gcash" style={{ cursor: 'not-allowed' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="text-primary">GCash</strong>
                        <p className="text-muted mb-0 small">Pay securely with your GCash account</p>
                      </div>
                      <span className="badge bg-danger">NOT AVAILABLE</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary - Takes 4 columns */}
          <div className="col-lg-4 order-2">
            <div className="card shadow p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="mb-4 fw-bold">
                <i className="bi bi-receipt me-2"></i>Order Summary
              </h5>

              {/* Order Items */}
              <div className="order-items mb-4">
                {cartItems.map((item, index) => (
                  <div key={item.id} className={`order-item d-flex align-items-center ${index < cartItems.length - 1 ? 'mb-3 pb-3 border-bottom' : 'mb-3'}`}>
                    <img 
                      src={getProductImage(item)} 
                      alt={item.title} 
                      className="item-image me-3 rounded"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="10" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E'
                      }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{item.title}</h6>
                      <p className="text-muted mb-1 small">{item.sku || 'SKU-N/A'}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Qty: {item.quantity}</span>
                        <span className="fw-bold">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                {serviceFee > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Service Fee</span>
                    <span>₱{serviceFee.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold fs-5">Total</span>
                  <span className="fw-bold fs-5 text-success">₱{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                type="button" 
                className="btn btn-success w-100 btn-lg" 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <i className="bi bi-bag-check me-2"></i>Place Order
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="security-notice mt-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  <small className="text-muted">Your payment information is secure and encrypted</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <CheckoutAddAddressModal
        show={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSave={handleSaveAddress}
      />

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
