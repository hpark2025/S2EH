import { useState } from 'react'
import PropTypes from 'prop-types'

export default function ProcessOrderModal({ show, onClose, order, onProcess }) {
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [trackingNumber, setTrackingNumber] = useState('')

  if (!show || !order) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const processData = {
        orderId: order.id,
        status: 'processing',
        notes,
        estimatedDelivery,
        shippingMethod,
        trackingNumber,
        processedAt: new Date().toISOString(),
        processedBy: 'Current User'
      }

      await onProcess(processData)
      
      // Reset form
      setNotes('')
      setEstimatedDelivery('')
      setShippingMethod('standard')
      setTrackingNumber('')
      
      onClose()
    } catch (error) {
      console.error('Error processing order:', error)
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

  const getMinDeliveryDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  const getMaxDeliveryDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 30)
    return today.toISOString().split('T')[0]
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-gear me-2"></i>
              Process Order
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
              Process this order by setting shipping details and estimated delivery date. This will change the order status to "Processing".
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>Order ID:</strong>
                  <p className="mb-1 font-monospace">{order.id}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Customer:</strong>
                  <p className="mb-1">{order.customer?.name || order.customer}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Total Amount:</strong>
                  <p className="mb-1 fw-bold text-success">{formatCurrency(order.total)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Items:</strong>
                  <p className="mb-1">{order.items} item(s)</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="shippingMethod" className="form-label">
                    <i className="bi bi-truck me-2"></i>Shipping Method
                  </label>
                  <select 
                    className="form-select" 
                    id="shippingMethod"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    required
                  >
                    <option value="standard">Standard Delivery (3-5 days)</option>
                    <option value="express">Express Delivery (1-2 days)</option>
                    <option value="same-day">Same Day Delivery</option>
                    <option value="pickup">Store Pickup</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="estimatedDelivery" className="form-label">
                    <i className="bi bi-calendar me-2"></i>Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="estimatedDelivery"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    min={getMinDeliveryDate()}
                    max={getMaxDeliveryDate()}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="trackingNumber" className="form-label">
                    <i className="bi bi-qr-code me-2"></i>Tracking Number
                    <span className="text-muted ms-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="trackingNumber"
                    placeholder="Enter tracking number if available"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    maxLength={50}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="notes" className="form-label">
                    <i className="bi bi-sticky me-2"></i>Processing Notes
                    <span className="text-muted ms-1">(Optional)</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    rows="3"
                    placeholder="Add any notes about order processing..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                  />
                  <div className="form-text">
                    {notes.length}/500 characters
                  </div>
                </div>
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
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-gear me-2"></i>Process Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ProcessOrderModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    customer: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    items: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    total: PropTypes.number.isRequired,
    address: PropTypes.string
  }).isRequired,
  onProcess: PropTypes.func.isRequired
}