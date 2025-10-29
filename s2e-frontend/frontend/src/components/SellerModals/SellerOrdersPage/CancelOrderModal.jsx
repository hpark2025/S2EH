import { useState } from 'react'
import PropTypes from 'prop-types'

export default function CancelOrderModal({ show, onClose, order, onCancelOrder }) {
  const [processing, setProcessing] = useState(false)
  const [cancelData, setCancelData] = useState({
    reason: '',
    refundMethod: '',
    refundAmount: '',
    customerNotification: true,
    internalNotes: ''
  })

  if (!show || !order) return null

  const cancelReasons = [
    'Customer requested cancellation',
    'Product out of stock',
    'Payment issues',
    'Unable to fulfill order',
    'Shipping not available',
    'Other (please specify in notes)'
  ]

  const refundMethods = [
    { value: 'original', label: 'Original payment method' },
    { value: 'gcash', label: 'GCash' },
    { value: 'bank', label: 'Bank transfer' },
    { value: 'store-credit', label: 'Store credit' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      await onCancelOrder(order.id, cancelData)
      onClose()
    } catch (error) {
      console.error('Error cancelling order:', error)
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-x-circle me-2"></i>
              Cancel Order
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              You are about to cancel order #{order.orderNumber}. This action cannot be undone.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Order ID</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={order.orderNumber || order.id} 
                    disabled 
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Order Total</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formatCurrency(order.total || 0)} 
                    disabled 
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="cancelReason" className="form-label">
                  Cancellation Reason <span className="text-danger">*</span>
                </label>
                <select 
                  className="form-select" 
                  id="cancelReason"
                  value={cancelData.reason}
                  onChange={(e) => setCancelData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                >
                  <option value="">Select a reason</option>
                  {cancelReasons.map((reason, index) => (
                    <option key={index} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="refundMethod" className="form-label">
                    Refund Method <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-select" 
                    id="refundMethod"
                    value={cancelData.refundMethod}
                    onChange={(e) => setCancelData(prev => ({ ...prev, refundMethod: e.target.value }))}
                    required
                  >
                    <option value="">Select refund method</option>
                    {refundMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="refundAmount" className="form-label">
                    Refund Amount <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    id="refundAmount"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max={order.total || 0}
                    value={cancelData.refundAmount}
                    onChange={(e) => setCancelData(prev => ({ ...prev, refundAmount: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="internalNotes" className="form-label">
                  Internal Notes <span className="text-muted">(Optional)</span>
                </label>
                <textarea
                  className="form-control"
                  id="internalNotes"
                  rows="3"
                  placeholder="Add any internal notes about the cancellation..."
                  value={cancelData.internalNotes}
                  onChange={(e) => setCancelData(prev => ({ ...prev, internalNotes: e.target.value }))}
                  maxLength={500}
                />
              </div>

              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="customerNotification"
                  checked={cancelData.customerNotification}
                  onChange={(e) => setCancelData(prev => ({ ...prev, customerNotification: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="customerNotification">
                  Send cancellation notification to customer
                </label>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={processing}
            >
              <i className="bi bi-x-lg me-2"></i>Close
            </button>
            <button 
              type="submit"
              className="btn btn-danger"
              onClick={handleSubmit}
              disabled={processing || !cancelData.reason || !cancelData.refundMethod || !cancelData.refundAmount}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Cancelling...
                </>
              ) : (
                <>
                  <i className="bi bi-x-circle me-2"></i>Cancel Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

CancelOrderModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    orderNumber: PropTypes.string,
    total: PropTypes.number,
    status: PropTypes.string
  }),
  onCancelOrder: PropTypes.func.isRequired
}