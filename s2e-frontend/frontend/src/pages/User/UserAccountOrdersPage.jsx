import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'

export default function UserAccountOrdersPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { isLoggedIn } = state

  const [activeTab, setActiveTab] = useState('all')
  const [selectedOrderForMap, setSelectedOrderForMap] = useState(null)
  const [isMapLoading, setIsMapLoading] = useState(false)

  // Load Leaflet CSS and JS with proper error handling
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = 'anonymous'
          document.head.appendChild(link)
        }
        
        // Load JS
        if (!window.L && !document.querySelector('script[src*="leaflet.js"]')) {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
          script.crossOrigin = 'anonymous'
          script.onload = () => setIsMapLoading(false)
          script.onerror = () => {
            console.error('Failed to load Leaflet map library')
            setIsMapLoading(false)
          }
          document.head.appendChild(script)
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error)
        setIsMapLoading(false)
      }
    }

    loadLeaflet()
  }, [])

  const MapComponent = ({ items, orderId }) => {
    const mapId = `map-${orderId}`
    const [mapError, setMapError] = useState(false)

    useEffect(() => {
      if (!window.L || isMapLoading) return
      
      const timer = setTimeout(() => {
        try {
          const mapElement = document.getElementById(mapId)
          if (!mapElement) return

          // Clean up existing map
          if (mapElement._leafletMap) {
            mapElement._leafletMap.remove()
          }

          const map = window.L.map(mapId, {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true
          }).setView([13.5398, 123.4990], 13)

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map)

          const markers = []
          items.forEach(item => {
            if (item.sellerLocation) {
              const marker = window.L.marker([item.sellerLocation.lat, item.sellerLocation.lng]).addTo(map)
              marker.bindPopup(`
                <div class="text-center" style="min-width:200px;">
                  <strong class="d-block mb-1">${item.seller}</strong>
                  <span class="text-muted small d-block mb-1">${item.name}</span>
                  <small class="text-muted">${item.sellerLocation.address}</small>
                </div>
              `)
              markers.push(marker)
            }
          })

          if (markers.length > 1) {
            const group = new window.L.featureGroup(markers)
            map.fitBounds(group.getBounds().pad(0.1))
          } else if (markers.length === 1) {
            map.setView([markers[0].getLatLng().lat, markers[0].getLatLng().lng], 15)
          }

          mapElement._leafletMap = map
          setMapError(false)
        } catch (error) {
          console.error('Error initializing map:', error)
          setMapError(true)
        }
      }, 200)

      return () => {
        clearTimeout(timer)
        const mapElement = document.getElementById(mapId)
        if (mapElement && mapElement._leafletMap) {
          mapElement._leafletMap.remove()
          mapElement._leafletMap = null
        }
      }
    }, [items, mapId, isMapLoading])

    if (mapError) {
      return (
        <div className="seller-locations-map mb-3">
          <h6 className="mb-2">
            <i className="bi bi-geo-alt me-2"></i>Seller Locations
          </h6>
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <span>Unable to load map. Please check your internet connection.</span>
          </div>
        </div>
      )
    }

    return (
      <div className="seller-locations-map mb-3">
        <h6 className="mb-2">
          <i className="bi bi-geo-alt me-2"></i>Seller Locations
        </h6>
        {isMapLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px', border: '1px solid #dee2e6', borderRadius: '8px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading map...</span>
            </div>
          </div>
        ) : (
          <div 
            id={mapId} 
            className="border rounded"
            style={{ 
              height: '300px', 
              width: '100%'
            }}
            role="img"
            aria-label="Interactive map showing seller locations"
          ></div>
        )}
        <small className="text-muted mt-2 d-block">
          <i className="bi bi-info-circle me-1"></i>
          Click on markers to see seller details
        </small>
      </div>
    )
  }

  // Sample orders data
  const orders = [
    {
      id: 'ORD-2025-001',
      date: '23 January 18, 2025',
      status: 'delivered',
      items: [
        {
          name: 'Pili Nuts (250g)',
          seller: "Maria's Farm",
          sellerLocation: { lat: 13.5375, lng: 123.4982, address: "Barangay San Rafael, Sagnay, Camarines Sur" },
          quantity: 1,
          price: 180,
          image: '/images/unknown.jpg'
        },
        {
          name: 'Coconut Vinegar',
          seller: 'Bicol Essentials', 
          sellerLocation: { lat: 13.5421, lng: 123.5034, address: "Barangay Centro, Sagnay, Camarines Sur" },
          quantity: 1,
          price: 95,
          image: '/images/unknown.jpg'
        }
      ],
      total: 275,
      actions: ['View Details', 'Reorder', 'Rate & Review']
    },
    {
      id: 'ORD-2025-002',
      date: '23 January 12, 2025',
      status: 'shipped',
      items: [
        {
          name: 'Handwoven Basket',
          seller: 'Sagnay Crafts',
          sellerLocation: { lat: 13.5398, lng: 123.4965, address: "Barangay Mangcamagong, Sagnay, Camarines Sur" },
          quantity: 1,
          price: 350,
          image: '/images/unknown.jpg'
        },
        {
          name: 'Abaca Bag',
          seller: 'Bicol Crafts',
          sellerLocation: { lat: 13.5445, lng: 123.5012, address: "Barangay Nato, Sagnay, Camarines Sur" },
          quantity: 1,
          price: 450,
          image: '/images/unknown.jpg'
        }
      ],
      total: 800,
      actions: ['View Details', 'Track Order']
    },
    {
      id: 'ORD-2025-003',
      date: '23 January 15, 2025',
      status: 'pending',
      items: [
        {
          name: 'Organic Rice (5kg)',
          seller: 'Santos Family Farm',
          sellerLocation: { lat: 13.5356, lng: 123.4923, address: "Barangay Sabang, Sagnay, Camarines Sur" },
          quantity: 1,
          price: 320,
          image: '/images/unknown.jpg'
        }
      ],
      total: 320,
      actions: ['View Details', 'Cancel Order']
    }
  ]

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab)

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning'
      case 'shipped': return 'bg-info'
      case 'delivered': return 'bg-success'
      case 'cancelled': return 'bg-danger'
      default: return 'bg-secondary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'PENDING'
      case 'shipped': return 'SHIPPED'
      case 'delivered': return 'DELIVERED'
      case 'cancelled': return 'CANCELLED'
      default: return status.toUpperCase()
    }
  }

  const handleAction = (action, orderId) => {
    switch (action) {
      case 'View Details': alert(`View details for order ${orderId}`); break
      case 'Reorder': alert(`Reordering items from ${orderId}`); break
      case 'Rate & Review': alert(`Rate and review for ${orderId}`); break
      case 'Cancel Order':
        if (window.confirm(`Are you sure you want to cancel order ${orderId}?`)) {
          alert(`Order ${orderId} has been cancelled`)
        }
        break
      default: break
    }
  }

  return (
    <div>
      {/* Orders Header */}
      {/* Orders Tabs + List + Pagination */}
      <div className="orders-tabs bg-white border rounded mb-4 p-4">
        <div className="mb-3">
          <h2 className="mb-1">My Orders</h2>
          <p className="text-muted mb-0">Track and manage your orders</p>
        </div>
        <div className="d-flex gap-3">
          {['all','pending','shipped','delivered','cancelled'].map(tab => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'} px-4 py-2`}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: '15px',
                fontWeight: '500',
                minWidth: '140px',
                transition: 'all 0.3s ease',
                borderRadius: '8px'
              }}
              aria-pressed={activeTab === tab}
              role="tab"
            >
              <span className="d-flex align-items-center justify-content-center">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={`badge ms-2 ${
                  activeTab === tab ? 'bg-light text-primary' : 
                  tab === 'all' ? 'bg-secondary' : 
                  tab === 'pending' ? 'bg-warning' :
                  tab === 'shipped' ? 'bg-info' :
                  tab === 'delivered' ? 'bg-success' :
                  'bg-danger'
                }`}>
                  {orderCounts[tab]}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          {filteredOrders.length === 0 ? (
            <div className="no-orders border rounded p-5 text-center">
              <div className="mb-4">
                <i className="bi bi-box-seam text-muted" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="text-muted mb-3">No orders found</h4>
              <p className="text-muted mb-4 fs-5">
                {activeTab === 'all' ? "You haven't placed any orders yet." : `No ${activeTab} orders found.`}
              </p>
              <button 
                className="btn btn-primary btn-lg px-4 py-3" 
                onClick={() => navigate('/auth/products')}
                aria-label="Start shopping to place your first order"
                style={{ fontSize: '16px', fontWeight: '500' }}
              >
                <i className="bi bi-cart-plus me-2"></i>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {filteredOrders.map(order => (
                  <div key={order.id} className="col-12">
                    <div className="order-card bg-white border rounded p-4 shadow-sm">
                      {/* Order Header */}
                      <div className="order-header d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
                        <div>
                          <h5 className="mb-1">Order {order.id}</h5>
                          <p className="text-muted mb-0">{order.date}</p>
                        </div>
                        <div className="text-end">
                          <span className={`badge ${getStatusBadge(order.status)} mb-2 d-inline-block px-3 py-2`}>
                            {getStatusText(order.status)}
                          </span>
                          <div>
                            <span className="fw-bold fs-5">₱{order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Map for Shipped */}
                      {order.status === 'shipped' && <MapComponent items={order.items} orderId={order.id} />}

                      {/* Order Items */}
                      <div className="order-items">
                        {order.items.map((item,index) => (
                          <div key={index} className={`order-item d-flex align-items-center ${index < order.items.length-1 ? 'mb-4 pb-4 border-bottom' : 'mb-4'}`}>
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="item-image me-4 rounded flex-shrink-0" 
                              style={{ 
                                width:'80px', 
                                height:'80px', 
                                objectFit:'cover' 
                              }} 
                              loading="lazy"
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-2">{item.name}</h6>
                              <p className="text-muted mb-2">by {item.seller}</p>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Qty: {item.quantity}</span>
                                <span className="fw-bold fs-6">₱{item.price.toFixed(2)}</span>
                              </div>
                              {order.status === 'shipped' && item.sellerLocation && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-pin-map me-1"></i>
                                  {item.sellerLocation.address}
                                </small>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="order-actions d-flex gap-3 mt-4">
                        {order.actions.map((action,index) => {
                          const getButtonClass = () => {
                            switch(action) {
                              case 'View Details': return 'btn-primary'
                              case 'Reorder': return 'btn-success'
                              case 'Rate & Review': return 'btn-warning'
                              case 'Cancel Order': return 'btn-danger'
                              case 'Track Order': return 'btn-info'
                              default: return 'btn-outline-secondary'
                            }
                          }
                          
                          const getIcon = () => {
                            switch(action) {
                              case 'View Details': return 'bi-eye'
                              case 'Reorder': return 'bi-arrow-repeat'
                              case 'Rate & Review': return 'bi-star'
                              case 'Cancel Order': return 'bi-x-circle'
                              case 'Track Order': return 'bi-truck'
                              default: return 'bi-three-dots'
                            }
                          }
                          
                          return (
                            <button 
                              key={index} 
                              className={`btn ${getButtonClass()} px-4 py-2`}
                              onClick={() => handleAction(action, order.id)}
                              aria-label={`${action} for order ${order.id}`}
                              style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px)'
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = 'none'
                              }}
                            >
                              <i className={`bi ${getIcon()} me-2`}></i>
                              {action}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-center mt-5">
                <nav aria-label="Orders pagination">
                  <ul className="pagination">
                    <li className="page-item disabled">
                      <span className="page-link px-3 py-2" aria-disabled="true">
                        <i className="bi bi-chevron-left me-2"></i>
                        Previous
                      </span>
                    </li>
                    <li className="page-item active" aria-current="page">
                      <span className="page-link px-3 py-2">1</span>
                    </li>
                    <li className="page-item">
                      <a className="page-link px-3 py-2" href="#" aria-label="Go to page 2">2</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link px-3 py-2" href="#" aria-label="Go to page 3">3</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link px-3 py-2" href="#" aria-label="Go to next page">
                        Next
                        <i className="bi bi-chevron-right ms-2"></i>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

