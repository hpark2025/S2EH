import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
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

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [revenueResponse, ordersResponse, productsResponse, customersResponse] = await Promise.all([
        sellerAPI.analytics.getSalesData({ period: timeRange }),
        sellerAPI.orders.getOrders({ period: timeRange }),
        sellerAPI.products.getProducts(),
        sellerAPI.customers.getCustomers()
      ]);

      setAnalyticsData({
        revenue: revenueResponse.data || [],
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
    }).format(price / 100);
  };

  const getRevenueData = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 365;
    const revenueByDay = {};

    // Initialize all days with 0 revenue
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      revenueByDay[dateStr] = 0;
    }

    // Add actual revenue data
    analyticsData.orders
      .filter(order => order.status === 'delivered')
      .forEach(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        if (revenueByDay[orderDate] !== undefined) {
          revenueByDay[orderDate] += order.total || 0;
        }
      });

    return Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue,
      formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
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
      order.items?.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            title: item.title,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].revenue += item.unit_price * item.quantity;
      });
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
    const totalRevenue = analyticsData.orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + (order.total || 0), 0);

    const totalOrders = analyticsData.orders.length;
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
              {revenueData.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-graph-up display-4 text-muted"></i>
                  <p className="text-muted mt-2">No revenue data available</p>
                </div>
              ) : (
                <div className="revenue-chart">
                  <div className="d-flex justify-content-between align-items-end" style={{ height: '200px' }}>
                    {revenueData.map((data, index) => {
                      const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
                      const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                      
                      return (
                        <div key={index} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                          <div 
                            className="bg-primary rounded-top"
                            style={{ 
                              height: `${height}%`, 
                              width: '20px',
                              minHeight: data.revenue > 0 ? '4px' : '0px'
                            }}
                            title={`${data.formattedDate}: ${formatPrice(data.revenue)}`}
                          ></div>
                          <small className="text-muted mt-2" style={{ fontSize: '0.7rem' }}>
                            {data.formattedDate}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </div>
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

      {/* Export Options */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Export Data</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button className="btn btn-outline-primary w-100">
                    <i className="bi bi-download me-2"></i>
                    Export Revenue
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button className="btn btn-outline-success w-100">
                    <i className="bi bi-download me-2"></i>
                    Export Orders
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button className="btn btn-outline-info w-100">
                    <i className="bi bi-download me-2"></i>
                    Export Products
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button className="btn btn-outline-warning w-100">
                    <i className="bi bi-download me-2"></i>
                    Export All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}