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

  // Get authentication token
  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' || name === 'token' || name === 'seller_token' || name === 'user_token') {
        return value;
      }
    }
    return localStorage.getItem('token') || 
           localStorage.getItem('sellerToken') || 
           localStorage.getItem('userToken');
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.log('❌ No auth token found');
        setOrders([]);
        setLoading(false);
        return;
      }

      console.log('📦 Loading seller orders from database...');
      
      const response = await fetch('http://localhost:8080/S2EH/s2e-backend/api/orders/index.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Response status:', response.status);

      const text = await response.text();
      console.log('📄 Response text:', text.substring(0, 500));

      const data = JSON.parse(text);
      console.log('✅ Orders response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders');
      }

      // Map database orders to component format
      const ordersData = data.data?.orders || data.orders || [];
      
      console.log('📦 Raw orders data:', ordersData);
      
      const mappedOrders = ordersData.map(order => {
        console.log('📦 Processing order:', order);
        console.log('📦 All order keys:', Object.keys(order));
        console.log('📦 Order first_name:', order.first_name);
        console.log('📦 Order last_name:', order.last_name);
        console.log('📦 Order customer_email:', order.customer_email);
        console.log('📦 Order user_id:', order.user_id);
        
        // Format customer data - backend returns first_name, last_name, customer_email directly for sellers
        // Handle null, empty strings, and whitespace
        const firstName = (order.first_name && order.first_name.trim()) || null;
        const lastName = (order.last_name && order.last_name.trim()) || null;
        const email = (order.customer_email && order.customer_email.trim()) || null;
        
        const customer = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: order.customer?.phone || null
        };
        
        console.log('📦 Mapped customer:', customer);
        console.log('📦 Customer has name:', !!(firstName || lastName));

        // Map order items
        const items = (order.items || []).map(item => ({
          title: item.product_title || item.title || 'Product',
          product_title: item.product_title || item.title,
          quantity: parseInt(item.quantity || 1),
          unit_price: parseFloat(item.unit_price || 0),
          subtotal: parseFloat(item.subtotal || 0)
        }));

        return {
          id: order.id,
          user_id: order.user_id, // Keep for debugging
          order_number: order.order_number || `ORD-${order.id}`,
          customer: customer,
          items: items,
          total: parseFloat(order.total || 0),
          status: order.status || 'pending',
          created_at: order.created_at,
          shipping_address: order.shipping_address || null,
          // Keep original order data for fallback
          first_name: order.first_name,
          last_name: order.last_name,
          customer_email: order.customer_email
        };
      });

      console.log('📦 Mapped orders:', mappedOrders);
      setOrders(mappedOrders);
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      toast.error(error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('🔄 Updating order status:', { orderId, newStatus, orderIdType: typeof orderId });
      // Ensure orderId is a string/number
      const orderIdStr = String(orderId);
      await sellerAPI.orders.updateOrderStatus(orderIdStr, { status: newStatus });
      const statusName = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      toast.success(`Order status updated to ${statusName}`);
      loadOrders();
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.status?.[0] || error.message || 'Failed to update order status';
      toast.error(errorMessage);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    const statusClasses = {
      'pending': 'bg-warning text-dark',
      'confirmed': 'bg-info text-white',
      'processing': 'bg-primary text-white',
      'shipped': 'bg-info text-white',
      'delivered': 'bg-success text-white',
      'cancelled': 'bg-danger text-white',
      'returned': 'bg-secondary text-white',
      'completed': 'bg-success text-white'
    };
    return statusClasses[normalizedStatus] || 'bg-secondary text-white';
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = (status || 'pending').toLowerCase();
    const baseStyle = { 
      padding: '6px 12px', 
      fontWeight: '500', 
      display: 'inline-block',
      borderRadius: '0.375rem',
      fontSize: '0.875em',
      lineHeight: '1',
      textAlign: 'center',
      verticalAlign: 'baseline',
      whiteSpace: 'nowrap'
    };
    
    if (normalizedStatus === 'delivered' || normalizedStatus === 'completed') {
      return { ...baseStyle, backgroundColor: '#28a745', color: '#ffffff' };
    } else if (normalizedStatus === 'pending') {
      return { ...baseStyle, backgroundColor: '#ffc107', color: '#000000' };
    } else if (normalizedStatus === 'processing') {
      return { ...baseStyle, backgroundColor: '#0d6efd', color: '#ffffff' };
    } else if (normalizedStatus === 'shipped' || normalizedStatus === 'confirmed') {
      return { ...baseStyle, backgroundColor: '#0dcaf0', color: '#000000' };
    } else if (normalizedStatus === 'cancelled') {
      return { ...baseStyle, backgroundColor: '#dc3545', color: '#ffffff' };
    }
    
    return baseStyle;
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₱0.00';
    // Price is already in PHP, not in cents
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
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
      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-body" style={{ overflow: 'visible' }}>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-receipt display-1 text-muted"></i>
              <h4 className="mt-3">No orders found</h4>
              <p className="text-muted">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflow: 'visible' }}>
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Products</th>
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
                        <strong>{order.order_number || `#${order.id}`}</strong>
                      </td>
                      <td>
                        <div>
                          {(() => {
                            const firstName = order.customer?.first_name || order.first_name;
                            const lastName = order.customer?.last_name || order.last_name;
                            const email = order.customer?.email || order.customer_email;
                            
                            if (firstName || lastName) {
                              return (
                                <>
                                  <div className="fw-bold">
                                    {(firstName || '').trim()} {(lastName || '').trim()}
                                  </div>
                                  <small className="text-muted">{email || 'No email'}</small>
                                </>
                              );
                            } else {
                              return (
                                <div className="text-muted">
                                  <div>N/A</div>
                                  <small style={{ fontSize: '0.75rem' }}>
                                    User ID: {order.user_id || 'N/A'}
                                  </small>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '200px' }}>
                          {order.items && order.items.length > 0 ? (
                            <div>
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="small">
                                  <span className="text-muted">
                                    {item.product_title || item.title || 'Product'} 
                                    {item.quantity > 1 && ` (x${item.quantity})`}
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="small text-muted">
                                  +{order.items.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="badge bg-secondary">No items</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{formatPrice(order.total)}</strong>
                      </td>
                      <td>
                        {(() => {
                          const normalizedStatus = (order.status || '').toLowerCase();
                          const isDelivered = normalizedStatus === 'delivered' || normalizedStatus === 'completed';
                          
                          if (isDelivered) {
                            return (
                              <span style={{ color: '#28a745', fontWeight: '600' }}>
                                DELIVERED
                              </span>
                            );
                          }
                          
                          return (
                            <span 
                              className={`badge ${getStatusBadge(order.status)}`}
                              style={getStatusStyle(order.status)}
                            >
                              {(order.status || 'PENDING').toUpperCase()}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="btn-group" role="group" style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openOrderModal(order)}
                            title="View Details"
                            style={{ minWidth: '38px' }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {getStatusOptions(order.status).length > 0 ? (
                            <div className="dropdown" style={{ position: 'relative' }}>
                              <button
                                className="btn btn-sm btn-outline-success dropdown-toggle"
                                type="button"
                                id={`statusDropdown-${order.id}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                title="Update Status"
                                style={{ minWidth: '38px' }}
                              >
                                <i className="bi bi-arrow-up-circle"></i>
                              </button>
                              <ul 
                                className="dropdown-menu" 
                                aria-labelledby={`statusDropdown-${order.id}`}
                                style={{ 
                                  position: 'absolute',
                                  zIndex: 1050,
                                  top: '100%',
                                  right: 0,
                                  marginTop: '0.125rem'
                                }}
                              >
                                {getStatusOptions(order.status).map((status) => (
                                  <li key={status}>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleUpdateOrderStatus(order.id, status)}
                                    >
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                              title="No status updates available"
                              style={{ minWidth: '38px', opacity: 0.5 }}
                            >
                              <i className="bi bi-lock"></i>
                            </button>
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
                <h5 className="modal-title">Order Details</h5>
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
                      <strong>Email:</strong> {selectedOrder.customer?.email}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p>
                      <strong>Status:</strong> <span 
                        className={`badge ${getStatusBadge(selectedOrder.status)}`}
                        style={getStatusStyle(selectedOrder.status)}
                      >{(selectedOrder.status || 'PENDING').toUpperCase()}</span><br />
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
                            {status.charAt(0).toUpperCase() + status.slice(1)}
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