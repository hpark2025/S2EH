import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Chart } from 'chart.js/auto';
import { sellerAPI } from '../../services/sellerAPI';

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    products: [],
    orders: [],
    analytics: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      pendingOrders: 0,
      lowStockProducts: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const statusChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const statusChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products and orders in parallel
      const [productsResponse, ordersResponse] = await Promise.all([
        sellerAPI.products.getProducts(),
        sellerAPI.orders.getOrders()
      ]);

      const products = productsResponse.products || [];
      const orders = ordersResponse.orders || [];

      // Calculate analytics
      const analytics = calculateAnalytics(products, orders);
      
      setDashboardData({
        products,
        orders,
        analytics
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (products, orders) => {
    const now = new Date();
    const timeRangeDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
    const startDate = new Date(now.getTime() - timeRangeDays * 24 * 60 * 60 * 1000);

    // Filter orders by time range
    const recentOrders = orders.filter(order => 
      new Date(order.created_at) >= startDate
    );

    const totalRevenue = recentOrders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + (order.total || 0), 0);

    const totalOrders = recentOrders.length;
    const pendingOrders = recentOrders.filter(order => 
      ['pending', 'confirmed', 'processing'].includes(order.status)
    ).length;

    const totalProducts = products.length;
    const lowStockProducts = products.filter(product => 
      (product.stock_quantity || 0) < 10
    ).length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      pendingOrders,
      lowStockProducts
    };
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const getRecentOrders = () => {
    return dashboardData.orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  const getLowStockProducts = () => {
    return dashboardData.products
      .filter(product => (product.stock_quantity || 0) < 10)
      .slice(0, 5);
  };

  const getOrderStatusDistribution = () => {
    const statusCounts = {};
    dashboardData.orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    return statusCounts;
  };

  const getRevenueByMonth = () => {
    const now = new Date();
    const months = [];
    const revenueByMonth = {};
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months.push({ key: monthKey, label: monthLabel });
      revenueByMonth[monthKey] = 0;
    }
    
    // Calculate revenue for each month from delivered orders
    dashboardData.orders
      .filter(order => {
        const status = (order.status || '').toLowerCase();
        return status === 'delivered' || status === 'completed';
      })
      .forEach(order => {
        if (order.created_at) {
          const orderDate = new Date(order.created_at);
          const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          if (revenueByMonth.hasOwnProperty(monthKey)) {
            revenueByMonth[monthKey] += parseFloat(order.total || 0);
          }
        }
      });
    
    return {
      labels: months.map(m => m.label),
      data: months.map(m => revenueByMonth[m.key] || 0)
    };
  };

  // Initialize charts
  useEffect(() => {
    if (!statusChartRef.current || !revenueChartRef.current || dashboardData.orders.length === 0) return;

    const statusData = getOrderStatusDistribution();
    const revenueData = getRevenueByMonth();

    // Destroy existing charts
    if (statusChartInstance.current) {
      statusChartInstance.current.destroy();
    }
    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }

    // Create Order Status Distribution Pie Chart
    if (Object.keys(statusData).length > 0) {
      const statusCtx = statusChartRef.current.getContext('2d');
      statusChartInstance.current = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusData).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
          datasets: [{
            label: 'Orders',
            data: Object.values(statusData),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(40, 167, 69, 0.8)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Create Revenue by Month Bar Chart
    if (revenueData.labels.length > 0 && revenueData.data.some(d => d > 0)) {
      const revenueCtx = revenueChartRef.current.getContext('2d');
      revenueChartInstance.current = new Chart(revenueCtx, {
        type: 'bar',
        data: {
          labels: revenueData.labels,
          datasets: [{
            label: 'Revenue (₱)',
            data: revenueData.data,
            backgroundColor: 'rgba(40, 167, 69, 0.8)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '₱' + value.toLocaleString();
                }
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    return () => {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
    };
  }, [dashboardData, timeRange]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <div className="d-flex align-items-center gap-3">
          <select
            className="form-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="1y">Last year</option>
          </select>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={loadDashboardData}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₱</span>
          <h4 className="mt-2">{formatPrice(dashboardData.analytics.totalRevenue)}</h4>
              <small>Total Revenue</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-receipt display-6"></i>
              <h4 className="mt-2">{dashboardData.analytics.totalOrders}</h4>
              <small>Total Orders</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-box display-6"></i>
              <h4 className="mt-2">{dashboardData.analytics.totalProducts}</h4>
              <small>Products</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-clock display-6"></i>
              <h4 className="mt-2">{dashboardData.analytics.pendingOrders}</h4>
              <small>Pending Orders</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <i className="bi bi-exclamation-triangle display-6"></i>
              <h4 className="mt-2">{dashboardData.analytics.lowStockProducts}</h4>
              <small>Low Stock</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-dark text-white">
            <div className="card-body text-center">
              <i className="bi bi-graph-up display-6"></i>
              <h4 className="mt-2">
                {dashboardData.analytics.totalOrders > 0 
                  ? formatPrice(Math.round(dashboardData.analytics.totalRevenue / dashboardData.analytics.totalOrders))
                  : formatPrice(0)
                }
              </h4>
              <small>Avg Order Value</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Orders */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Orders</h5>
            </div>
            <div className="card-body">
              {getRecentOrders().length === 0 ? (
                <div className="text-center py-3">
                  <i className="bi bi-receipt display-4 text-muted"></i>
                  <p className="text-muted mt-2">No recent orders</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {getRecentOrders().map((order) => (
                    <div key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">#{order.order_number || order.id}</div>
                        <small className="text-muted">
                          {(() => {
                            const firstName = order.customer?.first_name || order.customer_name || order.first_name || '';
                            const lastName = order.customer?.last_name || order.last_name || '';
                            const name = `${firstName} ${lastName}`.trim();
                            return name || 'Customer';
                          })()}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatPrice(order.total)}</div>
                        <span className={`badge ${order.status === 'pending' ? 'bg-warning' : 
                                         order.status === 'delivered' ? 'bg-success' : 'bg-info'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Low Stock Alert</h5>
              <button 
                onClick={() => navigate('/seller/products')} 
                className="btn btn-sm btn-outline-primary"
              >
                Manage Products
              </button>
            </div>
            <div className="card-body">
              {getLowStockProducts().length === 0 ? (
                <div className="text-center py-3">
                  <i className="bi bi-check-circle display-4 text-success"></i>
                  <p className="text-muted mt-2">All products are well stocked</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {getLowStockProducts().map((product) => (
                    <div key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{product.title}</div>
                        <small className="text-muted">SKU: {product.sku || 'N/A'}</small>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${product.stock_quantity === 0 ? 'bg-danger' : 'bg-warning'}`}>
                          {product.stock_quantity || 0} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Order Status Distribution */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Status Distribution</h5>
            </div>
            <div className="card-body">
              {Object.keys(getOrderStatusDistribution()).length === 0 ? (
                <div className="text-center py-3">
                  <i className="bi bi-pie-chart display-4 text-muted"></i>
                  <p className="text-muted mt-2">No order data available</p>
                </div>
              ) : (
                <canvas ref={statusChartRef} style={{ maxHeight: '300px' }}></canvas>
              )}
            </div>
          </div>
        </div>

        {/* Revenue by Month */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Revenue by Month</h5>
            </div>
            <div className="card-body">
              {(() => {
                const revenueData = getRevenueByMonth();
                return revenueData.labels.length === 0 || revenueData.data.every(d => d === 0);
              })() ? (
                <div className="text-center py-3">
                  <i className="bi bi-graph-up display-4 text-muted"></i>
                  <p className="text-muted mt-2">No revenue data available</p>
                </div>
              ) : (
                <canvas ref={revenueChartRef} style={{ maxHeight: '300px' }}></canvas>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}