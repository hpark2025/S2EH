import { useState, useEffect } from 'react'

const RejectProductModal = ({ show, onClose, onReject, product }) => {
  const [rejectionReasonSelect, setRejectionReasonSelect] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [allowResubmission, setAllowResubmission] = useState(true)

  useEffect(() => {
    if (!show) {
      setRejectionReasonSelect('')
      setRejectionReason('')
      setAllowResubmission(true)
    }
  }, [show])

  const handleSubmit = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    const rejectionData = {
      reason: rejectionReason,
      reasonCategory: rejectionReasonSelect,
      allowResubmission,
      rejectedAt: new Date().toISOString(),
      rejectedBy: 'admin' // This would be the current admin user
    }

    onReject(product.id, rejectionData)
    onClose()
  }

  if (!show || !product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className="bi bi-x-circle text-danger me-2"></i>
            Reject Product
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <div className="text-center mb-3">
            <i className="bi bi-x-circle text-danger" style={{ fontSize: '3rem' }}></i>
          </div>
          <h6 className="text-center mb-3">Reject this product submission?</h6>
          
          <div className="product-info bg-light p-3 rounded mb-3">
            <div className="d-flex align-items-center">
              <img 
                src={product.image} 
                alt="Product" 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  objectFit: 'cover', 
                  borderRadius: '4px' 
                }} 
                className="me-3"
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                <small style={{ color: 'var(--secondary-color)' }}>
                  {product.category} • ₱{product.price} • {product.producer}
                </small>
              </div>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <label>Reason for Rejection *</label>
            <select 
              className="form-control mb-2"
              value={rejectionReasonSelect}
              onChange={(e) => setRejectionReasonSelect(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="incomplete-info">Incomplete Information</option>
              <option value="poor-quality">Poor Image Quality</option>
              <option value="inappropriate-content">Inappropriate Content</option>
              <option value="duplicate-product">Duplicate Product</option>
              <option value="pricing-issues">Pricing Issues</option>
              <option value="other">Other</option>
            </select>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Provide detailed reason for rejection..." 
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
          </div>
          
          <div className="form-check mb-3">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="allowResubmission"
              checked={allowResubmission}
              onChange={(e) => setAllowResubmission(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="allowResubmission">
              Allow producer to resubmit after corrections
            </label>
          </div>

          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            The producer will be notified of this rejection and the provided reason.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-admin btn-admin-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-admin btn-admin-danger" onClick={handleSubmit}>
            <i className="bi bi-x-circle me-1"></i>
            Reject Product
          </button>
        </div>
      </div>
    </div>
  )
}

export default RejectProductModal