import { useState, useEffect } from 'react'

const UpdateStatusModal = ({ show, onClose, onUpdate, order }) => {
  const [orderId, setOrderId] = useState('')
  const [currentStatus, setCurrentStatus] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState('')
  const [newPaymentStatus, setNewPaymentStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [notes, setNotes] = useState('')

  // Populate form when order prop changes
  useEffect(() => {
    if (order) {
      setOrderId(order.id || '')
      setCurrentStatus(order.status || '')
      setNewStatus(order.status || '')
      setCurrentPaymentStatus(order.payment || '')
      setNewPaymentStatus(order.payment || '')
      setTrackingNumber(order.trackingNumber || '')
      setCancellationReason('')
      setRefundAmount(order.amount?.toString() || '')
      setNotes('')
    }
  }, [order])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!newStatus) {
      alert('Please select a new status')
      return
    }

    // Validate tracking number if status is shipped
    if (newStatus === 'shipped' && !trackingNumber) {
      alert('Tracking number is required for shipped orders')
      return
    }

    // Validate cancellation reason if status is cancelled
    if (newStatus === 'cancelled' && !cancellationReason) {
      alert('Cancellation reason is required')
      return
    }

    const updateData = {
      id: orderId,
      status: newStatus,
      paymentStatus: newPaymentStatus,
      trackingNumber: trackingNumber || undefined,
      cancellationReason: newStatus === 'cancelled' ? cancellationReason : undefined,
      refundAmount: newStatus === 'cancelled' && refundAmount ? parseFloat(refundAmount) : undefined,
      notes,
      updatedAt: new Date().toISOString()
    }

    onUpdate(orderId, updateData)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setOrderId('')
    setCurrentStatus('')
    setNewStatus('')
    setCurrentPaymentStatus('')
    setNewPaymentStatus('')
    setTrackingNumber('')
    setCancellationReason('')
    setRefundAmount('')
    setNotes('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

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

  if (!show) return null

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-arrow-repeat text-primary me-2"></i>
              Update Order Status
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="updateOrderId" className="form-label">Order ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="updateOrderId"
                  value={orderId}
                  readOnly
                />
              </div>

              {/* Current Status Display */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Current Order Status</label>
                  <div>
                    <span className={`status-badge ${getStatusBadgeClass(currentStatus)}`}>
                      {currentStatus?.charAt(0).toUpperCase() + currentStatus?.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Current Payment Status</label>
                  <div>
                    <span className={`status-badge ${getPaymentBadgeClass(currentPaymentStatus)}`}>
                      {currentPaymentStatus?.charAt(0).toUpperCase() + currentPaymentStatus?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* New Status Selection */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="newOrderStatus" className="form-label">New Order Status *</label>
                  <select 
                    className="form-select" 
                    id="newOrderStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="">Select New Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="newPaymentStatus" className="form-label">New Payment Status</label>
                  <select 
                    className="form-select" 
                    id="newPaymentStatus"
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                  >
                    <option value="">Keep Current</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fields */}
              
              {/* Tracking Number - Show for shipped/completed */}
              {(newStatus === 'shipped' || newStatus === 'completed') && (
                <div className="mb-3">
                  <label htmlFor="updateTrackingNumber" className="form-label">
                    Tracking Number {newStatus === 'shipped' ? '*' : ''}
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="updateTrackingNumber"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    required={newStatus === 'shipped'}
                  />
                  <div className="form-text">
                    Provide tracking number for shipment monitoring
                  </div>
                </div>
              )}

              {/* Cancellation Reason - Show for cancelled */}
              {newStatus === 'cancelled' && (
                <>
                  <div className="mb-3">
                    <label htmlFor="cancellationReason" className="form-label">Cancellation Reason *</label>
                    <select 
                      className="form-select" 
                      id="cancellationReason"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      required
                    >
                      <option value="">Select Reason</option>
                      <option value="customer_request">Customer Request</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="payment_failed">Payment Failed</option>
                      <option value="address_issue">Address Issue</option>
                      <option value="quality_issue">Quality Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="refundAmount" className="form-label">Refund Amount</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="refundAmount"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                      step="0.01"
                      min="0"
                    />
                    <div className="form-text">
                      Leave empty if no refund is needed
                    </div>
                  </div>
                </>
              )}

              <div className="mb-3">
                <label htmlFor="updateNotes" className="form-label">Additional Notes</label>
                <textarea 
                  className="form-control" 
                  id="updateNotes" 
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this status update..."
                ></textarea>
              </div>

              {/* Warning for status changes */}
              {newStatus && newStatus !== currentStatus && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This will change the order status from{' '}
                  <strong>{currentStatus}</strong> to <strong>{newStatus}</strong>.
                  {newStatus === 'cancelled' && ' This action cannot be undone.'}
                  {newStatus === 'completed' && ' The customer will be notified of delivery.'}
                </div>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
              <i className="bi bi-check-circle me-1"></i>
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateStatusModal