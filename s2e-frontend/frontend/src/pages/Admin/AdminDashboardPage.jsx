import { useEffect, useRef, useState } from 'react'
import { Chart } from 'chart.js/auto'
import { adminAPI } from '../../services/adminAPI.js'

export default function AdminDashboardPage() {
  const salesRef = useRef(null)
  const performanceRef = useRef(null)
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {
      sellers: {
        pending_sellers: 0,
        approved_sellers: 0,
        rejected_sellers: 0,
        total_seller_applications: 0
      },
      users: {
        total_customers: 0,
        active_sellers: 0,
        total_admins: 0,
        total_users: 0
      },
      products: {
        active_products: 0,
        inactive_products: 0,
        total_products: 0
      },
      orders: {
        pending_orders: 0,
        completed_orders: 0,
        total_orders: 0,
        total_revenue: 0
      }
    },
    recentApplications: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Orders table state
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  
  // Best selling products state
  const [bestSellingProducts, setBestSellingProducts] = useState([])
  
  // Chart data state
  const [ordersData, setOrdersData] = useState([])
  const [salesChartInstance, setSalesChartInstance] = useState(null)
  const [performanceChartInstance, setPerformanceChartInstance] = useState(null)

  // Mock dashboard data for development (no backend)
  const MOCK_DASHBOARD_DATA = {
    stats: {
      sellers: {
        pending_sellers: 3,
        approved_sellers: 12,
        rejected_sellers: 2,
        total_seller_applications: 17
      },
      users: {
        total_customers: 145,
        active_sellers: 12,
        total_admins: 1,
        total_users: 158
      },
      products: {
        active_products: 89,
        inactive_products: 11,
        total_products: 100
      },
      orders: {
        pending_orders: 8,
        completed_orders: 42,
        total_orders: 50,
        total_revenue: 125000
      }
    },
    recentApplications: [
      {
        id: 1,
        applicantName: 'Maria Santos',
        businessType: 'Agriculture',
        businessName: 'Santos Family Farm',
        appliedAt: '2024-01-15',
        status: 'pending'
      },
      {
        id: 2,
        applicantName: 'Juan Dela Cruz',
        businessType: 'Handicrafts',
        businessName: 'Bicol Crafts',
        appliedAt: '2024-01-14',
        status: 'pending'
      },
      {
        id: 3,
        applicantName: 'Ana Rodriguez',
        businessType: 'Food Processing',
        businessName: 'Rodriguez Kitchen',
        appliedAt: '2024-01-13',
        status: 'pending'
      }
    ]
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await adminAPI.dashboard.getDashboardStats()
        setDashboardData(response.data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        // Use mock data instead of showing error
        setDashboardData(MOCK_DASHBOARD_DATA)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load orders for the Orders Table card
  const loadOrders = async () => {
    try {
      setLoadingOrders(true)
      const response = await adminAPI.orders.getAll()
      
      // Extract orders from response
      const ordersData = response.data?.orders || response.orders || []
      
      // Map backend order structure to simple format for dashboard table
      const mappedOrders = ordersData.map((order) => {
        // Format customer name
        const firstName = (order.first_name && order.first_name.trim()) || ''
        const lastName = (order.last_name && order.last_name.trim()) || ''
        const customerName = `${firstName} ${lastName}`.trim() || 'Unknown Customer'
        
        // Get main product from items
        const items = order.items || []
        const mainProduct = items.length > 0 
          ? (items[0].product_title || items[0].product_name || 'Product')
          : 'No items'
        
        // Format date
        const orderDate = order.created_at 
          ? new Date(order.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          : ''
        
        // Use order_number as the primary identifier (Order ID)
        const orderNumber = order.order_number || `ORD-${order.id}`
        
        return {
          id: order.id,
          order_number: orderNumber,
          customer: customerName,
          product: mainProduct,
          amount: parseFloat(order.total || 0),
          status: order.status || 'pending',
          date: orderDate
        }
      })
      
      // Sort by date (newest first)
      mappedOrders.sort((a, b) => {
        const dateA = new Date(ordersData.find(o => o.id === a.id)?.created_at || 0)
        const dateB = new Date(ordersData.find(o => o.id === b.id)?.created_at || 0)
        return dateB - dateA
      })
      
      // Limit to latest 10 orders for dashboard
      setOrders(mappedOrders.slice(0, 10))
      
      // Store full orders data for charts
      setOrdersData(ordersData)
      
      // Calculate best selling products from all orders
      const productSales = {}
      
      // Loop through all orders and their items
      ordersData.forEach((order) => {
        const items = order.items || []
        items.forEach((item) => {
          const productName = item.product_title || item.product_name || 'Unknown Product'
          const quantity = parseInt(item.quantity || 1)
          
          if (productSales[productName]) {
            productSales[productName] += quantity
          } else {
            productSales[productName] = quantity
          }
        })
      })
      
      // Convert to array and sort by sales (descending)
      const sortedProducts = Object.entries(productSales)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5 best selling products
      
      setBestSellingProducts(sortedProducts)
    } catch (error) {
      console.error('Failed to load orders:', error)
      setOrders([])
      setBestSellingProducts([])
    } finally {
      setLoadingOrders(false)
    }
  }

  // Filter orders by status
  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter === 'all') return true
    
    const orderStatus = order.status.toLowerCase()
    const filterStatus = orderStatusFilter.toLowerCase()
    
    // Handle delivered/completed equivalence
    if (filterStatus === 'delivered') {
      return orderStatus === 'delivered' || orderStatus === 'completed'
    }
    if (filterStatus === 'completed') {
      return orderStatus === 'completed' || orderStatus === 'delivered'
    }
    
    // Exact match for other statuses
    return orderStatus === filterStatus
  })

  // Calculate sales revenue trend (last 7 days by day)
  const calculateSalesTrend = (orders) => {
    if (!orders || orders.length === 0) {
      return { labels: [], data: [] }
    }
    
    // Get last 7 days
    const today = new Date()
    const last7Days = []
    const revenueByDay = {}
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      last7Days.push({ date: dateKey, label: dayLabel })
      revenueByDay[dateKey] = 0
    }
    
    // Calculate revenue for each day
    orders.forEach((order) => {
      if (order.created_at) {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0]
        if (revenueByDay.hasOwnProperty(orderDate)) {
          revenueByDay[orderDate] += parseFloat(order.total || 0)
        }
      }
    })
    
    return {
      labels: last7Days.map(d => d.label),
      data: last7Days.map(d => revenueByDay[d.date] || 0)
    }
  }

  // Calculate monthly performance (last 6 months)
  const calculateMonthlyPerformance = (orders) => {
    if (!orders || orders.length === 0) {
      return { labels: [], ordersData: [], revenueData: [] }
    }
    
    const today = new Date()
    const months = []
    const ordersByMonth = {}
    const revenueByMonth = {}
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      months.push({ key: monthKey, label: monthLabel })
      ordersByMonth[monthKey] = 0
      revenueByMonth[monthKey] = 0
    }
    
    // Calculate orders count and revenue for each month
    orders.forEach((order) => {
      if (order.created_at) {
        const orderDate = new Date(order.created_at)
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
        
        if (ordersByMonth.hasOwnProperty(monthKey)) {
          ordersByMonth[monthKey] += 1
          revenueByMonth[monthKey] += parseFloat(order.total || 0)
        }
      }
    })
    
    // Convert revenue to thousands
    const revenueData = months.map(m => Math.round(revenueByMonth[m.key] / 1000))
    
    return {
      labels: months.map(m => m.label),
      ordersData: months.map(m => ordersByMonth[m.key]),
      revenueData: revenueData
    }
  }

  useEffect(() => {
    // Ensure DOM elements exist before creating charts
    if (!salesRef.current || !performanceRef.current || ordersData.length === 0) return

    const salesCtx = salesRef.current.getContext('2d')
    const performanceCtx = performanceRef.current.getContext('2d')

    // Calculate real data from orders
    const salesTrend = calculateSalesTrend(ordersData)
    const monthlyPerformance = calculateMonthlyPerformance(ordersData)

    // Destroy existing charts if they exist
    if (salesChartInstance) {
      salesChartInstance.destroy()
    }
    if (performanceChartInstance) {
      performanceChartInstance.destroy()
    }

    const salesChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: salesTrend.labels,
        datasets: [
          {
            label: 'Revenue (₱)',
            data: salesTrend.data,
            borderColor: '#2c853f',
            backgroundColor: 'rgba(44, 133, 63, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2c853f',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          },
        ],
      },
      options: { 
        responsive: true, 
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return '₱' + context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₱' + value.toLocaleString();
              }
            }
          }
        }
      },
    })

    const performanceChart = new Chart(performanceCtx, {
      type: 'line',
      data: {
        labels: monthlyPerformance.labels,
        datasets: [
          {
            label: 'Orders',
            data: monthlyPerformance.ordersData,
            borderColor: '#e44c31',
            backgroundColor: 'rgba(228, 76, 49, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            yAxisID: 'y',
            pointBackgroundColor: '#e44c31',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
          },
          {
            label: 'Revenue (K)',
            data: monthlyPerformance.revenueData,
            borderColor: '#2c853f',
            backgroundColor: 'rgba(44, 133, 63, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            yAxisID: 'y1',
            pointBackgroundColor: '#2c853f',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 14,
                weight: '500'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.dataset.label === 'Revenue (K)') {
                  label += '₱' + context.parsed.y + 'K';
                } else {
                  label += context.parsed.y.toLocaleString();
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Month',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          y: { 
            type: 'linear', 
            position: 'left', 
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Orders',
              color: '#e44c31',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#e44c31',
              callback: function(value) {
                return value.toLocaleString();
              }
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y1: { 
            type: 'linear', 
            position: 'right', 
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue (K)',
              color: '#2c853f',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#2c853f',
              callback: function(value) {
                return '₱' + value + 'K';
              }
            },
            grid: {
              drawOnChartArea: true,
            },
          },
        },
      },
    })

    setSalesChartInstance(salesChart)
    setPerformanceChartInstance(performanceChart)

    return () => {
      if (salesChart) salesChart.destroy()
      if (performanceChart) performanceChart.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersData])

  return (
    <>
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Products</div>
                <div className="stat-icon">
                  <i className="bi bi-box"></i>
                </div>
              </div>
              <div className="stat-value">{dashboardData.stats.products.total_products}</div>
              <div className="stat-change positive">
                {dashboardData.stats.products.active_products} active, {dashboardData.stats.products.inactive_products} inactive
              </div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-header">
                <div className="stat-title">Total Orders</div>
                <div className="stat-icon">
                  <i className="bi bi-cart3"></i>
                </div>
              </div>
              <div className="stat-value">{dashboardData.stats.orders.total_orders}</div>
              <div className="stat-change positive">
                {dashboardData.stats.orders.completed_orders} completed, {dashboardData.stats.orders.pending_orders} pending
              </div>
            </div>

            <div className="stat-card accent">
              <div className="stat-header">
                <div className="stat-title">Active Users</div>
                <div className="stat-icon">
                  <i className="bi bi-people"></i>
                </div>
              </div>
              <div className="stat-value">{dashboardData.stats.users.total_users}</div>
              <div className="stat-change positive">
                {dashboardData.stats.users.total_customers} customers, {dashboardData.stats.users.active_sellers} sellers
              </div>
            </div>

            <div className="stat-card secondary">
              <div className="stat-header">
                <div className="stat-title">Revenue</div>
                <div className="stat-icon">
                  <i className="bi bi-currency-peso"></i>
                </div>
              </div>
              <div className="stat-value">₱{dashboardData.stats.orders.total_revenue.toLocaleString()}</div>
              <div className="stat-change positive">Total revenue generated</div>
            </div>
          </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="admin-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Orders Table</h3>
              <div>
                <select 
                  className="form-control" 
                  style={{ width: '120px', fontSize: '12px' }}
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loadingOrders ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner-border spinner-border-sm text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2" style={{ fontSize: '14px' }}>Loading orders...</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="admin-table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        // Get status badge color
                        const getStatusBadge = (status) => {
                          const statusLower = status.toLowerCase()
                          if (statusLower === 'pending') return 'bg-warning'
                          if (statusLower === 'processing') return 'bg-info'
                          if (statusLower === 'shipped' || statusLower === 'in_transit') return 'bg-primary'
                          if (statusLower === 'delivered') return 'bg-success'
                          if (statusLower === 'completed') return 'bg-success'
                          if (statusLower === 'cancelled') return 'bg-danger'
                          return 'bg-secondary'
                        }
                        
                        // Format status text
                        const formatStatus = (status) => {
                          const statusLower = status.toLowerCase()
                          if (statusLower === 'in_transit') return 'Shipped'
                          // Explicitly handle delivered status
                          if (statusLower === 'delivered') return 'Delivered'
                          if (statusLower === 'completed') return 'Completed'
                          return status.charAt(0).toUpperCase() + status.slice(1)
                        }
                        
                        return (
                          <tr key={order.id}>
                            <td>{order.order_number}</td>
                            <td>{order.customer}</td>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.product}
                            </td>
                            <td>₱{order.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td>
                              <span className={`badge ${getStatusBadge(order.status)}`}>
                                {formatStatus(order.status)}
                              </span>
                            </td>
                            <td>{order.date}</td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                          <i className="bi bi-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}></i>
                          {orderStatusFilter === 'all' 
                            ? 'No orders found'
                            : `No ${orderStatusFilter} orders found`
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Best Selling Products</h3>
          </div>
          <div className="card-body" style={{ padding: '15px' }}>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div className="spinner-border spinner-border-sm text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2" style={{ fontSize: '12px' }}>Loading...</p>
              </div>
            ) : bestSellingProducts.length > 0 ? (
              bestSellingProducts.map((product, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2" style={{ 
                  paddingBottom: index < bestSellingProducts.length - 1 ? '8px' : '0',
                  borderBottom: index < bestSellingProducts.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span style={{ 
                    fontSize: '14px',
                    maxWidth: '70%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={product.name}>
                    {product.name}
                  </span>
                  <span className="badge bg-success">{product.count} sold</span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <i className="bi bi-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                <p style={{ fontSize: '14px', margin: 0 }}>No products sold yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

          <div className="admin-card">
            <div className="card-header">
              <h3 className="card-title">Pending LGU Verifications</h3>
            </div>
            <div className="card-body">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Producer Name</th>
                    <th>Business Type</th>
                    <th>Location</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentApplications.length > 0 ? (
                    dashboardData.recentApplications.map((app) => (
                      <tr key={app.id}>
                        <td>{app.applicantName}</td>
                        <td>{app.businessType}</td>
                        <td>{app.businessName}</td>
                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${app.status === 'pending' ? 'bg-warning' : app.status === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                        No pending verifications
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Sales Revenue Trend</h3>
            </div>
            <div className="card-body">
              <canvas ref={salesRef} style={{ maxHeight: '300px' }} />
            </div>
          </div>

          <div className="admin-card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Monthly Performance</h3>
            </div>
            <div className="card-body">
              <canvas ref={performanceRef} style={{ maxHeight: '350px', minHeight: '300px' }} />
            </div>
          </div>
        </>
      )}
    </>
  )
}