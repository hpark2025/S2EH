import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';

export default function SellerDashboardPage() {
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
      (product.inventory_quantity || 0) < 10
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
    }).format(price / 100);
  };

  const getRecentOrders = () => {
    return dashboardData.orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  };

  const getLowStockProducts = () => {
    return dashboardData.products
      .filter(product => (product.inventory_quantity || 0) < 10)
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
    const monthlyRevenue = {};
    dashboardData.orders
      .filter(order => order.status === 'delivered')
      .forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.total || 0);
      });
    return monthlyRevenue;
  };

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
              <i className="bi bi-currency-dollar display-6"></i>
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
                  ? Math.round((dashboardData.analytics.totalRevenue / dashboardData.analytics.totalOrders) / 100)
                  : 0
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
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <a href="/seller/orders" className="btn btn-sm btn-outline-primary">
                View All
              </a>
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
                        <div className="fw-bold">#{order.id.slice(-8)}</div>
                        <small className="text-muted">
                          {order.customer?.first_name} {order.customer?.last_name}
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
              <a href="/seller/products" className="btn btn-sm btn-outline-primary">
                Manage Products
              </a>
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
                        <small className="text-muted">SKU: {product.handle}</small>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${product.inventory_quantity === 0 ? 'bg-danger' : 'bg-warning'}`}>
                          {product.inventory_quantity || 0} left
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
                <div className="row">
                  {Object.entries(getOrderStatusDistribution()).map(([status, count]) => (
                    <div key={status} className="col-6 mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-capitalize">{status}</span>
                        <span className="badge bg-primary">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
              {Object.keys(getRevenueByMonth()).length === 0 ? (
                <div className="text-center py-3">
                  <i className="bi bi-graph-up display-4 text-muted"></i>
                  <p className="text-muted mt-2">No revenue data available</p>
                </div>
              ) : (
                <div className="row">
                  {Object.entries(getRevenueByMonth()).map(([month, revenue]) => (
                    <div key={month} className="col-12 mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{month}</span>
                        <span className="fw-bold text-success">{formatPrice(revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <a href="/seller/products" className="btn btn-outline-primary w-100">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Product
                  </a>
                </div>
                <div className="col-md-3 mb-3">
                  <a href="/seller/orders" className="btn btn-outline-success w-100">
                    <i className="bi bi-receipt me-2"></i>
                    View Orders
                  </a>
                </div>
                <div className="col-md-3 mb-3">
                  <a href="/seller/analytics" className="btn btn-outline-info w-100">
                    <i className="bi bi-graph-up me-2"></i>
                    View Analytics
                  </a>
                </div>
                <div className="col-md-3 mb-3">
                  <a href="/seller/profile" className="btn btn-outline-warning w-100">
                    <i className="bi bi-person me-2"></i>
                    Update Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}