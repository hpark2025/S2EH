import { useState } from 'react'
import PropTypes from 'prop-types'

export default function BulkActionModal({ show, onClose, selectedOrders, onBulkAction }) {
  const [processing, setProcessing] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [actionData, setActionData] = useState({
    status: '',
    carrier: '',
    notes: '',
    notifyCustomers: true
  })

  if (!show || !selectedOrders || selectedOrders.length === 0) return null

  const bulkActions = [
    {
      id: 'update-status',
      name: 'Update Order Status',
      icon: 'bi-arrow-clockwise',
      description: 'Change status for all selected orders'
    },
    {
      id: 'ship-orders',
      name: 'Ship All Orders',
      icon: 'bi-truck',
      description: 'Mark all orders as shipped'
    },
    {
      id: 'cancel-orders',
      name: 'Cancel All Orders',
      icon: 'bi-x-circle',
      description: 'Cancel all selected orders'
    },
    {
      id: 'generate-invoices',
      name: 'Generate Invoices',
      icon: 'bi-receipt',
      description: 'Generate invoices for all selected orders'
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      await onBulkAction({
        action: selectedAction,
        orders: selectedOrders,
        data: actionData
      })
      
      onClose()
    } catch (error) {
      console.error('Error processing bulk action:', error)
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

  const getTotalValue = () => {
    return selectedOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-list-check me-2"></i>
              Bulk Actions
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
              Perform bulk actions on {selectedOrders.length} selected order(s). Choose an action below to apply to all selected orders.
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <strong>Selected Orders: {selectedOrders.length}</strong>
                <p className="text-muted mb-1">Total Value: {formatCurrency(getTotalValue())}</p>
              </div>

              <div className="mb-3">
                <label className="form-label">Select Action:</label>
                <div className="row g-2">
                  {bulkActions.map((action) => (
                    <div key={action.id} className="col-md-6">
                      <input
                        type="radio"
                        className="btn-check"
                        name="bulkAction"
                        id={`action-${action.id}`}
                        value={action.id}
                        checked={selectedAction === action.id}
                        onChange={(e) => setSelectedAction(e.target.value)}
                      />
                      <label 
                        className="btn btn-outline-primary w-100 text-start" 
                        htmlFor={`action-${action.id}`}
                      >
                        <i className={`${action.icon} me-2`}></i>
                        <div>
                          <div className="fw-bold">{action.name}</div>
                          <small>{action.description}</small>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedAction === 'update-status' && (
                <div className="mb-3">
                  <label htmlFor="newStatus" className="form-label">New Status</label>
                  <select 
                    className="form-select" 
                    id="newStatus"
                    value={actionData.status}
                    onChange={(e) => setActionData(prev => ({ ...prev, status: e.target.value }))}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              {selectedAction === 'ship-orders' && (
                <div className="mb-3">
                  <label htmlFor="carrier" className="form-label">Shipping Carrier</label>
                  <select 
                    className="form-select" 
                    id="carrier"
                    value={actionData.carrier}
                    onChange={(e) => setActionData(prev => ({ ...prev, carrier: e.target.value }))}
                    required
                  >
                    <option value="">Select Carrier</option>
                    <option value="jnt">J&T Express</option>
                    <option value="lbc">LBC Express</option>
                    <option value="jrs">JRS Express</option>
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">
                  Notes <span className="text-muted">(Optional)</span>
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  rows="3"
                  placeholder="Add any additional notes..."
                  value={actionData.notes}
                  onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))}
                  maxLength={300}
                />
              </div>

              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="notifyCustomers"
                  checked={actionData.notifyCustomers}
                  onChange={(e) => setActionData(prev => ({ ...prev, notifyCustomers: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="notifyCustomers">
                  Notify customers about this action
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
              disabled={processing || !selectedAction}
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>Apply Action
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

BulkActionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedOrders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string,
    total: PropTypes.number
  })).isRequired,
  onBulkAction: PropTypes.func.isRequired
}