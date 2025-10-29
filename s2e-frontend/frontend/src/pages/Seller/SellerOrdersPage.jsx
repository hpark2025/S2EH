import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.orders.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await sellerAPI.orders.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-warning',
      'confirmed': 'bg-info',
      'processing': 'bg-primary',
      'shipped': 'bg-success',
      'delivered': 'bg-success',
      'cancelled': 'bg-danger',
      'returned': 'bg-secondary'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price / 100);
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': ['returned'],
      'cancelled': [],
      'returned': []
    };
    return statusFlow[currentStatus] || [];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      switch (filterDate) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + (order.total || 0), 0);
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      revenue: getTotalRevenue()
    };
    return stats;
  };

  const stats = getOrderStats();

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
    <div className="seller-orders-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Orders</h2>
        <div className="text-end">
          <small className="text-muted">Last updated: {new Date().toLocaleTimeString()}</small>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{stats.total}</h4>
              <small>Total Orders</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h4>{stats.pending}</h4>
              <small>Pending</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h4>{stats.processing}</h4>
              <small>Processing</small>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4>{stats.delivered}</h4>
              <small>Delivered</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-dark text-white">
            <div className="card-body text-center">
              <h4>{formatPrice(stats.revenue)}</h4>
              <small>Total Revenue</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <div className="col-md-2">
          <div className="text-end">
            <span className="badge bg-info">
              {filteredOrders.length} orders
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt display-1 text-muted"></i>
              <h4 className="mt-3">No orders found</h4>
              <p className="text-muted">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id.slice(-8)}</strong>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{order.customer?.first_name} {order.customer?.last_name}</div>
                          <small className="text-muted">{order.customer?.email}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td>
                        <strong>{formatPrice(order.total)}</strong>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openOrderModal(order)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {getStatusOptions(order.status).length > 0 && (
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-outline-success dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                title="Update Status"
                              >
                                <i className="bi bi-arrow-up-circle"></i>
                              </button>
                              <ul className="dropdown-menu">
                                {getStatusOptions(order.status).map((status) => (
                                  <li key={status}>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleUpdateOrderStatus(order.id, status)}
                                    >
                                      Mark as {status}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Details #{selectedOrder.id.slice(-8)}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOrderModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p>
                      <strong>Name:</strong> {selectedOrder.customer?.first_name} {selectedOrder.customer?.last_name}<br />
                      <strong>Email:</strong> {selectedOrder.customer?.email}<br />
                      <strong>Phone:</strong> {selectedOrder.customer?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p>
                      <strong>Status:</strong> <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.status}</span><br />
                      <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}<br />
                      <strong>Total:</strong> {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                </div>

                <h6 className="mt-4">Order Items</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.title}</td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.unit_price)}</td>
                          <td>{formatPrice(item.unit_price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedOrder.shipping_address && (
                  <div className="mt-4">
                    <h6>Shipping Address</h6>
                    <p>
                      {selectedOrder.shipping_address.address_1}<br />
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province}<br />
                      {selectedOrder.shipping_address.postal_code}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOrderModal(false)}
                >
                  Close
                </button>
                {getStatusOptions(selectedOrder.status).length > 0 && (
                  <div className="dropdown">
                    <button
                      className="btn btn-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      Update Status
                    </button>
                    <ul className="dropdown-menu">
                      {getStatusOptions(selectedOrder.status).map((status) => (
                        <li key={status}>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              handleUpdateOrderStatus(selectedOrder.id, status);
                              setShowOrderModal(false);
                            }}
                          >
                            Mark as {status}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}