import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { toast } from 'react-hot-toast'
import { getLocationCoordinates } from '../../services/geocodingService'
import OrderReviewModal from '../../components/UserModals/OrderReviewModal.jsx'

export default function UserAccountOrdersPage() {
  const navigate = useNavigate()
  const { state } = useAppState()
  const { isLoggedIn } = state

  const [selectedOrderForMap, setSelectedOrderForMap] = useState(null)
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null)
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // Number of orders per page

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

  // Get authentication token
  const getAuthToken = () => {
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'auth_token' || name === 'token' || name === 'user_token') {
        return value
      }
    }
    return localStorage.getItem('token') || 
           localStorage.getItem('customerToken') || 
           localStorage.getItem('userToken')
  }

  // Geocode seller location to get coordinates
  const geocodeSellerLocation = async (province, municipality, barangay) => {
    if (!province || !municipality || !barangay) {
      return null
    }

    try {
      const result = await getLocationCoordinates(province, municipality, barangay)
      if (result && result.lat && result.lng) {
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lng),
          address: `Barangay ${barangay}, ${municipality}, ${province}`
        }
      }
    } catch (error) {
      console.error('Failed to geocode seller location:', error)
    }
    return null
  }

  // Load orders from database
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      
      if (!token) {
        console.log('❌ No auth token found')
        setOrders([])
        setLoading(false)
        return
      }

      console.log('📦 Loading orders from database...')
      
      const response = await fetch('http://localhost:8080/S2EH/s2e-backend/api/orders/index.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('✅ Response status:', response.status)

      const text = await response.text()
      console.log('📄 Response text:', text.substring(0, 500))

      const data = JSON.parse(text)
      console.log('✅ Orders response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders')
      }

      // Map database orders to component format
      const ordersData = data.data?.orders || data.orders || []
      
      console.log('📦 Raw orders from backend:', ordersData)
      if (ordersData.length > 0) {
        console.log('📦 First order raw data:', ordersData[0])
        console.log('📦 Shipping address fields:', {
          shipping_address_id: ordersData[0].shipping_address_id,
          shipping_address_line_1: ordersData[0].shipping_address_line_1,
          shipping_barangay: ordersData[0].shipping_barangay,
          shipping_municipality: ordersData[0].shipping_municipality,
          shipping_province: ordersData[0].shipping_province,
          shipping_address: ordersData[0].shipping_address
        })
        console.log('📦 Seller location fields:', {
          seller_barangay: ordersData[0].seller_barangay,
          seller_municipality: ordersData[0].seller_municipality,
          seller_province: ordersData[0].seller_province
        })
      }
      
      // Load reviews for all delivered orders
      const reviewsMap = {}
      const deliveredOrders = ordersData.filter(o => o.status === 'delivered')
      
      if (deliveredOrders.length > 0) {
        try {
          const reviewsPromises = deliveredOrders.map(async (order) => {
            try {
              const reviewsResponse = await fetch(`http://localhost:8080/S2EH/s2e-backend/api/reviews/?order_id=${order.id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                credentials: 'omit'
              })
              
              if (reviewsResponse.ok) {
                const reviewsData = await reviewsResponse.json()
                return {
                  orderId: order.id,
                  reviews: reviewsData.data?.reviews || reviewsData.reviews || {}
                }
              }
            } catch (error) {
              console.error(`Failed to load reviews for order ${order.id}:`, error)
            }
            return { orderId: order.id, reviews: {} }
          })
          
          const reviewsResults = await Promise.all(reviewsPromises)
          reviewsResults.forEach(({ orderId, reviews }) => {
            reviewsMap[orderId] = reviews
          })
        } catch (error) {
          console.error('Failed to load reviews:', error)
        }
      }

      const mappedOrders = await Promise.all(ordersData.map(async (order) => {
        // Format date
        const orderDate = new Date(order.created_at)
        const formattedDate = orderDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        // Get reviews for this order
        const orderReviews = reviewsMap[order.id] || {}

        // Map order items with seller locations and reviews
        const mappedItems = await Promise.all((order.items || []).map(async (item) => {
          // Build image URL
          let imageUrl = '/images/unknown.jpg' // Default
          if (item.product_image) {
            if (item.product_image.startsWith('http')) {
              imageUrl = item.product_image
            } else {
              imageUrl = `http://localhost:8080/S2EH/s2e-backend${item.product_image}`
            }
          }
          
          // Geocode seller location using address data from addresses table
          let sellerLocation = null
          if (item.seller_barangay && item.seller_municipality && item.seller_province) {
            sellerLocation = await geocodeSellerLocation(
              item.seller_province,
              item.seller_municipality,
              item.seller_barangay
            )
            // Store complete address for display
            if (sellerLocation) {
              sellerLocation.address = [
                item.seller_address_line_1,
                item.seller_barangay,
                item.seller_municipality || item.seller_city,
                item.seller_province,
                item.seller_postal_code
              ].filter(Boolean).join(', ')
            }
          }
          
          // Get review for this product if exists
          const productReview = orderReviews[item.product_id] || null
          
          return {
            product_id: item.product_id,
            product_title: item.product_title || 'Product',
            name: item.product_title || 'Product',
            seller: order.seller_name || 'Unknown Seller',
            sellerLocation: sellerLocation,
            quantity: parseInt(item.quantity || 1),
            price: parseFloat(item.unit_price || 0),
            image: imageUrl,
            product_image: item.product_image,
            sku: item.product_sku || null,
            review: productReview // Include review data if exists
          }
        }))

        // Determine available actions based on status and reviews
        let actions = []
        if (order.status === 'pending' || order.status === 'confirmed') {
          actions.push('Cancel Order')
        }
        // Removed 'Track Order' action - seller locations map is already displayed
        if (order.status === 'delivered') {
          // Only add "Rate & Review" if not all items have been reviewed
          const allItemsReviewed = mappedItems.every(item => item.review && item.review.rating > 0)
          if (!allItemsReviewed) {
            actions.push('Rate & Review')
          }
        }

        // Keep original status - no need to map, show actual status from backend
        let mappedStatus = order.status || 'pending'

        // Use shipping address from addresses table (already formatted by backend)
        const shippingAddress = order.shipping_address || null
        
        // Use seller address from addresses table (already formatted by backend)
        const sellerAddress = order.seller_address || null
        
        console.log('📦 Mapped order shipping address:', shippingAddress)
        console.log('📦 Mapped order seller address:', sellerAddress)

        return {
          id: order.order_number || `ORD-${order.id}`,
          date: formattedDate,
          status: mappedStatus,
          items: mappedItems,
          total: parseFloat(order.total || 0),
          actions: actions,
          orderId: order.id, // Store database ID for actions
          // Shipping address from addresses table
          shippingAddress: shippingAddress,
          // Seller address from addresses table
          sellerAddress: sellerAddress,
          // Geocode customer location for map display
          customerLocation: shippingAddress ? await geocodeCustomerAddress(shippingAddress).catch(() => null) : null
        }
      }))

      console.log('📦 Mapped orders:', mappedOrders)
      setOrders(mappedOrders)
    } catch (error) {
      console.error('❌ Failed to load orders:', error)
      toast.error(error.message || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load orders on mount only (no auto-refresh)
  useEffect(() => {
    loadOrders()
  }, []) // Empty dependency array - only run once on mount

  // Track Order Map Component - Shows customer and seller locations
  const TrackOrderMapComponent = ({ order }) => {
    const mapId = `track-map-${order.id}`
    const [mapError, setMapError] = useState(false)
    const [mapInitialized, setMapInitialized] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const initRef = useRef(false) // Track initialization to prevent loops

    // Reset states when order ID changes
    useEffect(() => {
      if (order?.id) {
        setMapInitialized(false)
        setMapError(false)
        setIsInitializing(false)
        initRef.current = false
      }
    }, [order?.id])

    useEffect(() => {
      // Don't run if already initialized or currently initializing
      if (mapInitialized || isInitializing || initRef.current) {
        return
      }
      
      if (!window.L) {
        console.warn('⚠️ Leaflet not loaded yet')
        setMapError(true)
        return
      }
      
      if (isMapLoading) {
        console.log('⏳ Waiting for Leaflet to load...')
        return
      }
      
      if (!order) {
        console.warn('⚠️ No order provided')
        return
      }
      
      // Check if map element exists
      const mapElement = document.getElementById(mapId)
      if (!mapElement) {
        console.warn('⚠️ Map element not found:', mapId)
        return
      }
      
      // Set ref to prevent duplicate initialization
      initRef.current = true
      setIsInitializing(true)
      console.log('🗺️ Starting map initialization for order:', order.id)
      
      const timer = setTimeout(() => {
        try {
          const mapElement = document.getElementById(mapId)
          if (!mapElement) return

          // Clean up existing map
          if (mapElement._leafletMap) {
            mapElement._leafletMap.remove()
          }

          // Get all locations (customer + sellers)
          const locations = []
          
          console.log('🗺️ Initializing track order map for order:', order.id)
          console.log('🗺️ Customer location:', order.customerLocation)
          console.log('🗺️ Order items:', order.items)
          
          // Add customer location
          if (order.customerLocation && order.customerLocation.lat && order.customerLocation.lng) {
            locations.push({
              ...order.customerLocation,
              type: 'customer',
              label: 'Your Delivery Address'
            })
            console.log('✅ Added customer location to map')
          } else {
            console.warn('⚠️ Customer location not available or invalid')
          }
          
          // Add seller locations from items
          order.items.forEach(item => {
            if (item.sellerLocation && item.sellerLocation.lat && item.sellerLocation.lng) {
              locations.push({
                ...item.sellerLocation,
                type: 'seller',
                label: item.seller || 'Seller'
              })
              console.log('✅ Added seller location to map:', item.seller)
            }
          })

          console.log('🗺️ Total locations:', locations.length)
          
          if (locations.length === 0) {
            console.error('❌ No valid locations found for tracking')
            setMapError(true)
            return
          }

          // Initialize map centered on first location
          const map = window.L.map(mapId, {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true
          }).setView([locations[0].lat, locations[0].lng], 10)

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map)

          // Create markers
          const markers = []
          locations.forEach(location => {
            const iconColor = location.type === 'customer' ? 'green' : 'blue'
            const iconHtml = `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`
            
            const customIcon = window.L.divIcon({
              html: iconHtml,
              className: 'custom-marker-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })

            const marker = window.L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map)
            marker.bindPopup(`
              <div style="min-width:200px;">
                <strong class="d-block mb-1">${location.label}</strong>
                <small class="text-muted">${location.address}</small>
              </div>
            `)
            markers.push(marker)
          })

          // Fit bounds to show all markers
          if (markers.length > 1) {
            const group = new window.L.featureGroup(markers)
            map.fitBounds(group.getBounds().pad(0.2))
          } else if (markers.length === 1) {
            map.setView([markers[0].getLatLng().lat, markers[0].getLatLng().lng], 13)
          }

          // Draw line between customer and seller if both exist
          if (order.customerLocation && order.items.some(item => item.sellerLocation)) {
            const sellerLoc = order.items.find(item => item.sellerLocation)?.sellerLocation
            if (sellerLoc) {
              const polyline = window.L.polyline(
                [
                  [order.customerLocation.lat, order.customerLocation.lng],
                  [sellerLoc.lat, sellerLoc.lng]
                ],
                {
                  color: 'red',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '10, 10'
                }
              ).addTo(map)
            }
          }

          mapElement._leafletMap = map
          
          // Only update state if component is still mounted and this is the current order
          const currentElement = document.getElementById(mapId)
          if (currentElement && currentElement._leafletMap === map) {
            setMapError(false)
            setMapInitialized(true)
            setIsInitializing(false)
            console.log('✅ Track order map initialized successfully for order:', order.id)
          } else {
            // Clean up if element changed
            if (map) map.remove()
            setIsInitializing(false)
            initRef.current = false
          }
        } catch (error) {
          console.error('❌ Error initializing track order map:', error)
          setMapError(true)
          setIsInitializing(false)
          initRef.current = false
        }
      }, 500)

      return () => {
        clearTimeout(timer)
        setIsInitializing(false)
      }
    }, [mapId, isMapLoading, order, mapInitialized, isInitializing])

    if (!order) return null

    if (isInitializing) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '500px', border: '1px solid #dee2e6', borderRadius: '8px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading map...</span>
            </div>
            <p className="text-muted">Loading tracking map...</p>
          </div>
        </div>
      )
    }

    if (mapError) {
      return (
        <div className="alert alert-warning d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <div>
            <strong>Unable to load map.</strong>
            <div className="small mt-1">
              {!order.customerLocation && !order.items.some(item => item.sellerLocation) ? (
                <span>Location data is not available for this order.</span>
              ) : (
                <span>Please check your internet connection and try again.</span>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div 
        id={mapId} 
        className="border rounded"
        style={{ 
          height: '500px', 
          width: '100%'
        }}
        role="img"
        aria-label="Tracking map showing customer and seller locations"
      ></div>
    )
  }

  const MapComponent = ({ items, orderId, customerLocation, shippingAddress }) => {
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
          let customerLoc = null
          
          // Use customerLocation if already geocoded, otherwise will geocode async below
          if (customerLocation && customerLocation.lat && customerLocation.lng) {
            customerLoc = customerLocation
          }
          
          // Add seller location markers (blue pins)
          items.forEach(item => {
            if (item.sellerLocation) {
              const sellerIcon = window.L.divIcon({
                html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                className: 'custom-marker-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
              
              const marker = window.L.marker([item.sellerLocation.lat, item.sellerLocation.lng], { icon: sellerIcon }).addTo(map)
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
          
          // Add customer marker if already geocoded
          if (customerLoc && customerLoc.lat && customerLoc.lng) {
            const customerIcon = window.L.divIcon({
              html: '<div style="background-color: green; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              className: 'custom-marker-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
            
            const customerMarker = window.L.marker([customerLoc.lat, customerLoc.lng], { icon: customerIcon }).addTo(map)
            const customerAddr = shippingAddress ? [
              shippingAddress.address_line_1,
              shippingAddress.barangay,
              shippingAddress.municipality || shippingAddress.city,
              shippingAddress.province,
              shippingAddress.postal_code
            ].filter(Boolean).join(', ') : customerLoc.address || 'Customer Location'
            
            customerMarker.bindPopup(`
              <div style="min-width:200px;">
                <strong class="d-block mb-1">Your Delivery Address</strong>
                <small class="text-muted">${customerAddr}</small>
              </div>
            `)
            markers.push(customerMarker)
          }
          
          // Geocode customer address async if not already geocoded
          if (!customerLoc && shippingAddress) {
            (async () => {
              try {
                console.log('📍 Geocoding customer address for map...')
                const loc = await geocodeCustomerAddress(shippingAddress)
                if (loc && loc.lat && loc.lng) {
                  const mapElement = document.getElementById(mapId)
                  if (!mapElement || !mapElement._leafletMap) return
                  
                  // Add customer marker to existing map
                  const customerIcon = window.L.divIcon({
                    html: '<div style="background-color: green; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                    className: 'custom-marker-icon',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })
                  
                  const customerMarker = window.L.marker([loc.lat, loc.lng], { icon: customerIcon }).addTo(mapElement._leafletMap)
                  const customerAddr = [
                    shippingAddress.address_line_1,
                    shippingAddress.barangay,
                    shippingAddress.municipality || shippingAddress.city,
                    shippingAddress.province,
                    shippingAddress.postal_code
                  ].filter(Boolean).join(', ')
                  
                  customerMarker.bindPopup(`
                    <div style="min-width:200px;">
                      <strong class="d-block mb-1">Your Delivery Address</strong>
                      <small class="text-muted">${customerAddr}</small>
                    </div>
                  `)
                  
                  // Draw line between customer and seller if seller exists
                  const allMarkers = [customerMarker]
                  items.forEach(item => {
                    if (item.sellerLocation) {
                      const existingMarkers = mapElement._leafletMap._layers
                      for (let layerId in existingMarkers) {
                        const layer = existingMarkers[layerId]
                        if (layer instanceof window.L.Marker && layer !== customerMarker) {
                          const sellerLatLng = layer.getLatLng()
                          if (Math.abs(sellerLatLng.lat - item.sellerLocation.lat) < 0.001 && 
                              Math.abs(sellerLatLng.lng - item.sellerLocation.lng) < 0.001) {
                            allMarkers.push(layer)
                            // Draw line
                            window.L.polyline(
                              [
                                [loc.lat, loc.lng],
                                [sellerLatLng.lat, sellerLatLng.lng]
                              ],
                              {
                                color: 'red',
                                weight: 3,
                                opacity: 0.7,
                                dashArray: '10, 10'
                              }
                            ).addTo(mapElement._leafletMap)
                            break
                          }
                        }
                      }
                    }
                  })
                  
                  // Refit bounds to include customer marker
                  if (allMarkers.length > 1) {
                    const group = new window.L.featureGroup(allMarkers)
                    mapElement._leafletMap.fitBounds(group.getBounds().pad(0.2))
                  }
                }
              } catch (err) {
                console.error('Failed to geocode customer address:', err)
              }
            })()
          }
          
          // Draw line between customer and seller if both already exist
          if (customerLoc && markers.length > 1) {
            const customerMarker = markers.find(m => {
              const latLng = m.getLatLng()
              return Math.abs(latLng.lat - customerLoc.lat) < 0.001 && 
                     Math.abs(latLng.lng - customerLoc.lng) < 0.001
            })
            const sellerMarker = markers.find(m => m !== customerMarker)
            
            if (customerMarker && sellerMarker) {
              window.L.polyline(
                [
                  [customerLoc.lat, customerLoc.lng],
                  [sellerMarker.getLatLng().lat, sellerMarker.getLatLng().lng]
                ],
                {
                  color: 'red',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '10, 10'
                }
              ).addTo(map)
            }
          }

          // Fit bounds to show all markers
          if (markers.length > 1) {
            const group = new window.L.featureGroup(markers)
            map.fitBounds(group.getBounds().pad(0.2))
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
    }, [items, mapId, isMapLoading, customerLocation, shippingAddress])

    if (mapError) {
      return (
        <div className="seller-locations-map mb-3">
          <h6 className="mb-2">
            <i className="bi bi-geo-alt me-2"></i>Order Locations
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
            <i className="bi bi-geo-alt me-2"></i>Order Locations
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
        <div className="d-flex gap-4 align-items-center mt-2">
          <div className="d-flex align-items-center">
            <div style={{ width: '12px', height: '12px', backgroundColor: 'green', borderRadius: '50%', marginRight: '8px' }}></div>
            <small className="text-muted">Your Delivery Address</small>
          </div>
            <div className="d-flex align-items-center">
              <div style={{ width: '12px', height: '12px', backgroundColor: 'blue', borderRadius: '50%', marginRight: '8px' }}></div>
              <small className="text-muted">Order Location</small>
            </div>
        </div>
      </div>
    )
  }

  // Orders are now loaded from database via loadOrders function
  // Display all orders (no filtering by status)
  const filteredOrders = orders
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)
  
  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top of orders list
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5 // Show max 5 page numbers
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2)
      let endPage = Math.min(totalPages, startPage + maxVisible - 1)
      
      // Adjust if near the end
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }
  
  // Reset to page 1 only when orders array is completely replaced (not on every length change)
  // Use a ref to track if this is a fresh load vs update
  const prevOrdersLengthRef = useRef(0)
  useEffect(() => {
    // Only reset to page 1 if orders significantly increased (likely a fresh load)
    // Don't reset on small changes to avoid disrupting pagination
    if (orders.length > 0 && prevOrdersLengthRef.current === 0) {
      // First load - reset to page 1
      setCurrentPage(1)
    }
    prevOrdersLengthRef.current = orders.length
  }, [orders.length])

  const getStatusBadge = (status) => {
    // Handle all possible statuses from backend
    switch (status) {
      case 'pending': return 'bg-warning'
      case 'confirmed': return 'bg-info'
      case 'processing': return 'bg-primary'
      case 'shipped': return 'bg-info'
      case 'delivered': return 'bg-success'
      case 'cancelled': return 'bg-danger'
      case 'refunded': return 'bg-secondary'
      default: return 'bg-secondary'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'PENDING'
      case 'confirmed': return 'CONFIRMED'
      case 'processing': return 'PROCESSING'
      case 'shipped': return 'SHIPPED'
      case 'delivered': return 'DELIVERED'
      case 'cancelled': return 'CANCELLED'
      case 'refunded': return 'REFUNDED'
      default: return status ? status.toUpperCase() : 'UNKNOWN'
    }
  }

  // Geocode customer shipping address
  const geocodeCustomerAddress = async (address) => {
    if (!address || !address.province || !address.municipality || !address.barangay) {
      return null
    }

    try {
      const result = await getLocationCoordinates(address.province, address.municipality, address.barangay)
      if (result && result.lat && result.lng) {
        const fullAddress = [
          address.address_line_1,
          address.address_line_2,
          `Barangay ${address.barangay}`,
          address.municipality,
          address.province,
          address.postal_code
        ].filter(Boolean).join(', ')
        
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lng),
          address: fullAddress
        }
      }
    } catch (error) {
      console.error('Failed to geocode customer address:', error)
    }
    return null
  }

  // Handle review submission
  const handleSubmitReviews = async (reviewData) => {
    try {
      const token = getAuthToken()
      
      const response = await fetch('http://localhost:8080/S2EH/s2e-backend/api/reviews/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviews: reviewData }),
        credentials: 'omit'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit reviews')
      }

      toast.success('Reviews submitted successfully!')
      // Refresh orders to update review status
      await loadOrders()
    } catch (error) {
      console.error('Error submitting reviews:', error)
      throw error
    }
  }

  const handleAction = async (action, orderId) => {
    const order = orders.find(o => o.id === orderId || o.orderId?.toString() === orderId?.toString())
    
    switch (action) {
      case 'Reorder': 
        alert(`Reordering items from ${orderId}`)
        break
      case 'Rate & Review': 
        if (order) {
          setSelectedOrderForReview(order)
          setShowReviewModal(true)
        }
        break
      case 'Cancel Order':
        if (window.confirm(`Are you sure you want to cancel order ${orderId}?`)) {
          alert(`Order ${orderId} has been cancelled`)
        }
        break
      case 'Track Order':
        if (order) {
          console.log('📍 Tracking order:', order.id)
          console.log('📍 Order shipping address:', order.shippingAddress)
          console.log('📍 Order sellerLocationData:', order.sellerLocationData)
          
          // Geocode customer address
          let customerLocation = null
          if (order.shippingAddress) {
            console.log('📍 Geocoding customer address...')
            customerLocation = await geocodeCustomerAddress(order.shippingAddress)
            console.log('📍 Customer location result:', customerLocation)
          } else {
            console.warn('⚠️ No shipping address found for order')
          }
          
          // Check if seller locations exist in items, if not, geocode from order-level sellerAddress (from addresses table)
          let hasSellerLocation = order.items.some(item => item.sellerLocation)
          
          if (!hasSellerLocation && order.sellerAddress && 
              order.sellerAddress.barangay && order.sellerAddress.municipality && order.sellerAddress.province) {
            console.log('📍 Geocoding seller location from addresses table...')
            const sellerLocation = await geocodeSellerLocation(
              order.sellerAddress.province,
              order.sellerAddress.municipality,
              order.sellerAddress.barangay
            )
            
            if (sellerLocation) {
              // Store complete address for display
              sellerLocation.address = [
                order.sellerAddress.address_line_1,
                order.sellerAddress.barangay,
                order.sellerAddress.municipality || order.sellerAddress.city,
                order.sellerAddress.province,
                order.sellerAddress.postal_code
              ].filter(Boolean).join(', ')
              
              // Add seller location to all items that don't have one
              order.items.forEach(item => {
                if (!item.sellerLocation) {
                  item.sellerLocation = sellerLocation
                }
              })
              hasSellerLocation = true
              console.log('✅ Added seller location to order items from addresses table')
            }
          }
          
          console.log('📍 Has seller location:', hasSellerLocation)
          console.log('📍 Order items:', order.items.map(item => ({
            seller: item.seller,
            hasLocation: !!item.sellerLocation,
            location: item.sellerLocation
          })))
          
          if (!customerLocation && !hasSellerLocation) {
            toast.error('Unable to track order: Location data not available')
            return
          }
          
          // Set order with locations for tracking map
          setSelectedOrderForTracking({
            ...order,
            customerLocation: customerLocation
          })
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

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading orders...</span>
              </div>
              <p className="text-muted mt-3">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders border rounded p-5 text-center">
              <div className="mb-4">
                <i className="bi bi-box-seam text-muted" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="text-muted mb-3">No orders found</h4>
              <p className="text-muted mb-4 fs-5">
                You haven't placed any orders yet.
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
                {paginatedOrders.map(order => (
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

                      {/* Map for Order Locations (Customer and Seller) - Show only when order is shipped */}
                      {order.status === 'shipped' && order.items.some(item => item.sellerLocation) && (
                        <MapComponent items={order.items} orderId={order.id} customerLocation={order.customerLocation} shippingAddress={order.shippingAddress} />
                      )}

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
                              {/* Show rating if reviewed */}
                              {order.status === 'delivered' && item.review && item.review.rating > 0 && (
                                <div className="mb-2">
                                  <div className="d-flex align-items-center">
                                    <div className="me-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                          key={star}
                                          className={`bi ${star <= item.review.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                                          style={{ fontSize: '0.9rem' }}
                                        />
                                      ))}
                                    </div>
                                    <small className="text-muted">
                                      {item.review.rating}.0
                                    </small>
                                  </div>
                                  {item.review.title && (
                                    <small className="text-muted d-block mt-1">
                                      "{item.review.title}"
                                    </small>
                                  )}
                                </div>
                              )}
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
                              case 'Reorder': return 'btn-success'
                              case 'Rate & Review': return 'btn-warning'
                              case 'Cancel Order': return 'btn-danger'
                              case 'Track Order': return 'btn-info'
                              default: return 'btn-outline-secondary'
                            }
                          }
                          
                          const getIcon = () => {
                            switch(action) {
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

              {/* Pagination - Only show if there are more than itemsPerPage orders */}
              {filteredOrders.length > itemsPerPage && (
                <div className="d-flex justify-content-center mt-5">
                  <nav aria-label="Orders pagination">
                    <ul className="pagination">
                      {/* Previous Button */}
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link px-3 py-2"
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          aria-label="Go to previous page"
                          style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                          <i className="bi bi-chevron-left me-2"></i>
                          Previous
                        </button>
                      </li>
                      
                      {/* Page Numbers */}
                      {getPageNumbers().map((pageNum) => (
                        <li 
                          key={pageNum} 
                          className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          <button
                            className="page-link px-3 py-2"
                            onClick={() => handlePageChange(pageNum)}
                            aria-label={`Go to page ${pageNum}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {pageNum}
                          </button>
                        </li>
                      ))}
                      
                      {/* Next Button */}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link px-3 py-2"
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          aria-label="Go to next page"
                          style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                          Next
                          <i className="bi bi-chevron-right ms-2"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                  
                  {/* Page Info */}
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                    </small>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Track Order Modal */}
      {selectedOrderForTracking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-truck me-2"></i>
                  Track Order - {selectedOrderForTracking.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrderForTracking(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {/* Order Info */}
                <div className="mb-4">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Order Information</h6>
                      <p className="mb-1"><strong>Order ID:</strong> {selectedOrderForTracking.id}</p>
                      <p className="mb-1"><strong>Date:</strong> {selectedOrderForTracking.date}</p>
                      <p className="mb-1">
                        <strong>Status:</strong>{' '}
                        <span className={`badge ${getStatusBadge(selectedOrderForTracking.status)}`}>
                          {getStatusText(selectedOrderForTracking.status)}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted mb-2">Locations</h6>
                      {selectedOrderForTracking.customerLocation && (
                        <p className="mb-1">
                          <i className="bi bi-geo-alt-fill text-success me-2"></i>
                          <strong>Delivery Address:</strong> {selectedOrderForTracking.customerLocation.address}
                        </p>
                      )}
                      {selectedOrderForTracking.items.some(item => item.sellerLocation) && (
                        <p className="mb-1">
                          <i className="bi bi-shop text-primary me-2"></i>
                          <strong>Seller Location:</strong> {selectedOrderForTracking.items.find(item => item.sellerLocation)?.sellerLocation?.address || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="mb-3">
                  <h6 className="mb-3">
                    <i className="bi bi-map me-2"></i>
                    Order Tracking Map
                  </h6>
                  <TrackOrderMapComponent order={selectedOrderForTracking} />
                </div>

                {/* Legend */}
                <div className="d-flex gap-4 align-items-center">
                  <div className="d-flex align-items-center">
                    <div style={{ width: '16px', height: '16px', backgroundColor: 'green', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', marginRight: '8px' }}></div>
                    <small>Your Delivery Address</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{ width: '16px', height: '16px', backgroundColor: 'blue', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', marginRight: '8px' }}></div>
                    <small>Order Location</small>
                  </div>
                  {selectedOrderForTracking.customerLocation && selectedOrderForTracking.items.some(item => item.sellerLocation) && (
                    <div className="d-flex align-items-center">
                      <div style={{ width: '30px', height: '3px', backgroundColor: 'red', opacity: 0.7, marginRight: '8px', borderStyle: 'dashed' }}></div>
                      <small>Delivery Route</small>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrderForTracking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Review Modal */}
      <OrderReviewModal
        show={showReviewModal}
        onClose={() => {
          setShowReviewModal(false)
          setSelectedOrderForReview(null)
        }}
        onSubmit={handleSubmitReviews}
        order={selectedOrderForReview}
      />
    </div>
  )
}

