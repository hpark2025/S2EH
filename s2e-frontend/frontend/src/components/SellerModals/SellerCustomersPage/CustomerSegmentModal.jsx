import { useState } from 'react'
import PropTypes from 'prop-types'

export default function CustomerSegmentModal({ show, onClose }) {
  const [activeSegment, setActiveSegment] = useState('vip')

  if (!show) return null

  // Sample segment data
  const segments = {
    vip: {
      id: 'vip',
      name: 'VIP Customers',
      description: 'High-value customers with significant purchase history',
      customerCount: 28,
      totalRevenue: 285420,
      avgOrderValue: 10194,
      customers: [
        {
          id: 1,
          name: 'Juan Dela Cruz',
          email: 'juan@email.com',
          totalOrders: 12,
          totalSpent: 18500,
          lastOrder: '2024-12-10'
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria@email.com',
          totalOrders: 8,
          totalSpent: 15200,
          lastOrder: '2024-12-12'
        },
        {
          id: 3,
          name: 'Roberto Garcia',
          email: 'roberto@email.com',
          totalOrders: 15,
          totalSpent: 22800,
          lastOrder: '2024-12-14'
        }
      ]
    },
    new: {
      id: 'new',
      name: 'New Customers',
      description: 'Recently registered customers',
      customerCount: 45,
      totalRevenue: 67890,
      avgOrderValue: 1508,
      customers: [
        {
          id: 4,
          name: 'Ana Reyes',
          email: 'ana@email.com',
          totalOrders: 1,
          totalSpent: 850,
          lastOrder: '2024-12-13'
        },
        {
          id: 5,
          name: 'Carlos Mendoza',
          email: 'carlos@email.com',
          totalOrders: 2,
          totalSpent: 1420,
          lastOrder: '2024-12-15'
        }
      ]
    },
    inactive: {
      id: 'inactive',
      name: 'Inactive Customers',
      description: 'Customers who haven\'t ordered recently',
      customerCount: 56,
      totalRevenue: 89340,
      avgOrderValue: 2145,
      customers: [
        {
          id: 6,
          name: 'Elena Rodriguez',
          email: 'elena@email.com',
          totalOrders: 5,
          totalSpent: 3200,
          lastOrder: '2024-09-15'
        }
      ]
    }
  }

  const currentSegment = segments[activeSegment]

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

  const exportSegment = (segmentId) => {
    const segment = segments[segmentId]
    const csvContent = [
      ['Name', 'Email', 'Total Orders', 'Total Spent', 'Last Order'],
      ...segment.customers.map(customer => [
        customer.name,
        customer.email,
        customer.totalOrders,
        customer.totalSpent,
        customer.lastOrder
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${segment.name.replace(/\s+/g, '_').toLowerCase()}_customers.csv`
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
              <i className="bi bi-people me-2"></i>
              Customer Segments
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
              View and analyze different customer segments based on their purchase behavior and engagement levels.
            </div>

            {/* Segment Selector */}
            <div className="mb-3">
              <label className="form-label fw-bold">Select Segment</label>
              <div className="row">
                {Object.values(segments).map((segment) => (
                  <div key={segment.id} className="col-md-4 mb-2">
                    <button
                      type="button"
                      className={`btn w-100 text-start ${
                        activeSegment === segment.id ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                      onClick={() => setActiveSegment(segment.id)}
                    >
                      <div className="fw-bold">{segment.name}</div>
                      <div className="small">{segment.customerCount} customers</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Segment Statistics */}
            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0">{currentSegment.name}</h6>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => exportSegment(activeSegment)}
                >
                  <i className="bi bi-download me-1"></i>Export
                </button>
              </div>
              <p className="text-muted small mb-2">{currentSegment.description}</p>
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="fw-bold text-primary">{currentSegment.customerCount}</div>
                  <small className="text-muted">Customers</small>
                </div>
                <div className="col-md-4">
                  <div className="fw-bold text-success">{formatCurrency(currentSegment.totalRevenue)}</div>
                  <small className="text-muted">Total Revenue</small>
                </div>
                <div className="col-md-4">
                  <div className="fw-bold text-info">{formatCurrency(currentSegment.avgOrderValue)}</div>
                  <small className="text-muted">Avg Order Value</small>
                </div>
              </div>
            </div>

            {/* Segment Criteria */}
            <div className="mb-3">
              <label className="form-label fw-bold">Segment Criteria</label>
              <div className="bg-light p-2 rounded">
                {activeSegment === 'vip' && (
                  <ul className="list-unstyled mb-0">
                    <li><i className="bi bi-check-circle text-success me-2"></i>Total order value &gt; ₱10,000</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Customer for &gt; 6 months</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Average order frequency: Monthly</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>High engagement score</li>
                  </ul>
                )}
                {activeSegment === 'new' && (
                  <ul className="list-unstyled mb-0">
                    <li><i className="bi bi-check-circle text-success me-2"></i>Registered in last 7 days</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Less than 3 orders</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Account verification completed</li>
                  </ul>
                )}
                {activeSegment === 'inactive' && (
                  <ul className="list-unstyled mb-0">
                    <li><i className="bi bi-check-circle text-success me-2"></i>No orders in last 90 days</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Previously active customer</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Total lifetime value &gt; ₱500</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Customer List */}
            <div className="mb-3">
              <label className="form-label fw-bold">Customers in Segment</label>
              <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="table table-sm">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Customer</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                      <th>Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSegment.customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>
                          <div className="fw-bold">{customer.name}</div>
                          <div className="small text-muted">{customer.email}</div>
                        </td>
                        <td>{customer.totalOrders}</td>
                        <td>{formatCurrency(customer.totalSpent)}</td>
                        <td><small>{formatDate(customer.lastOrder)}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Segment Actions */}
            <div className="bg-light p-3 rounded">
              <h6 className="fw-bold mb-2">Segment Actions</h6>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <button className="btn btn-outline-primary btn-sm w-100">
                    <i className="bi bi-envelope me-2"></i>Send Campaign
                  </button>
                </div>
                <div className="col-md-6 mb-2">
                  <button className="btn btn-outline-success btn-sm w-100">
                    <i className="bi bi-tag me-2"></i>Create Promotion
                  </button>
                </div>
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
            <button 
              type="button" 
              className="btn btn-outline-primary"
              onClick={() => exportSegment(activeSegment)}
            >
              <i className="bi bi-download me-2"></i>Export Segment
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
            >
              <i className="bi bi-plus me-2"></i>Create New Segment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

CustomerSegmentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}