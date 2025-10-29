import { useState, useEffect } from 'react'

const ViewOrderModal = ({ show, onClose, order }) => {
  const [orderData, setOrderData] = useState(null)

  // Populate data when order prop changes
  useEffect(() => {
    if (order) {
      // Transform order data for display
      const transformedData = {
        id: order.id || '',
        customer: {
          name: order.customer || '',
          phone: order.phone || '',
          email: order.email || ''
        },
        deliveryAddress: order.address || '',
        status: order.status || '',
        paymentStatus: order.payment || '',
        paymentMethod: order.paymentMethod || '',
        trackingNumber: order.trackingNumber || '',
        notes: order.notes || '',
        amount: order.amount || 0,
        date: order.date || '',
        deliveryType: order.deliveryType || '',
        // Sample items based on products
        items: [
          {
            id: 'PROD001',
            name: order.products?.main || 'Organic Vegetables',
            quantity: 2,
            price: 120,
            total: 240
          },
          {
            id: 'PROD002', 
            name: 'Fresh Milkfish',
            quantity: 1,
            price: 250,
            total: 250
          }
        ],
        timeline: [
          {
            status: 'Order Placed',
            date: order.date || 'Aug 30, 2025',
            time: '10:30 AM',
            description: 'Order has been placed and is being processed',
            active: true
          },
          {
            status: 'Payment Confirmed',
            date: order.date || 'Aug 30, 2025',
            time: '11:00 AM',
            description: 'Payment has been confirmed',
            active: order.payment === 'paid'
          },
          {
            status: 'Processing',
            date: 'Aug 30, 2025',
            time: '02:00 PM',
            description: 'Order is being prepared for shipment',
            active: ['processing', 'shipped', 'completed'].includes(order.status)
          },
          {
            status: 'Shipped',
            date: 'Aug 31, 2025',
            time: '09:00 AM',
            description: 'Order has been shipped and is on the way',
            active: ['shipped', 'completed'].includes(order.status)
          },
          {
            status: 'Delivered',
            date: 'Sep 01, 2025',
            time: '03:30 PM',
            description: 'Order has been successfully delivered',
            active: order.status === 'completed'
          }
        ]
      }
      setOrderData(transformedData)
    }
  }, [order])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'status-active'
      case 'processing': return 'status-pending'
      case 'shipped': return 'status-info'
      case 'pending': return 'status-warning'
      case 'cancelled': return 'status-danger'
      default: return 'status-secondary'
    }
  }

  const getPaymentBadgeClass = (payment) => {
    switch (payment) {
      case 'paid': return 'status-active'
      case 'pending': return 'status-warning'
      case 'refunded': return 'status-info'
      default: return 'status-secondary'
    }
  }

  const subtotal = orderData?.items?.reduce((sum, item) => sum + item.total, 0) || 0
  const shippingFee = 50
  const total = subtotal + shippingFee

  if (!show || !orderData) return null

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-eye text-info me-2"></i>
              Order Details - {orderData.id}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Order Status */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <h6 className="card-title mb-2">Order Status</h6>
                    <span className={`status-badge ${getStatusBadgeClass(orderData.status)}`}>
                      {orderData.status?.charAt(0).toUpperCase() + orderData.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <h6 className="card-title mb-2">Payment Status</h6>
                    <span className={`status-badge ${getPaymentBadgeClass(orderData.paymentStatus)}`}>
                      {orderData.paymentStatus?.charAt(0).toUpperCase() + orderData.paymentStatus?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-person me-2"></i>
                  Customer Information
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Name:</strong> {orderData.customer.name}</p>
                    <p><strong>Phone:</strong> {orderData.customer.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Email:</strong> {orderData.customer.email || 'Not provided'}</p>
                    <p><strong>Payment Method:</strong> {orderData.paymentMethod}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <p><strong>Delivery Address:</strong></p>
                    <p className="text-muted">{orderData.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-box me-2"></i>
                  Order Items
                </h6>
              </div>
              <div className="card-body">
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
                      {orderData.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>₱{item.price.toFixed(2)}</td>
                          <td>₱{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan="3">Subtotal</th>
                        <th>₱{subtotal.toFixed(2)}</th>
                      </tr>
                      <tr>
                        <th colSpan="3">Shipping Fee</th>
                        <th>₱{shippingFee.toFixed(2)}</th>
                      </tr>
                      <tr className="table-active">
                        <th colSpan="3">Total Amount</th>
                        <th>₱{total.toFixed(2)}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {orderData.trackingNumber && (
              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="bi bi-truck me-2"></i>
                    Tracking Information
                  </h6>
                </div>
                <div className="card-body">
                  <p><strong>Tracking Number:</strong> {orderData.trackingNumber}</p>
                  <p><strong>Delivery Type:</strong> {orderData.deliveryType}</p>
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Order Timeline
                </h6>
              </div>
              <div className="card-body">
                <div className="timeline">
                  {orderData.timeline.map((event, index) => (
                    <div key={index} className={`timeline-item ${event.active ? 'active' : ''}`}>
                      <div className="timeline-marker">
                        <i className={`bi ${event.active ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                      </div>
                      <div className="timeline-content">
                        <h6 className="timeline-title">{event.status}</h6>
                        <p className="timeline-description">{event.description}</p>
                        <small className="text-muted">{event.date} at {event.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            {orderData.notes && (
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="bi bi-sticky me-2"></i>
                    Notes
                  </h6>
                </div>
                <div className="card-body">
                  <p className="mb-0">{orderData.notes}</p>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary">
              <i className="bi bi-printer me-1"></i>
              Print Order
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles for timeline */}
      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-left: 2px solid #e9ecef;
        }
        
        .timeline-item.active {
          border-left-color: var(--primary-color);
        }
        
        .timeline-item:last-child {
          border-left: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .timeline-marker {
          position: absolute;
          left: -10px;
          top: 0;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .timeline-item.active .timeline-marker {
          color: var(--primary-color);
        }
        
        .timeline-content {
          margin-left: 20px;
        }
        
        .timeline-title {
          margin-bottom: 5px;
          font-size: 14px;
        }
        
        .timeline-description {
          margin-bottom: 5px;
          font-size: 13px;
          color: #6c757d;
        }
      `}</style>
    </div>
  )
}

export default ViewOrderModal