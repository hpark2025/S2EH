import { useState } from 'react'
import PropTypes from 'prop-types'

export default function CustomerDetailsModal({ show, onClose, customer }) {
  if (!show || !customer) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'success',
      inactive: 'secondary',
      blocked: 'danger',
      pending: 'warning'
    }
    return `bg-${statusColors[status] || 'secondary'}`
  }

  const getOrderStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning text-dark',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    }
    return statusColors[status] || 'secondary'
  }

  // Mock data - in real app, this would come from props or API
  const customerStats = {
    totalOrders: customer.orders?.length || 0,
    totalSpent: customer.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0,
    averageOrderValue: 0,
    lastOrderDate: customer.orders?.[0]?.createdAt || null,
    joinDate: customer.joinDate || '2024-01-01',
    loyaltyPoints: customer.loyaltyPoints || 0
  }

  customerStats.averageOrderValue = customerStats.totalOrders > 0 
    ? customerStats.totalSpent / customerStats.totalOrders 
    : 0

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person me-2"></i>
              Customer Details
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              View detailed customer information, order history, and contact details.
            </div>

            {/* Customer Avatar and Basic Info */}
            <div className="text-center mb-3">
              <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-2" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                {customer.initials || customer.name?.substring(0, 2).toUpperCase()}
              </div>
              <h5 className="mb-1">{customer.name}</h5>
              <div className="d-flex justify-content-center align-items-center gap-2">
                <span className={`badge ${getStatusBadge(customer.status)}`}>
                  {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1)}
                </span>
                <small className="text-muted">
                  <i className="bi bi-calendar-event me-1"></i>
                  Member since {formatDate(customerStats.joinDate)}
                </small>
              </div>
            </div>

            {/* Customer Information */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted">Email Address</label>
                <div className="fw-medium">{customer.email}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted">Phone Number</label>
                <div>{customer.phone || 'Not provided'}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">Address</label>
              <div>{customer.address || customer.location || 'Not provided'}</div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted">Account Type</label>
                <div>
                  <span className="badge bg-primary">{customer.accountType || 'Regular'}</span>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted">Verification Status</label>
                <div>
                  {customer.isVerified ? (
                    <span className="badge bg-success">
                      <i className="bi bi-check-circle me-1"></i>Verified
                    </span>
                  ) : (
                    <span className="badge bg-warning text-dark">
                      <i className="bi bi-clock me-1"></i>Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Statistics */}
            <h6 className="text-muted mb-3 mt-4">
              <i className="bi bi-graph-up me-2"></i>Customer Statistics
            </h6>
            
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="h4 text-primary mb-0">{customerStats.totalOrders}</div>
                  <small className="text-muted">Total Orders</small>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="h4 text-success mb-0">{formatCurrency(customerStats.totalSpent)}</div>
                  <small className="text-muted">Total Spent</small>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="h4 text-info mb-0">{formatCurrency(customerStats.averageOrderValue)}</div>
                  <small className="text-muted">Avg Order</small>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="h4 text-warning mb-0">
                    <i className="bi bi-star-fill me-1"></i>{customerStats.loyaltyPoints}
                  </div>
                  <small className="text-muted">Loyalty Points</small>
                </div>
              </div>
            </div>

            {/* Customer Tags */}
            <div className="mb-3">
              <label className="form-label text-muted">Customer Tags</label>
              <div className="d-flex flex-wrap gap-1">
                <span className="badge bg-success">Regular Customer</span>
                <span className="badge bg-info">High Value</span>
                <span className="badge bg-warning text-dark">VIP</span>
                <span className="badge bg-primary">Loyal</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-3">
              <label className="form-label text-muted">Recent Activity</label>
              <div className="bg-light p-3 rounded">
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-success text-white rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                  <small>Order #ORD-001 delivered - 2 hours ago</small>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-info text-white rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                  <small>Sent message about product inquiry - 1 day ago</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                  <small>Placed new order #ORD-002 - 3 days ago</small>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-3">
              <label className="form-label text-muted">Quick Actions</label>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-chat-dots me-1"></i>Send Message
                </button>
                <button className="btn btn-sm btn-outline-success">
                  <i className="bi bi-telephone me-1"></i>Call Customer
                </button>
                <button className="btn btn-sm btn-outline-info">
                  <i className="bi bi-bag me-1"></i>View Orders
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-2"></i>Close
            </button>
            <button type="button" className="btn btn-primary">
              <i className="bi bi-chat-dots me-2"></i>Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

CustomerDetailsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string,
    address: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.string,
    location: PropTypes.string,
    accountType: PropTypes.string,
    isVerified: PropTypes.bool,
    joinDate: PropTypes.string,
    loyaltyPoints: PropTypes.number,
    orders: PropTypes.array
  })
}