import { useState, useEffect } from 'react'

const ArchiveProductModal = ({ show, onClose, onArchive, product }) => {
  const [archiveReason, setArchiveReason] = useState('')

  useEffect(() => {
    if (!show) {
      setArchiveReason('')
    }
  }, [show])

  const handleSubmit = () => {
    const archiveData = {
      reason: archiveReason,
      archivedAt: new Date().toISOString(),
      archivedBy: 'admin' // This would be the current admin user
    }

    onArchive(product.id, archiveData)
    onClose()
  }

  if (!show || !product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className="bi bi-archive text-warning me-2"></i>
            Archive Product
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <div className="text-center mb-3">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
          </div>
          <h6 className="text-center mb-3">Are you sure you want to archive this product?</h6>
          
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
          
          <div className="alert alert-warning">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              Archived products will be hidden from customers but can be restored later.
            </small>
          </div>
          
          <div className="form-group mb-3">
            <label>Reason for archiving (optional)</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Enter reason for archiving this product..."
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-admin btn-admin-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-admin btn-admin-warning" onClick={handleSubmit}>
            <i className="bi bi-archive me-1"></i>
            Archive Product
          </button>
        </div>
      </div>
    </div>
  )
}

export default ArchiveProductModal