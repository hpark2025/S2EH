import { useState, useEffect } from 'react'

const DeleteProductModal = ({ show, onClose, onDelete, product }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    if (!show) {
      setDeleteConfirmation('')
    }
  }, [show])

  const handleSubmit = () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm deletion')
      return
    }

    const deleteData = {
      deletedAt: new Date().toISOString(),
      deletedBy: 'admin' // This would be the current admin user
    }

    onDelete(product.id, deleteData)
    onClose()
  }

  if (!show || !product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className="bi bi-trash text-danger me-2"></i>
            Delete Product
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <div className="text-center mb-3">
            <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
          </div>
          <h6 className="text-center mb-3">Are you sure you want to permanently delete this product?</h6>
          
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
          
          <div className="alert alert-danger">
            <small>
              <i className="bi bi-exclamation-triangle me-1"></i>
              <strong>Warning:</strong> This action cannot be undone. The product will be permanently removed from the system.
            </small>
          </div>
          
          <div className="form-group mb-3">
            <label>Type "DELETE" to confirm</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Type DELETE to confirm"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-admin btn-admin-outline" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-admin btn-admin-danger" 
            disabled={deleteConfirmation !== 'DELETE'}
            onClick={handleSubmit}
          >
            <i className="bi bi-trash me-1"></i>
            Delete Product
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteProductModal