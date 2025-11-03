import { useState, useMemo, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { 
  EditOrderModal, 
  ViewOrderModal, 
  UpdateStatusModal, 
  CancelOrderModal, 
  ProcessRefundModal 
} from '../../components/AdminModals/AdminOrdersPage'
import usePagination from '../../components/Pagination'
import { adminAPI } from '../../services/adminAPI'
import { getLocationCoordinates } from '../../services/geocodingService'

// Import for Excel export
import * as XLSX from 'xlsx'
// Import for PDF export 
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Export utility functions
const exportToExcel = (data, filename = 'orders') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data.map(order => ({
      'Order ID': order.order_number || order.id,
      'Customer Name': order.customer.name,
      'Customer Phone': order.customer.phone,
      'Main Product': order.products.main,
      'Additional Items': order.products.additional,
      'Amount': `₱${order.amount}`,
      'Quantity': order.quantity || 0,
      'Status': order.status,
      'Payment': order.payment,
      'Date': order.date,
      'Delivery Type': order.deliveryType
    })))
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
    alert('Excel file downloaded successfully!')
  } catch (error) {
    console.error('Excel export error:', error)
    alert('Failed to export Excel file')
  }
}

const exportToCSV = (data, filename = 'orders') => {
  try {
    const csvData = data.map(order => ({
      'Order ID': order.order_number || order.id,
      'Customer Name': order.customer.name,
      'Customer Phone': order.customer.phone,
      'Main Product': order.products.main,
      'Additional Items': order.products.additional,
      'Amount': `₱${order.amount}`,
      'Quantity': order.quantity || 0,
      'Status': order.status,
      'Payment': order.payment,
      'Date': order.date,
      'Delivery Type': order.deliveryType
    }))
    
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const csv = XLSX.utils.sheet_to_csv(worksheet)
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert('CSV file downloaded successfully!')
  } catch (error) {
    console.error('CSV export error:', error)
    alert('Failed to export CSV file')
  }
}

const exportToPDF = (data, filename = 'orders') => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('Orders Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32)
    
    // Prepare table data
    const tableData = data.map(order => [
      order.order_number || order.id,
      order.customer.name,
      order.products.main,
      `₱${order.amount}`,
      order.quantity || 0,
      order.status,
      order.payment,
      order.date
    ])
    
    // Add table using autoTable
    if (doc.autoTable) {
      doc.autoTable({
        head: [['Order ID', 'Customer', 'Main Product', 'Amount', 'Quantity', 'Status', 'Payment', 'Date']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [44, 133, 63] },
        margin: { top: 40 }
      })
    } else {
      // Fallback if autoTable is not available
      let yPosition = 50
      doc.setFontSize(8)
      
      // Add header
      const headers = ['Order ID', 'Customer', 'Main Product', 'Amount', 'Quantity', 'Status', 'Payment', 'Date']
      let xPosition = 14
      headers.forEach(header => {
        doc.text(header, xPosition, yPosition)
        xPosition += 27
      })
      
      yPosition += 10
      
      // Add data rows
      tableData.forEach(row => {
        xPosition = 14
        row.forEach(cell => {
          doc.text(String(cell), xPosition, yPosition)
          xPosition += 27
        })
        yPosition += 8
        
        // Add new page if needed
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
      })
    }
    
    doc.save(`${filename}.pdf`)
    alert('PDF file downloaded successfully!')
  } catch (error) {
    console.error('PDF export error:', error)
    alert('Failed to export PDF file. Error: ' + error.message)
  }
}

const copyToClipboard = (data) => {
  try {
    const tableText = data.map(order => 
      `${order.order_number || order.id}\t${order.customer.name}\t${order.products.main}\t₱${order.amount}\t${order.quantity || 0}\t${order.status}\t${order.payment}\t${order.date}`
    ).join('\n')
    
    const header = 'Order ID\tCustomer\tMain Product\tAmount\tQuantity\tStatus\tPayment\tDate\n'
    const fullText = header + tableText
    
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Table data copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy: ', err)
      alert('Failed to copy data to clipboard')
    })
  } catch (error) {
    console.error('Copy to clipboard error:', error)
    alert('Failed to copy data to clipboard')
  }
}

const printTable = (data) => {
  try {
    const printWindow = window.open('', '_blank')
    const tableRows = data.map(order => `
      <tr>
        <td>${order.order_number || order.id}</td>
        <td>${order.customer.name}</td>
        <td>${order.products.main}</td>
        <td>₱${order.amount}</td>
        <td>${order.quantity || 0}</td>
        <td>${order.status}</td>
        <td>${order.payment}</td>
        <td>${order.date}</td>
      </tr>
    `).join('')
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2c853f; margin-bottom: 10px; }
          .timestamp { color: #666; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #2c853f; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          @media print {
            body { margin: 0; }
            table { font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <h1>Orders Report</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Main Product</th>
              <th>Amount</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  } catch (error) {
    console.error('Print error:', error)
    alert('Failed to print table')
  }
}

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMapLoading, setIsMapLoading] = useState(false)
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null)

  const [showEditModal, setShowEditModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        setIsMapLoading(true)
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
        } else if (window.L) {
          setIsMapLoading(false)
        }
      } catch (error) {
        console.error('Error loading Leaflet:', error)
        setIsMapLoading(false)
      }
    }

    loadLeaflet()
  }, [])

  // Geocode customer address - uses geocodingService
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
          address.barangay,
          address.municipality || address.city,
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

  // Geocode seller location - uses geocodingService
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

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      console.log('📦 Loading admin orders from database...')
      
      const response = await adminAPI.orders.getAll()
      
      // Extract orders from response
      const ordersData = response.data?.orders || response.orders || []
      console.log('📦 Raw orders data:', ordersData)
      
      // Map backend order structure to component format
      const mappedOrders = await Promise.all(ordersData.map(async (order) => {
        // Format customer name
        const firstName = (order.first_name && order.first_name.trim()) || ''
        const lastName = (order.last_name && order.last_name.trim()) || ''
        const customerName = `${firstName} ${lastName}`.trim() || 'Unknown Customer'
        
        // Format order items with seller locations
        // Backend should now include seller address data in items for admin orders
        const items = await Promise.all((order.items || []).map(async (item) => {
          // Geocode seller location if available
          let sellerLocation = null
          
          // Backend should include seller address data in item
          if (item.seller_barangay && item.seller_municipality && item.seller_province) {
            console.log('📍 Geocoding seller location for item:', {
              barangay: item.seller_barangay,
              municipality: item.seller_municipality,
              province: item.seller_province
            })
            
            sellerLocation = await geocodeSellerLocation(
              item.seller_province,
              item.seller_municipality,
              item.seller_barangay
            )
            
            if (sellerLocation) {
              sellerLocation.address = [
                item.seller_address_line_1,
                item.seller_barangay,
                item.seller_municipality || item.seller_city,
                item.seller_province,
                item.seller_postal_code
              ].filter(Boolean).join(', ')
              console.log('✅ Seller location geocoded:', sellerLocation)
            } else {
              console.warn('⚠️ Failed to geocode seller location')
            }
          } else {
            console.warn('⚠️ Missing seller address data in item:', {
              has_barangay: !!item.seller_barangay,
              has_municipality: !!item.seller_municipality,
              has_province: !!item.seller_province
            })
          }
          
          return {
            ...item,
            sellerLocation: sellerLocation,
            seller: item.seller_name || order.seller_name || 'Seller'
          }
        }))
        
        const mainProduct = items.length > 0 ? items[0].product_title || 'Product' : 'No items'
        const additionalItems = items.length > 1 ? `${items.length - 1} more item(s)` : ''
        
        // Format date
        const orderDate = order.created_at 
          ? new Date(order.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          : ''
        
        // Format payment status - all orders are COD only
        const paymentStatus = 'COD'
        
        // Use order_number as the primary identifier (Order ID)
        const orderNumber = order.order_number || `ORD-${order.id}`
        
        // Get shipping address and geocode customer location
        const shippingAddress = order.shipping_address || null
        console.log('📦 Order shipping address:', shippingAddress)
        
        let customerLocation = null
        if (shippingAddress) {
          console.log('📍 Geocoding customer address...')
          customerLocation = await geocodeCustomerAddress(shippingAddress).catch((err) => {
            console.error('❌ Failed to geocode customer address:', err)
            return null
          })
          console.log('📍 Customer location geocoded:', customerLocation)
        } else {
          console.warn('⚠️ No shipping address found for order')
        }
        
        // Check if we have any locations
        const hasSellerLocation = items.some(item => item.sellerLocation)
        console.log('📍 Location check:', {
          hasCustomerLocation: !!customerLocation,
          hasSellerLocation: hasSellerLocation,
          itemCount: items.length
        })
        
        // Calculate total quantity from items
        const totalQuantity = items.reduce((sum, item) => {
          return sum + (parseInt(item.quantity || 0))
        }, 0)

        return {
          id: order.id, // Keep id for React key and internal use
          order_number: orderNumber, // This is what will be displayed as Order ID
          customer: {
            name: customerName,
            phone: order.customer?.phone || '',
            email: order.customer_email || ''
          },
          products: {
            main: mainProduct,
            additional: additionalItems,
            items: items // Keep full items array for modals
          },
          amount: parseFloat(order.total || 0),
          quantity: totalQuantity, // Total quantity of all items in the order
          status: order.status || 'pending',
          payment: paymentStatus, // Always 'COD'
          date: orderDate,
          deliveryType: order.delivery_type || 'Standard',
          seller_name: order.seller_name || '',
          // Keep original data for modals
          original: order,
          // Location data for tracking
          items: items, // Items with seller locations
          customerLocation: customerLocation,
          shippingAddress: shippingAddress
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
  }

  const filteredOrders = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      // If no search term, return all orders filtered by status only
      return orders.filter(order => {
        return selectedStatus === 'all' || order.status === selectedStatus
      })
    }
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    return orders.filter(order => {
      // Primary search: order number
      const orderNumber = String(order.order_number || order.id || '')
      const matchesSearch = 
        orderNumber.toLowerCase().includes(searchLower) ||
        (order.customer?.name || '').toLowerCase().includes(searchLower) ||
        (order.customer?.email || '').toLowerCase().includes(searchLower) ||
        (order.products?.main || '').toLowerCase().includes(searchLower) ||
        (order.seller_name || '').toLowerCase().includes(searchLower)
      
      const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
      
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, selectedStatus])

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      completed: orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    }
  }, [orders])

  const totalRevenue = orders
    .filter(o => o.status === 'delivered' || o.status === 'completed')
    .reduce((sum, o) => sum + (o.amount || 0), 0)

  // Use pagination hook
  const { currentItems: paginatedOrders, pagination } = usePagination({ 
    data: filteredOrders,
    itemsPerPageOptions: [5, 10, 15, 25],
    defaultItemsPerPage: 3 // Reduced to make pagination visible
  })

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'status-active'
      case 'processing': return 'status-pending'
      case 'shipped': return 'status-info'
      case 'pending': return 'status-warning'
      case 'cancelled': return 'status-danger'
      default: return 'status-secondary'
    }
  }

  const getPaymentBadgeClass = (payment) => {
    switch (payment.toLowerCase()) {
      case 'cod':
      case 'cash on delivery': return 'status-active'
      case 'paid': return 'status-active'
      case 'pending': return 'status-warning'
      case 'refunded': return 'status-info'
      default: return 'status-active' // Default to active since all are COD
    }
  }

  const handleEditOrder = (order) => {
    setSelectedOrder(order)
    setShowEditModal(true)
  }

  const handleCancelOrder = (order) => {
    setSelectedOrder(order)
    setShowCancelModal(true)
  }

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order)
    setShowUpdateStatusModal(true)
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
  }

  const handleRefundOrder = (order) => {
    setSelectedOrder(order)
    setShowRefundModal(true)
  }

  const handleTrackOrder = (order) => {
    // Set the order for tracking modal
    setSelectedOrderForTracking(order)
  }

  const handleConfirmPayment = (order) => {
    // Handle payment confirmation
    console.log('Confirm payment for order:', order.id)
  }

  // Track Order Map Component - Shows customer and seller locations
  const TrackOrderMapComponent = ({ order }) => {
    const mapId = `track-map-${order.id}`
    const [mapError, setMapError] = useState(false)
    const [mapInitialized, setMapInitialized] = useState(false)
    const [isInitializing, setIsInitializing] = useState(false)
    const initRef = useRef(false)

    useEffect(() => {
      if (order?.id) {
        setMapInitialized(false)
        setMapError(false)
        setIsInitializing(false)
        initRef.current = false
      }
    }, [order?.id])

    // Invalidate map size when modal becomes visible (after map is initialized)
    useEffect(() => {
      if (mapInitialized && !isInitializing) {
        const mapElement = document.getElementById(mapId)
        if (mapElement && mapElement._leafletMap) {
          // Small delay to ensure modal transition is complete
          const timer = setTimeout(() => {
            if (mapElement._leafletMap && !mapElement._leafletMap._removed) {
              mapElement._leafletMap.invalidateSize()
              console.log('✅ Map size invalidated after modal open for order:', order.id)
            }
          }, 300)
          return () => clearTimeout(timer)
        }
      }
    }, [mapInitialized, isInitializing, mapId, order?.id])

    useEffect(() => {
      // Early returns - don't proceed if already initialized/initializing
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
      
      // Set flags immediately to prevent re-runs
      initRef.current = true
      setIsInitializing(true)
      console.log('🗺️ Starting map initialization for order:', order.id)
      
      // Poll for map element with retries
      let attempts = 0
      const maxAttempts = 30 // Try for up to 6 seconds (30 * 200ms)
      const timeoutIds = [] // Track all timeout IDs for cleanup
      
      const tryInitializeMap = () => {
        attempts++
        console.log(`🗺️ Attempt ${attempts} to find map element:`, mapId)
        
        const mapElement = document.getElementById(mapId)
        if (!mapElement) {
          console.warn(`⚠️ Map element not found (attempt ${attempts}/${maxAttempts})`)
          if (attempts < maxAttempts) {
            const id = setTimeout(tryInitializeMap, 200)
            timeoutIds.push(id)
            return
          } else {
            console.error('❌ Map element not found after all attempts')
            setIsInitializing(false)
            initRef.current = false
            setMapError(true)
            return
          }
        }
        
        console.log('🗺️ Map element found:', mapElement)
        
        // Check if element is visible and has dimensions
        const rect = mapElement.getBoundingClientRect()
        console.log('🗺️ Map element bounding rect:', { width: rect.width, height: rect.height, top: rect.top, left: rect.left })
        
        if (rect.width === 0 || rect.height === 0) {
          console.warn(`⚠️ Map element has zero dimensions (attempt ${attempts}/${maxAttempts})`)
          if (attempts < maxAttempts) {
            const id = setTimeout(tryInitializeMap, 200)
            timeoutIds.push(id)
            return
          } else {
            console.error('❌ Map element has zero dimensions after all attempts')
            setIsInitializing(false)
            initRef.current = false
            setMapError(true)
            return
          }
        }
        
        // Element exists and has dimensions, proceed with initialization
        // Store reference to the found element
        const foundMapElement = mapElement
        setTimeout(() => {
          try {
            const mapElement = document.getElementById(mapId)
            if (!mapElement) {
              console.error('❌ Map element disappeared')
              setIsInitializing(false)
              initRef.current = false
              return
            }
            
            // Use the found element
            const elementToUse = mapElement || foundMapElement
            if (!elementToUse) {
              console.error('❌ Map element not available')
              setIsInitializing(false)
              initRef.current = false
              return
            }

            if (elementToUse._leafletMap) {
              console.log('🗺️ Removing existing map instance')
              elementToUse._leafletMap.remove()
            }

            const locations = []
            
            console.log('🗺️ Initializing track order map for order:', order.id)
            console.log('🗺️ Customer location:', order.customerLocation)
            console.log('🗺️ Order items:', order.items)
            
            if (order.customerLocation && order.customerLocation.lat && order.customerLocation.lng) {
              locations.push({
                ...order.customerLocation,
                type: 'customer',
                label: 'Customer Delivery Address'
              })
              console.log('✅ Added customer location to map')
            }
            
            if (order.items) {
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
            }

            console.log('🗺️ Total locations:', locations.length)
            
            if (locations.length === 0) {
              console.error('❌ No valid locations found for tracking')
              setMapError(true)
              setIsInitializing(false)
              initRef.current = false
              return
            }

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
                  <small class="text-muted">${location.address || ''}</small>
                </div>
              `)
              markers.push(marker)
            })

            if (markers.length > 1) {
              const group = new window.L.featureGroup(markers)
              map.fitBounds(group.getBounds().pad(0.2))
            } else if (markers.length === 1) {
              map.setView([markers[0].getLatLng().lat, markers[0].getLatLng().lng], 13)
            }

            if (order.customerLocation && order.items && order.items.some(item => item.sellerLocation)) {
              const sellerLoc = order.items.find(item => item.sellerLocation)?.sellerLocation
              if (sellerLoc) {
                window.L.polyline(
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

            elementToUse._leafletMap = map
            
            // Wait a bit longer to ensure modal is fully visible, then invalidate size
            setTimeout(() => {
              if (map && !map._removed) {
                map.invalidateSize()
                console.log('✅ Map size invalidated for order:', order.id)
              }
            }, 100)
            
            const currentElement = document.getElementById(mapId)
            if (currentElement && currentElement._leafletMap === map) {
              setMapError(false)
              setMapInitialized(true)
              setIsInitializing(false)
              console.log('✅ Track order map initialized successfully for order:', order.id)
            } else {
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
        }, 300) // Small delay to ensure DOM is stable
      }
      
      // Start polling for map element
      const initialTimer = setTimeout(() => {
        tryInitializeMap()
      }, 300) // Initial delay before first attempt
      timeoutIds.push(initialTimer)

      return () => {
        // Clear all timeouts
        timeoutIds.forEach(id => clearTimeout(id))
        setIsInitializing(false)
        initRef.current = false
      }
    }, [mapId, isMapLoading, order]) // Removed mapInitialized and isInitializing from dependencies

    if (!order) return null

    return (
      <div style={{ position: 'relative', width: '100%', height: '500px' }}>
        {/* Always render the map div so it exists in DOM */}
        <div 
          id={mapId} 
          className="border rounded"
          style={{ 
            height: '500px', 
            minHeight: '500px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            backgroundColor: '#f8f9fa'
          }}
          role="img"
          aria-label="Tracking map showing customer and seller locations"
        ></div>
        
        {/* Show loading overlay while initializing */}
        {isInitializing && (
          <div 
            className="d-flex justify-content-center align-items-center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 10,
              borderRadius: '8px'
            }}
          >
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading map...</span>
              </div>
              <p className="text-muted">Loading tracking map...</p>
            </div>
          </div>
        )}
        
        {/* Show error overlay if map failed to load */}
        {mapError && !isInitializing && (
          <div 
            className="alert alert-warning d-flex align-items-center"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              minWidth: '300px'
            }}
            role="alert"
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            <div>
              <strong>Unable to load map.</strong>
              <div className="small mt-1">
                {!order.customerLocation && (!order.items || !order.items.some(item => item.sellerLocation)) ? (
                  <span>Location data is not available for this order.</span>
                ) : (
                  <span>Please check your internet connection and try again.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const TabButton = ({ status, icon, label, count, isActive, onClick }) => (
    <button 
      className={`tab-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '18px 24px',
        border: 'none',
        background: 'transparent',
        color: isActive ? 'var(--primary-color)' : 'var(--secondary-color)',
        fontWeight: '600',
        fontSize: '14px',
        borderBottom: isActive ? '4px solid var(--primary-color)' : '4px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center'
      }}
    >
      <i className={icon} style={{ marginRight: '8px', fontSize: '16px' }}></i>
      {label} (<span>{count}</span>)
    </button>
  )

  const ActionButton = ({ onClick, variant, icon, children, title }) => {
    const variants = {
      primary: {
        background: 'var(--primary-color)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(44, 133, 63, 0.3)',
        hoverBackground: '#236e33',
        hoverBoxShadow: '0 4px 12px rgba(44, 133, 63, 0.4)'
      },
      danger: {
        background: 'var(--highlight-color)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(228, 76, 49, 0.3)',
        hoverBackground: '#c13d26',
        hoverBoxShadow: '0 4px 12px rgba(228, 76, 49, 0.4)'
      },
      warning: {
        background: '#ffc107',
        color: '#000',
        boxShadow: '0 2px 6px rgba(255, 193, 7, 0.3)',
        hoverBackground: '#e0a800',
        hoverBoxShadow: '0 4px 10px rgba(255, 193, 7, 0.4)'
      },
      info: {
        background: '#17a2b8',
        color: 'white',
        boxShadow: '0 2px 6px rgba(23, 162, 184, 0.3)',
        hoverBackground: '#138496',
        hoverBoxShadow: '0 4px 10px rgba(23, 162, 184, 0.4)'
      },
      outline: {
        background: 'transparent',
        color: 'var(--secondary-color)',
        border: '1px solid var(--admin-border)',
        hoverBackground: 'var(--light-color)'
      }
    }

    const style = variants[variant] || variants.outline

    return (
      <button
        className="btn-admin"
        onClick={onClick}
        title={title}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: style.border || 'none',
          background: style.background,
          color: style.color,
          boxShadow: style.boxShadow || 'none',
          fontWeight: variant === 'primary' || variant === 'danger' ? 600 : 'normal',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          fontSize: '12px',
          minWidth: '70px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap'
        }}
        onMouseOver={(e) => {
          if (style.hoverBackground) e.target.style.backgroundColor = style.hoverBackground
          if (style.hoverBoxShadow) e.target.style.boxShadow = style.hoverBoxShadow
          e.target.style.transform = 'scale(1.05)'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = style.background
          if (style.boxShadow) e.target.style.boxShadow = style.boxShadow
          e.target.style.transform = 'scale(1)'
        }}
      >
        <i className={icon}></i>
        <span style={{ marginLeft: '4px' }}>{children}</span>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Order Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Orders</div>
            <div className="stat-icon">
              <i className="bi bi-cart3"></i>
            </div>
          </div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-change positive">All orders placed</div>
        </div>
        
        <div className="stat-card accent">
          <div className="stat-header">
            <div className="stat-title">Pending Orders</div>
            <div className="stat-icon">
              <i className="bi bi-clock"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.pending}</div>
          <div className="stat-change positive">Awaiting processing</div>
        </div>
        
        <div className="stat-card highlight">
          <div className="stat-header">
            <div className="stat-title">Completed Orders</div>
            <div className="stat-icon">
              <i className="bi bi-check-circle"></i>
            </div>
          </div>
          <div className="stat-value">{statusCounts.completed}</div>
          <div className="stat-change positive">Successfully completed</div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-header">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-icon">
              <i className="bi bi-currency-peso"></i>
            </div>
          </div>
          <div className="stat-value">₱{totalRevenue.toLocaleString()}</div>
          <div className="stat-change positive">Generated revenue</div>
        </div>
      </div>

      {/* Orders Management */}
      <div className="admin-card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div id="datatableButtons" className="d-flex gap-2">
              {/* DataTables export buttons */}
              <button 
                className="btn btn-primary"
                onClick={() => copyToClipboard(filteredOrders)}
                title="Copy table data to clipboard"
              >
                <i className="bi bi-clipboard"></i> Copy
              </button>
              <button 
                className="btn btn-success"
                onClick={() => exportToExcel(filteredOrders, 'orders_report')}
                title="Export to Excel"
              >
                <i className="bi bi-file-earmark-excel"></i> Excel
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => exportToCSV(filteredOrders, 'orders_report')}
                title="Export to CSV"
              >
                <i className="bi bi-file-earmark-text"></i> CSV
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => exportToPDF(filteredOrders, 'orders_report')}
                title="Export to PDF"
              >
                <i className="bi bi-file-earmark-pdf"></i> PDF
              </button>
              <button 
                className="btn btn-info"
                onClick={() => printTable(filteredOrders)}
                title="Print table"
              >
                <i className="bi bi-printer"></i> Print
              </button>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search orders..."
                style={{ width: '250px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Order Status Tabs */}
        <div className="order-tabs" style={{ margin: 0, borderBottom: '1px solid var(--admin-border)', background: 'white' }}>
          <div className="tab-navigation" style={{ display: 'flex', gap: 0, width: '100%' }}>
            <TabButton 
              status="all" 
              icon="bi-grid" 
              label="All Orders" 
              count={statusCounts.all}
              isActive={selectedStatus === 'all'}
              onClick={() => setSelectedStatus('all')}
            />
            <TabButton 
              status="pending" 
              icon="bi-clock" 
              label="Pending" 
              count={statusCounts.pending}
              isActive={selectedStatus === 'pending'}
              onClick={() => setSelectedStatus('pending')}
            />
            <TabButton 
              status="processing" 
              icon="bi-gear" 
              label="Processing" 
              count={statusCounts.processing}
              isActive={selectedStatus === 'processing'}
              onClick={() => setSelectedStatus('processing')}
            />
            <TabButton 
              status="shipped" 
              icon="bi-truck" 
              label="Shipped" 
              count={statusCounts.shipped}
              isActive={selectedStatus === 'shipped'}
              onClick={() => setSelectedStatus('shipped')}
            />
            <TabButton 
              status="completed" 
              icon="bi-check-circle" 
              label="Completed" 
              count={statusCounts.completed}
              isActive={selectedStatus === 'completed'}
              onClick={() => setSelectedStatus('completed')}
            />
            <TabButton 
              status="cancelled" 
              icon="bi-x-circle" 
              label="Cancelled" 
              count={statusCounts.cancelled}
              isActive={selectedStatus === 'cancelled'}
              onClick={() => setSelectedStatus('cancelled')}
            />
          </div>
        </div>

        <div className="card-body">
          <table className="admin-table table table-striped table-hover" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr 
                  key={order.id}
                  style={{ cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--light-color)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = ''}
                >
                  <td>
                    <div style={{ fontWeight: '500' }}>{order.order_number || order.id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>{order.deliveryType}</div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{order.customer.name}</div>
                      {order.customer.phone && order.customer.phone !== 'N/A' && (
                        <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>{order.customer.phone}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{order.products.main}</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>{order.products.additional}</div>
                    </div>
                  </td>
                  <td>₱{order.amount.toLocaleString()}</td>
                  <td>{order.quantity || 0}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getPaymentBadgeClass(order.payment)}`}>
                      {order.payment.charAt(0).toUpperCase() + order.payment.slice(1)}
                    </span>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px', 
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      width: '100%',
                      minWidth: '200px'
                    }}>
                      {/* Completed orders actions */}
                      {order.status === 'completed' && (
                        <>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-pencil"
                            title="Edit Order"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditOrder(order)
                            }}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            icon="bi bi-trash"
                            title="Delete Order"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelOrder(order)
                            }}
                          >
                            Delete
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Processing orders actions */}
                      {order.status === 'processing' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-arrow-up-circle"
                            title="Update Order Status"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpdateStatus(order)
                            }}
                          >
                            Update
                          </ActionButton>
                          <ActionButton
                            variant="outline"
                            icon="bi bi-eye"
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewOrder(order)
                            }}
                          >
                            View
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Shipped orders actions */}
                      {order.status === 'shipped' && (
                        <>
                          <ActionButton
                            variant="info"
                            icon="bi bi-geo-alt"
                            title="Track Package"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTrackOrder(order)
                            }}
                          >
                            Track
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Pending orders actions */}
                      {order.status === 'pending' && (
                        <>
                          <ActionButton
                            variant="primary"
                            icon="bi bi-check-circle"
                            title="Confirm Payment"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConfirmPayment(order)
                            }}
                          >
                            Confirm
                          </ActionButton>
                        </>
                      )}
                      
                      {/* Cancelled orders actions */}
                      {order.status === 'cancelled' && (
                        <>
                          <ActionButton
                            variant="warning"
                            icon="bi bi-arrow-clockwise"
                            title="Process Refund"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRefundOrder(order)
                            }}
                          >
                            Refund
                          </ActionButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {paginatedOrders.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--secondary-color)' 
            }}>
              <i className="bi bi-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
              <p>No orders found matching your criteria.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination}
      </div>

      {/* Order Modals */}
      <EditOrderModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={(orderId, orderData) => {
          console.log('Editing order:', orderId, orderData)
          // Handle order edit logic here
        }}
        order={selectedOrder}
      />

      <ViewOrderModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        order={selectedOrder}
      />

      <UpdateStatusModal
        show={showUpdateStatusModal}
        onClose={() => setShowUpdateStatusModal(false)}
        onUpdate={(orderId, updateData) => {
          console.log('Updating order status:', orderId, updateData)
          // Handle status update logic here
        }}
        order={selectedOrder}
      />

      <CancelOrderModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onCancel={(orderId, cancellationData) => {
          console.log('Cancelling order:', orderId, cancellationData)
          // Handle order cancellation logic here
        }}
        order={selectedOrder}
      />

      <ProcessRefundModal
        show={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onProcessRefund={(orderId, refundData) => {
          console.log('Processing refund:', orderId, refundData)
          // Handle refund processing logic here
        }}
        order={selectedOrder}
      />

      {/* Track Order Modal */}
      {selectedOrderForTracking && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-geo-alt me-2"></i>
                  Track Order: {selectedOrderForTracking.order_number || selectedOrderForTracking.id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrderForTracking(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
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
                    <small>Customer Delivery Address</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{ width: '16px', height: '16px', backgroundColor: 'blue', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', marginRight: '8px' }}></div>
                    <small>Seller Location</small>
                  </div>
                  {selectedOrderForTracking.customerLocation && selectedOrderForTracking.items && selectedOrderForTracking.items.some(item => item.sellerLocation) && (
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



    </>
  )
}


