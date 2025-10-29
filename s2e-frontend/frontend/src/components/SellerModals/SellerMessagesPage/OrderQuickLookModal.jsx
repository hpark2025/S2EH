import { useState } from 'react'
import PropTypes from 'prop-types'

export default function OrderQuickLookModal({ show, onClose, order, onViewFullOrder }) {
  const [isLoading, setIsLoading] = useState(false)

  if (!show || !order) return null

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
      pending: 'warning text-dark',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    }
    return statusColors[status] || 'secondary'
  }

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      paid: 'success',
      pending: 'warning text-dark',
      failed: 'danger',
      refunded: 'info'
    }
    return statusColors[status] || 'secondary'
  }

  // Calculate order totals
  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
  const shipping = order.shippingFee || 0
  const tax = order.tax || 0
  const total = subtotal + shipping + tax

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-eye me-2"></i>
              Order Quick Look - #{order.id}
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
              Quick overview of order details, items, and status information.
            </div>

            {/* Order Status */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-3">
                <span className={`badge ${getStatusBadge(order.status)}`}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </span>
                <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`}>
                  {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                </span>
              </div>
              <div className="text-success fw-bold h5 mb-0">
                {formatCurrency(total)}
              </div>
            </div>

            {/* Order Date */}
            <div className="mb-3">
              <label className="form-label text-muted">Order Date</label>
              <div>{formatDate(order.createdAt)}</div>
            </div>

            {/* Customer Information */}
            <h6 className="text-muted mb-3">
              <i className="bi bi-person me-2"></i>Customer Information
            </h6>
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle me-3" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                  {order.customer?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="fw-medium">{order.customer?.name}</div>
                  <small className="text-muted">{order.customer?.email}</small>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted">Payment Method</label>
                <div>{order.paymentMethod || 'Cash on Delivery'}</div>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted">Transaction ID</label>
                <div>{order.transactionId ? <code>{order.transactionId}</code> : 'Not available'}</div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-3">
              <label className="form-label text-muted">Shipping Address</label>
              <div>{order.shippingAddress?.fullAddress || 'Not provided'}</div>
              <small className="text-muted">
                {order.shippingAddress?.city && order.shippingAddress?.postalCode && 
                  `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`
                }
              </small>
            </div>

            {/* Order Items */}
            <h6 className="text-muted mb-3">
              <i className="bi bi-bag me-2"></i>Order Items ({order.items?.length || 0})
            </h6>
            <div className="border rounded p-3 mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {order.items?.length > 0 ? order.items.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                  <div className="d-inline-flex align-items-center justify-content-center bg-light rounded me-3" style={{ width: '40px', height: '40px', fontSize: '0.8rem' }}>
                    <i className="bi bi-box"></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-medium">{item.name}</div>
                    <small className="text-muted">
                      {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                    </small>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted py-3">
                  <i className="bi bi-inbox"></i>
                  <p className="mb-0">No items found</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-light p-3 rounded">
              <div className="d-flex justify-content-between mb-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Shipping:</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Tax:</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span className="text-success">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="mt-3">
                <h6 className="text-muted mb-2">
                  <i className="bi bi-truck me-2"></i>Tracking Information
                </h6>
                <div className="mb-2">
                  <label className="form-label text-muted">Tracking Number</label>
                  <div><code>{order.trackingNumber}</code></div>
                </div>
                <div className="mb-2">
                  <label className="form-label text-muted">Carrier</label>
                  <div>{order.carrier || 'Not specified'}</div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="bi bi-x-lg me-2"></i>Close
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={async () => {
                if (onViewFullOrder) {
                  setIsLoading(true)
                  try {
                    await new Promise(resolve => setTimeout(resolve, 500))
                    onViewFullOrder(order)
                  } catch (error) {
                    console.error('Error viewing full order:', error)
                  } finally {
                    setIsLoading(false)
                  }
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Loading...
                </>
              ) : (
                <>
                  <i className="bi bi-eye me-2"></i>View Full Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

OrderQuickLookModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    paymentStatus: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string,
    paymentDate: PropTypes.string,
    transactionId: PropTypes.string,
    trackingNumber: PropTypes.string,
    carrier: PropTypes.string,
    estimatedDelivery: PropTypes.string,
    shippedAt: PropTypes.string,
    deliveredAt: PropTypes.string,
    shippingFee: PropTypes.number,
    tax: PropTypes.number,
    customer: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      phone: PropTypes.string,
      avatar: PropTypes.string,
      totalOrders: PropTypes.number
    }),
    shippingAddress: PropTypes.shape({
      fullAddress: PropTypes.string,
      city: PropTypes.string,
      postalCode: PropTypes.string
    }),
    items: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
      image: PropTypes.string,
      variant: PropTypes.string
    }))
  }),
  onViewFullOrder: PropTypes.func.isRequired
}