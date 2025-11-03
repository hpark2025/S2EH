import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Chart } from 'chart.js/auto';
import { sellerAPI } from '../../services/sellerAPI';

export default function SellerAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    revenue: [],
    orders: [],
    products: [],
    customers: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const revenueChartRef = useRef(null);
  const revenueChartInstance = useRef(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch real-time data from orders, products, and customers
      const [ordersResponse, productsResponse, customersResponse] = await Promise.all([
        sellerAPI.orders.getOrders(),
        sellerAPI.products.getProducts(),
        sellerAPI.customers.getCustomers()
      ]);

      setAnalyticsData({
        revenue: [], // Not used, will calculate from orders
        orders: ordersResponse.orders || [],
        products: productsResponse.products || [],
        customers: customersResponse.customers || []
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const getRevenueData = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
    const revenueByDay = {};
    const labels = [];

    // Initialize all days with 0 revenue
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueByDay[dateStr] = 0;
      labels.push(formattedDate);
    }

    // Add actual revenue data from delivered/completed orders
    analyticsData.orders
      .filter(order => {
        const status = (order.status || '').toLowerCase();
        return status === 'delivered' || status === 'completed';
      })
      .forEach(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        if (revenueByDay.hasOwnProperty(orderDate)) {
          revenueByDay[orderDate] += parseFloat(order.total || 0);
        }
      });

    return {
      labels: labels,
      data: Object.values(revenueByDay),
      revenueByDay: revenueByDay
    };
  };

  const getOrderStatusData = () => {
    const statusCounts = {};
    analyticsData.orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / analyticsData.orders.length) * 100) || 0
    }));
  };

  const getTopProducts = () => {
    const productSales = {};
    
    analyticsData.orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productId = item.product_id || item.productId;
          const productTitle = item.product_title || item.title || item.productTitle || 'Unknown Product';
          const quantity = parseInt(item.quantity || 0);
          const unitPrice = parseFloat(item.unit_price || item.unitPrice || 0);
          const revenue = quantity * unitPrice;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              title: productTitle,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += quantity;
          productSales[productId].revenue += revenue;
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const getCustomerStats = () => {
    const totalCustomers = analyticsData.customers.length;
    const newCustomers = analyticsData.customers.filter(customer => {
      const customerDate = new Date(customer.created_at);
      const now = new Date();
      const daysDiff = (now - customerDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365);
    }).length;

    return { totalCustomers, newCustomers };
  };

  const getTotalStats = () => {
    // Filter by time range
    const now = new Date();
    const timeRangeDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
    const startDate = new Date(now.getTime() - timeRangeDays * 24 * 60 * 60 * 1000);
    
    const recentOrders = analyticsData.orders.filter(order => 
      new Date(order.created_at) >= startDate
    );

    const totalRevenue = recentOrders
      .filter(order => {
        const status = (order.status || '').toLowerCase();
        return status === 'delivered' || status === 'completed';
      })
      .reduce((total, order) => total + parseFloat(order.total || 0), 0);

    const totalOrders = recentOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = analyticsData.customers.length > 0 ? 
      (totalOrders / analyticsData.customers.length) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      conversionRate
    };
  };

  const stats = getTotalStats();
  const customerStats = getCustomerStats();
  const revenueData = getRevenueData();
  const orderStatusData = getOrderStatusData();
  const topProducts = getTopProducts();

  // Initialize revenue chart
  useEffect(() => {
    if (!revenueChartRef.current || revenueData.labels.length === 0 || revenueData.data.every(d => d === 0)) return;

    // Destroy existing chart
    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }

    // Create line chart
    const ctx = revenueChartRef.current.getContext('2d');
    revenueChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: revenueData.labels,
        datasets: [{
          label: 'Revenue (₱)',
          data: revenueData.data,
          borderColor: 'rgba(40, 167, 69, 1)',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(40, 167, 69, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Revenue: ' + formatPrice(context.parsed.y);
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
      }
    });

    return () => {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
    };
  }, [revenueData, timeRange]);

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
    <div className="seller-analytics-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Analytics</h2>
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
            onClick={loadAnalyticsData}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-currency-dollar display-6"></i>
              <h4 className="mt-2">{formatPrice(stats.totalRevenue)}</h4>
              <small>Total Revenue</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-receipt display-6"></i>
              <h4 className="mt-2">{stats.totalOrders}</h4>
              <small>Total Orders</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-graph-up display-6"></i>
              <h4 className="mt-2">{formatPrice(stats.avgOrderValue)}</h4>
              <small>Avg Order Value</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-people display-6"></i>
              <h4 className="mt-2">{customerStats.newCustomers}</h4>
              <small>New Customers</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Revenue Chart */}
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Revenue Trend</h5>
            </div>
            <div className="card-body">
              {revenueData.labels.length === 0 || revenueData.data.every(d => d === 0) ? (
                <div className="text-center py-5">
                  <i className="bi bi-graph-up display-4 text-muted"></i>
                  <p className="text-muted mt-2">No revenue data available</p>
                </div>
              ) : (
                <canvas ref={revenueChartRef} style={{ maxHeight: '300px' }}></canvas>
              )}
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Status</h5>
            </div>
            <div className="card-body">
              {orderStatusData.length === 0 ? (
                <div className="text-center py-3">
                  <i className="bi bi-pie-chart display-4 text-muted"></i>
                  <p className="text-muted mt-2">No order data</p>
                </div>
              ) : (
                <div className="order-status-chart">
                  {orderStatusData.map((data, index) => (
                    <div key={data.status} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle me-2"
                          style={{ 
                            width: '12px', 
                            height: '12px',
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}
                        ></div>
                        <span className="text-capitalize">{data.status}</span>
                      </div>
                      <div className="text-end">
                        <span className="fw-bold">{data.count}</span>
                        <small className="text-muted ms-1">({data.percentage}%)</small>
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
        {/* Top Products */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Top Selling Products</h5>
            </div>
            <div className="card-body">
              {topProducts.length === 0 ? (
                <div className="text-center py-3">
                  <i className="bi bi-box display-4 text-muted"></i>
                  <p className="text-muted mt-2">No sales data available</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {topProducts.map((product, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{product.title}</div>
                        <small className="text-muted">{product.quantity} sold</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-success">{formatPrice(product.revenue)}</div>
                        <small className="text-muted">revenue</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Customer Insights</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6">
                  <div className="border-end">
                    <h3 className="text-primary">{customerStats.totalCustomers}</h3>
                    <small className="text-muted">Total Customers</small>
                  </div>
                </div>
                <div className="col-6">
                  <h3 className="text-success">{customerStats.newCustomers}</h3>
                  <small className="text-muted">New This Period</small>
                </div>
              </div>
              <hr />
              <div className="row text-center">
                <div className="col-6">
                  <div className="border-end">
                    <h3 className="text-info">{stats.conversionRate.toFixed(1)}%</h3>
                    <small className="text-muted">Conversion Rate</small>
                  </div>
                </div>
                <div className="col-6">
                  <h3 className="text-warning">{formatPrice(stats.avgOrderValue)}</h3>
                  <small className="text-muted">Avg Order Value</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}