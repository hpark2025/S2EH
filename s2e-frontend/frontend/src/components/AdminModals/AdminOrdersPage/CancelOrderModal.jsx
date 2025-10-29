import { useState, useEffect } from 'react'

const CancelOrderModal = ({ show, onClose, onCancel, order }) => {
  const [orderId, setOrderId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [orderAmount, setOrderAmount] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [refundRequired, setRefundRequired] = useState(false)
  const [refundMethod, setRefundMethod] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [notifyCustomer, setNotifyCustomer] = useState(true)
  const [internalNotes, setInternalNotes] = useState('')

  // Populate form when order prop changes
  useEffect(() => {
    if (order) {
      setOrderId(order.id || '')
      setCustomerName(order.customer || '')
      setOrderAmount(order.amount?.toString() || '')
      setCancellationReason('')
      setCustomReason('')
      setRefundRequired(order.payment === 'paid')
      setRefundMethod(order.paymentMethod || '')
      setRefundAmount(order.amount?.toString() || '')
      setNotifyCustomer(true)
      setInternalNotes('')
    }
  }, [order])

  const cancellationReasons = [
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'out_of_stock', label: 'Product Out of Stock' },
    { value: 'payment_failed', label: 'Payment Failed' },
    { value: 'fraud_suspicion', label: 'Fraud Suspicion' },
    { value: 'address_issue', label: 'Delivery Address Issue' },
    { value: 'quality_issue', label: 'Product Quality Issue' },
    { value: 'system_error', label: 'System Error' },
    { value: 'other', label: 'Other (Please specify)' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!cancellationReason) {
      alert('Please select a cancellation reason')
      return
    }

    if (cancellationReason === 'other' && !customReason.trim()) {
      alert('Please specify the custom reason')
      return
    }

    if (refundRequired && !refundMethod) {
      alert('Please select a refund method')
      return
    }

    if (refundRequired && (!refundAmount || parseFloat(refundAmount) <= 0)) {
      alert('Please enter a valid refund amount')
      return
    }

    const cancellationData = {
      id: orderId,
      reason: cancellationReason === 'other' ? customReason : cancellationReason,
      refundRequired,
      refundMethod: refundRequired ? refundMethod : null,
      refundAmount: refundRequired ? parseFloat(refundAmount) : 0,
      notifyCustomer,
      internalNotes,
      cancelledAt: new Date().toISOString(),
      cancelledBy: 'admin' // This would be the current admin user
    }

    onCancel(orderId, cancellationData)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setOrderId('')
    setCustomerName('')
    setOrderAmount('')
    setCancellationReason('')
    setCustomReason('')
    setRefundRequired(false)
    setRefundMethod('')
    setRefundAmount('')
    setNotifyCustomer(true)
    setInternalNotes('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <i className="bi bi-x-circle me-2"></i>
              Cancel Order
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> This action cannot be undone. The order will be permanently cancelled.
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="cancelOrderId" className="form-label">Order ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="cancelOrderId"
                  value={orderId}
                  readOnly
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="cancelCustomerName" className="form-label">Customer Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="cancelCustomerName"
                    value={customerName}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="cancelOrderAmount" className="form-label">Order Amount</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="cancelOrderAmount"
                    value={`₱${orderAmount}`}
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="cancellationReason" className="form-label">Cancellation Reason *</label>
                <select 
                  className="form-select" 
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  {cancellationReasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {cancellationReason === 'other' && (
                <div className="mb-3">
                  <label htmlFor="customReason" className="form-label">Custom Reason *</label>
                  <textarea 
                    className="form-control" 
                    id="customReason" 
                    rows="3"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Please specify the reason for cancellation..."
                    required
                  ></textarea>
                </div>
              )}

              <div className="mb-3">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="refundRequired"
                    checked={refundRequired}
                    onChange={(e) => setRefundRequired(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="refundRequired">
                    Refund Required
                  </label>
                </div>
              </div>

              {refundRequired && (
                <>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="refundMethod" className="form-label">Refund Method *</label>
                      <select 
                        className="form-select" 
                        id="refundMethod"
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        required
                      >
                        <option value="">Select Method</option>
                        <option value="gcash">GCash</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="cash">Cash Refund</option>
                        <option value="credit">Store Credit</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="refundAmount" className="form-label">Refund Amount *</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="refundAmount"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        max={orderAmount}
                        required
                      />
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Note:</strong> Refund will be processed within 3-5 business days using the selected method.
                  </div>
                </>
              )}

              <div className="mb-3">
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="notifyCustomer"
                    checked={notifyCustomer}
                    onChange={(e) => setNotifyCustomer(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="notifyCustomer">
                    Notify customer via email/SMS
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="internalNotes" className="form-label">Internal Notes</label>
                <textarea 
                  className="form-control" 
                  id="internalNotes" 
                  rows="3"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal notes for future reference (not visible to customer)..."
                ></textarea>
              </div>

              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Confirmation Required:</strong> 
                <ul className="mb-0 mt-2">
                  <li>Order will be marked as cancelled</li>
                  {refundRequired && <li>Refund of ₱{refundAmount} will be processed</li>}
                  {notifyCustomer && <li>Customer will be notified automatically</li>}
                  <li>This action cannot be reversed</li>
                </ul>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Keep Order
            </button>
            <button type="submit" className="btn btn-danger" onClick={handleSubmit}>
              <i className="bi bi-x-circle me-1"></i>
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CancelOrderModal