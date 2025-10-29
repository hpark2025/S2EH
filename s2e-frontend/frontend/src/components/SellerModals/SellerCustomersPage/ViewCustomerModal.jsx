import { useState } from 'react'
import PropTypes from 'prop-types'

export default function ViewCustomerModal({ show, onClose, customer }) {
  const [newNote, setNewNote] = useState('')

  if (!show || !customer) return null

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In real app, this would save to backend
      console.log('Adding note:', newNote)
      setNewNote('')
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-success',
      inactive: 'bg-warning text-dark',
      suspended: 'bg-danger',
      pending: 'bg-secondary'
    }
    return statusClasses[status] || 'bg-secondary'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= rating ? 'bi-star-fill' : 'bi-star'} text-warning`}
        ></i>
      )
    }
    return stars
  }

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
              Viewing detailed information for customer <strong>{customer.name}</strong>. You can add notes or update customer details below.
            </div>

            {/* Customer Basic Info */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Customer Name</label>
                <div className="form-control-plaintext">{customer.name}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Status</label>
                <div>
                  <span className={`badge ${getStatusBadge(customer.status)}`}>
                    {customer.status || 'Active'}
                  </span>
                  {customer.isVerified && (
                    <span className="badge bg-success ms-2">
                      <i className="bi bi-check-circle me-1"></i>Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Email</label>
                <div className="form-control-plaintext">{customer.email}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Phone</label>
                <div className="form-control-plaintext">{customer.phone || 'Not provided'}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Address</label>
              <div className="form-control-plaintext">
                {customer.address || 'No address provided'}
                {customer.location && <div className="text-muted small">{customer.location}</div>}
              </div>
            </div>

            {/* Account Information */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Join Date</label>
                <div className="form-control-plaintext">
                  {customer.joinDate ? formatDate(customer.joinDate) : 'Unknown'}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Account Type</label>
                <div className="form-control-plaintext">
                  <span className="badge bg-primary">
                    {customer.accountType || 'Regular Customer'}
                  </span>
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Last Login</label>
                <div className="form-control-plaintext">
                  {customer.lastLogin ? formatDate(customer.lastLogin) : 'Never'}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Customer Rating</label>
                <div className="form-control-plaintext">
                  {customer.rating ? renderStars(customer.rating) : 'Not rated'}
                  {customer.rating && <span className="ms-2">({customer.rating}/5)</span>}
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="bg-light p-3 rounded mb-3">
              <h6 className="fw-bold mb-2">
                <i className="bi bi-graph-up me-2"></i>Order Statistics
              </h6>
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="fw-bold h5 text-primary">{customer.totalOrders || 0}</div>
                  <small className="text-muted">Total Orders</small>
                </div>
                <div className="col-md-3">
                  <div className="fw-bold h5 text-success">{formatCurrency(customer.totalSpent || 0)}</div>
                  <small className="text-muted">Total Spent</small>
                </div>
                <div className="col-md-3">
                  <div className="fw-bold h5 text-info">{formatCurrency(customer.avgOrderValue || 0)}</div>
                  <small className="text-muted">Avg Order Value</small>
                </div>
                <div className="col-md-3">
                  <div className="fw-bold h5 text-warning">{customer.loyaltyPoints || 0}</div>
                  <small className="text-muted">Loyalty Points</small>
                </div>
              </div>
              {customer.loyaltyTier && (
                <div className="text-center mt-2">
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-award me-1"></i>{customer.loyaltyTier} Member
                  </span>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            {customer.orders && customer.orders.length > 0 && (
              <div className="mb-3">
                <label className="form-label fw-bold">Recent Orders</label>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.slice(0, 3).map((order, index) => (
                        <tr key={index}>
                          <td><small>{order.id}</small></td>
                          <td><small>{formatDate(order.date)}</small></td>
                          <td><small>{formatCurrency(order.total)}</small></td>
                          <td>
                            <span className={`badge ${getStatusBadge(order.status)} badge-sm`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customer Notes */}
            <div className="mb-3">
              <label className="form-label fw-bold">Customer Notes</label>
              <div className="mb-2">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a note about this customer..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    maxLength={200}
                  />
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>
              
              {customer.notes && customer.notes.length > 0 ? (
                <div className="border rounded p-2 bg-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {customer.notes.map((note, index) => (
                    <div key={index} className="border-bottom pb-2 mb-2 last:border-0">
                      <div className="small text-muted">
                        {formatDate(note.date)} - {note.author}
                      </div>
                      <div>{note.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted small">No notes available for this customer</div>
              )}
            </div>

            {/* Recent Activity */}
            {customer.activities && customer.activities.length > 0 && (
              <div className="mb-3">
                <label className="form-label fw-bold">Recent Activity</label>
                <div className="border rounded p-2 bg-light" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {customer.activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                      <small>{activity.action}</small>
                      <small className="text-muted">{formatDate(activity.date)}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-2"></i>Close
            </button>
            <button 
              type="button" 
              className="btn btn-outline-primary"
            >
              <i className="bi bi-envelope me-2"></i>Send Message
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
            >
              <i className="bi bi-pencil me-2"></i>Edit Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ViewCustomerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    location: PropTypes.string,
    status: PropTypes.string,
    accountType: PropTypes.string,
    isVerified: PropTypes.bool,
    joinDate: PropTypes.string,
    lastLogin: PropTypes.string,
    totalOrders: PropTypes.number,
    totalSpent: PropTypes.number,
    avgOrderValue: PropTypes.number,
    loyaltyPoints: PropTypes.number,
    loyaltyTier: PropTypes.string,
    rating: PropTypes.number,
    orders: PropTypes.array,
    activities: PropTypes.array,
    notes: PropTypes.array
  })
}