import { useState } from 'react'
import PropTypes from 'prop-types'

export default function StockAdjustmentModal({ show, onClose, onSave, item }) {
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'increase',
    quantity: 0,
    reason: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    cost: 0
  })

  const [errors, setErrors] = useState({})

  if (!show || !item) return null

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setAdjustmentData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (adjustmentData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (!adjustmentData.reason) {
      newErrors.reason = 'Reason is required'
    }

    if (adjustmentData.type === 'decrease' && adjustmentData.quantity > item.currentStock) {
      newErrors.quantity = `Cannot decrease by more than current stock (${item.currentStock} ${item.unit})`
    }

    if (!adjustmentData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      const adjustmentWithCalculatedStock = {
        ...adjustmentData,
        itemId: item.id,
        itemName: item.productName,
        oldStock: item.currentStock,
        newStock: adjustmentData.type === 'increase' 
          ? item.currentStock + adjustmentData.quantity 
          : item.currentStock - adjustmentData.quantity,
        totalValue: adjustmentData.quantity * (adjustmentData.cost || item.costPrice || 0)
      }
      onSave(adjustmentWithCalculatedStock)
    }
  }

  const calculateNewStock = () => {
    if (adjustmentData.type === 'increase') {
      return item.currentStock + adjustmentData.quantity
    } else {
      return Math.max(0, item.currentStock - adjustmentData.quantity)
    }
  }

  const getStockStatus = (stockLevel) => {
    if (stockLevel === 0) return { status: 'Out of Stock', class: 'danger' }
    if (stockLevel <= item.minStockLevel) return { status: 'Low Stock', class: 'warning' }
    if (stockLevel <= item.reorderPoint) return { status: 'Reorder Soon', class: 'info' }
    return { status: 'In Stock', class: 'success' }
  }

  const currentStatus = getStockStatus(item.currentStock)
  const newStatus = getStockStatus(calculateNewStock())
  const newStock = calculateNewStock()

  const reasonOptions = {
    increase: [
      'New Stock Arrival',
      'Supplier Delivery',
      'Stock Return',
      'Production Completed',
      'Inventory Count Correction',
      'Other'
    ],
    decrease: [
      'Sale/Order Fulfillment',
      'Damaged Items',
      'Expired Items',
      'Theft/Loss',
      'Inventory Count Correction',
      'Other'
    ]
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-arrow-up-down me-2"></i>
              Stock Adjustment
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
              Adjust stock for <strong>{item.productName}</strong>. Current stock: {item.currentStock} {item.unit}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="bg-light p-3 rounded text-center">
                    <h6 className="text-muted mb-2">Current Stock</h6>
                    <div className="h4 mb-1">{item.currentStock} <small>{item.unit}</small></div>
                    <span className={`badge bg-${currentStatus.class}`}>{currentStatus.status}</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light p-3 rounded text-center">
                    <h6 className="text-muted mb-2">New Stock</h6>
                    <div className="h4 mb-1">{newStock} <small>{item.unit}</small></div>
                    <span className={`badge bg-${newStatus.class}`}>{newStatus.status}</span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Adjustment Type <span className="text-danger">*</span></label>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="type"
                        value="increase"
                        checked={adjustmentData.type === 'increase'}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label text-success">
                        <i className="bi bi-arrow-up me-1"></i>Increase Stock
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="type"
                        value="decrease"
                        checked={adjustmentData.type === 'decrease'}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label text-danger">
                        <i className="bi bi-arrow-down me-1"></i>Decrease Stock
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Quantity <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type="number"
                      className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                      name="quantity"
                      value={adjustmentData.quantity}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <span className="input-group-text">{item.unit}</span>
                  </div>
                  {errors.quantity && <div className="invalid-feedback d-block">{errors.quantity}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                    name="date"
                    value={adjustmentData.date}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Reason <span className="text-danger">*</span></label>
                <select
                  className={`form-select ${errors.reason ? 'is-invalid' : ''}`}
                  name="reason"
                  value={adjustmentData.reason}
                  onChange={handleInputChange}
                >
                  <option value="">Select a reason</option>
                  {reasonOptions[adjustmentData.type].map((reason, index) => (
                    <option key={index} value={reason}>{reason}</option>
                  ))}
                </select>
                {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Reference Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="reference"
                    value={adjustmentData.reference}
                    onChange={handleInputChange}
                    placeholder="e.g., PO-001, INV-123"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Cost per Unit</label>
                  <div className="input-group">
                    <span className="input-group-text">₱</span>
                    <input
                      type="number"
                      className="form-control"
                      name="cost"
                      value={adjustmentData.cost}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder={item.costPrice || '0.00'}
                    />
                  </div>
                  <small className="form-text text-muted">
                    Total Value: ₱{(adjustmentData.quantity * (adjustmentData.cost || item.costPrice || 0)).toFixed(2)}
                  </small>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  name="notes"
                  value={adjustmentData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes about this adjustment..."
                  maxLength={300}
                />
              </div>

              {/* Warnings */}
              {newStock <= item.minStockLevel && newStock > 0 && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> New stock level will be below minimum threshold ({item.minStockLevel} {item.unit}).
                </div>
              )}

              {newStock === 0 && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  <strong>Alert:</strong> This adjustment will result in zero stock.
                </div>
              )}
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="button" 
              className={`btn btn-${adjustmentData.type === 'increase' ? 'success' : 'warning'}`}
              onClick={handleSave}
            >
              <i className={`bi bi-arrow-${adjustmentData.type === 'increase' ? 'up' : 'down'} me-2`}></i>
              Apply {adjustmentData.type === 'increase' ? 'Increase' : 'Decrease'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

StockAdjustmentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    sku: PropTypes.string,
    currentStock: PropTypes.number.isRequired,
    minStockLevel: PropTypes.number,
    maxStockLevel: PropTypes.number,
    reorderPoint: PropTypes.number,
    unit: PropTypes.string.isRequired,
    costPrice: PropTypes.number
  })
}