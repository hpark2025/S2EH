import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export default function ShipOrderModal({ show, onClose, order, onShipOrder }) {
  const [processing, setProcessing] = useState(false)
  const [shipmentData, setShipmentData] = useState({
    carrier: '',
    trackingNumber: '',
    estimatedDelivery: '',
    shippingMethod: '',
    shippingCost: '',
    customerNotification: true,
    notes: ''
  })

  useEffect(() => {
    if (show && order) {
      // Set estimated delivery date (3-7 days from now)
      const estimatedDate = new Date()
      estimatedDate.setDate(estimatedDate.getDate() + 5)
      setShipmentData(prev => ({
        ...prev,
        estimatedDelivery: estimatedDate.toISOString().split('T')[0]
      }))
    }
  }, [show, order])

  if (!show || !order) return null

  const carriers = [
    { value: 'jnt', label: 'J&T Express', icon: 'bi-truck' },
    { value: 'lbc', label: 'LBC Express', icon: 'bi-truck' },
    { value: 'jrs', label: 'JRS Express', icon: 'bi-truck' },
    { value: 'ninja-van', label: 'Ninja Van', icon: 'bi-truck' },
    { value: 'grab-express', label: 'Grab Express', icon: 'bi-truck' }
  ]

  const shippingMethods = [
    'Standard Delivery',
    'Express Delivery',
    'Same Day Delivery',
    'Next Day Delivery',
    'Pickup'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      await onShipOrder(order.id, shipmentData)
      onClose()
    } catch (error) {
      console.error('Error shipping order:', error)
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

  const generateTrackingNumber = () => {
    const prefix = shipmentData.carrier.toUpperCase()
    const numbers = Math.random().toString().substr(2, 10)
    return `${prefix}${numbers}`
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-truck me-2"></i>
              Ship Order
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
              Mark order #{order.orderNumber} as shipped. Please provide shipping details and tracking information.
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

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="carrier" className="form-label">
                    Shipping Carrier <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-select" 
                    id="carrier"
                    value={shipmentData.carrier}
                    onChange={(e) => setShipmentData(prev => ({ ...prev, carrier: e.target.value }))}
                    required
                  >
                    <option value="">Select carrier</option>
                    {carriers.map((carrier) => (
                      <option key={carrier.value} value={carrier.value}>
                        {carrier.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="shippingMethod" className="form-label">
                    Shipping Method <span className="text-danger">*</span>
                  </label>
                  <select 
                    className="form-select" 
                    id="shippingMethod"
                    value={shipmentData.shippingMethod}
                    onChange={(e) => setShipmentData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                    required
                  >
                    <option value="">Select method</option>
                    {shippingMethods.map((method, index) => (
                      <option key={index} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-8 mb-3">
                  <label htmlFor="trackingNumber" className="form-label">
                    Tracking Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      id="trackingNumber"
                      placeholder="Enter tracking number"
                      value={shipmentData.trackingNumber}
                      onChange={(e) => setShipmentData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShipmentData(prev => ({ ...prev, trackingNumber: generateTrackingNumber() }))}
                      disabled={!shipmentData.carrier}
                    >
                      <i className="bi bi-arrow-repeat"></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="shippingCost" className="form-label">
                    Shipping Cost
                  </label>
                  <input 
                    type="number" 
                    className="form-control" 
                    id="shippingCost"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={shipmentData.shippingCost}
                    onChange={(e) => setShipmentData(prev => ({ ...prev, shippingCost: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="estimatedDelivery" className="form-label">
                  Estimated Delivery Date <span className="text-danger">*</span>
                </label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="estimatedDelivery"
                  min={new Date().toISOString().split('T')[0]}
                  value={shipmentData.estimatedDelivery}
                  onChange={(e) => setShipmentData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Shipping Notes <span className="text-muted">(Optional)</span>
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  rows="3"
                  placeholder="Add any shipping instructions or notes..."
                  value={shipmentData.notes}
                  onChange={(e) => setShipmentData(prev => ({ ...prev, notes: e.target.value }))}
                  maxLength={300}
                />
              </div>

              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="customerNotification"
                  checked={shipmentData.customerNotification}
                  onChange={(e) => setShipmentData(prev => ({ ...prev, customerNotification: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="customerNotification">
                  Send shipping notification to customer
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
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={processing || !shipmentData.carrier || !shipmentData.trackingNumber || !shipmentData.shippingMethod || !shipmentData.estimatedDelivery}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Shipping...
                </>
              ) : (
                <>
                  <i className="bi bi-truck me-2"></i>Ship Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ShipOrderModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    orderNumber: PropTypes.string,
    total: PropTypes.number,
    status: PropTypes.string
  }),
  onShipOrder: PropTypes.func.isRequired
}