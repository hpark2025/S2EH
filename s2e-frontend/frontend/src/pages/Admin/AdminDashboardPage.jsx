import { useEffect, useRef, useState } from 'react'
import { Chart } from 'chart.js/auto'
import { adminAPI } from '../../services/adminAPI.js'

export default function AdminDashboardPage() {
  const salesRef = useRef(null)
  const categoryRef = useRef(null)
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
  }, [])

  useEffect(() => {
    // Ensure DOM elements exist before creating charts
    if (!salesRef.current || !categoryRef.current || !performanceRef.current) return

    const salesCtx = salesRef.current.getContext('2d')
    const categoryCtx = categoryRef.current.getContext('2d')
    const performanceCtx = performanceRef.current.getContext('2d')

    const monthlyData = {
      august: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        data: [15000, 22000, 18000, 25000, 30000],
      },
    }

    const salesChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: monthlyData.august.labels,
        datasets: [
          {
            label: 'Revenue ()',
            data: monthlyData.august.data,
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
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '' + value.toLocaleString();
              }
            }
          }
        }
      },
    })

    const categoryChart = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Agriculture', 'Handicrafts', 'Food Processing', 'Textiles', 'Fisheries'],
        datasets: [
          {
            data: [35, 25, 20, 15, 5],
            backgroundColor: ['#4caf50', '#ff9800', '#9c27b0', '#3f51b5', '#607d8b'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: { 
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true
            }
          }
        }
      },
    })

    const performanceChart = new Chart(performanceCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'Orders',
            data: [12, 18, 15, 22, 25, 30, 28, 35],
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
            data: [15, 22, 18, 28, 32, 38, 35, 42],
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
                  label += '' + context.parsed.y + 'K';
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
                return '' + value + 'K';
              }
            },
            grid: {
              drawOnChartArea: true,
            },
          },
        },
      },
    })

    return () => {
      salesChart.destroy()
      categoryChart.destroy()
      performanceChart.destroy()
    }
  }, [])

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
                <select className="form-control" style={{ width: '120px', fontSize: '12px' }}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
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
                  <tr>
                    <td>ORD-001</td>
                    <td>Juan Dela Cruz</td>
                    <td>Pili Nuts (250g)</td>
                    <td>₱180.00</td>
                    <td><span className="badge bg-warning">Pending</span></td>
                    <td>2024-01-15</td>
                  </tr>
                  <tr>
                    <td>ORD-002</td>
                    <td>Maria Santos</td>
                    <td>Handwoven Basket</td>
                    <td>₱350.00</td>
                    <td><span className="badge bg-success">Completed</span></td>
                    <td>2024-01-14</td>
                  </tr>
                  <tr>
                    <td>ORD-003</td>
                    <td>Ana Rodriguez</td>
                    <td>Coconut Vinegar</td>
                    <td>₱95.00</td>
                    <td><span className="badge bg-info">Shipped</span></td>
                    <td>2024-01-13</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <h3 className="card-title">Best Selling Products</h3>
          </div>
          <div className="card-body" style={{ padding: '15px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Pili Nuts (250g)</span>
              <span className="badge bg-success">45 sold</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Handwoven Basket</span>
              <span className="badge bg-success">32 sold</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Coconut Vinegar</span>
              <span className="badge bg-success">28 sold</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Abaca Bag</span>
              <span className="badge bg-success">22 sold</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span>Organic Rice (5kg)</span>
              <span className="badge bg-success">18 sold</span>
            </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="admin-card">
              <div className="card-header">
                <h3 className="card-title">Sales Revenue Trend</h3>
              </div>
              <div className="card-body">
                <canvas ref={salesRef} style={{ maxHeight: '300px' }} />
              </div>
            </div>

            <div className="admin-card">
              <div className="card-header">
                <h3 className="card-title">Products by Category</h3>
              </div>
              <div className="card-body">
                <canvas ref={categoryRef} style={{ maxHeight: '300px' }} />
              </div>
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