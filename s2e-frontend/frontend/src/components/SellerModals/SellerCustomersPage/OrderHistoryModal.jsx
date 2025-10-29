import { useState } from 'react'
import PropTypes from 'prop-types'

export default function OrderHistoryModal({ show, onClose, customer }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  if (!show || !customer) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-success',
      processing: 'bg-info',
      shipped: 'bg-primary',
      cancelled: 'bg-danger',
      pending: 'bg-warning text-dark'
    }
    return statusClasses[status] || 'bg-secondary'
  }

  // Sample orders data (in real app, this would come from props or API)
  const allOrders = customer.orders || [
    {
      id: 'ORD-001',
      date: '2024-12-15',
      items: [
        { name: 'Fresh Bangus', quantity: 2, price: 150 },
        { name: 'Rice (5kg)', quantity: 1, price: 200 }
      ],
      total: 500,
      status: 'completed',
      paymentMethod: 'GCash',
      shippingAddress: 'Sagnay, Camarines Sur'
    },
    {
      id: 'ORD-002',
      date: '2024-12-10',
      items: [
        { name: 'Organic Vegetables', quantity: 3, price: 100 }
      ],
      total: 300,
      status: 'shipped',
      paymentMethod: 'COD',
      shippingAddress: 'Sagnay, Camarines Sur'
    },
    {
      id: 'ORD-003',
      date: '2024-12-05',
      items: [
        { name: 'Local Chicken', quantity: 1, price: 350 },
        { name: 'Fresh Eggs', quantity: 2, price: 80 }
      ],
      total: 430,
      status: 'completed',
      paymentMethod: 'GCash',
      shippingAddress: 'Sagnay, Camarines Sur'
    }
  ]

  // Filter orders based on search and status
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: allOrders.length,
    completed: allOrders.filter(o => o.status === 'completed').length,
    processing: allOrders.filter(o => o.status === 'processing').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length,
    totalSpent: allOrders.reduce((sum, order) => sum + order.total, 0),
    avgOrderValue: allOrders.length ? allOrders.reduce((sum, order) => sum + order.total, 0) / allOrders.length : 0
  }

  const handleExportOrders = () => {
    // Simple CSV export simulation
    const csvContent = [
      ['Order ID', 'Date', 'Items', 'Total', 'Status', 'Payment Method'],
      ...filteredOrders.map(order => [
        order.id,
        order.date,
        order.items.map(item => `${item.name} (${item.quantity})`).join('; '),
        order.total,
        order.status,
        order.paymentMethod
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${customer.name}_orders.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-clock-history me-2"></i>
              Order History
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
              Order history for <strong>{customer.name}</strong>. Total orders: {stats.total}, Total spent: {formatCurrency(stats.totalSpent)}
            </div>

            {/* Order Statistics */}
            <div className="bg-light p-3 rounded mb-3">
              <h6 className="fw-bold mb-2">Order Summary</h6>
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="fw-bold text-primary">{stats.total}</div>
                  <small className="text-muted">Total Orders</small>
                </div>
                <div className="col-md-3">
                  <div className="fw-bold text-success">{stats.completed}</div>
                  <small className="text-muted">Completed</small>
                </div>
                <div className="col-md-3">
                  <div className="fw-bold text-info">{formatCurrency(stats.totalSpent)}</div>
                  <small className="text-muted">Total Spent</small>
                </div>
                <div className="col-md-3">
                  <div className="fw-bold text-warning">{formatCurrency(stats.avgOrderValue)}</div>
                  <small className="text-muted">Avg Order Value</small>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="row mb-3">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search orders or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold mb-0">Orders ({filteredOrders.length})</label>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleExportOrders}
                  disabled={filteredOrders.length === 0}
                >
                  <i className="bi bi-download me-1"></i>Export
                </button>
              </div>

              {filteredOrders.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded p-3 mb-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold">{order.id}</div>
                          <div className="text-muted small">{formatDate(order.date)}</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-success">{formatCurrency(order.total)}</div>
                          <span className={`badge ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <strong>Items:</strong>
                        <ul className="list-unstyled mb-0 ms-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="small">
                              {item.name} - Qty: {item.quantity} × {formatCurrency(item.price)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <small className="text-muted">
                            <strong>Payment:</strong> {order.paymentMethod}
                          </small>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">
                            <strong>Delivery:</strong> {order.shippingAddress}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-inbox display-6"></i>
                  <div className="mt-2">No orders found</div>
                  <small>Try adjusting your search or filter criteria</small>
                </div>
              )}
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
            <button 
              type="button" 
              className="btn btn-outline-primary"
              onClick={handleExportOrders}
              disabled={filteredOrders.length === 0}
            >
              <i className="bi bi-download me-2"></i>Export Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

OrderHistoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    joinDate: PropTypes.string,
    loyaltyPoints: PropTypes.number,
    orders: PropTypes.array
  })
}