import { useState, useEffect } from 'react'

const RestockProductModal = ({ show, onClose, onRestock, product }) => {
  const [restockAmount, setRestockAmount] = useState('')
  const [restockNotes, setRestockNotes] = useState('')

  useEffect(() => {
    if (!show) {
      setRestockAmount('')
      setRestockNotes('')
    }
  }, [show])

  const handleSubmit = () => {
    if (!restockAmount || parseInt(restockAmount) <= 0) {
      alert('Please enter a valid restock amount')
      return
    }

    const restockData = {
      amount: parseInt(restockAmount),
      notes: restockNotes,
      newTotal: product.stock + parseInt(restockAmount),
      restockedAt: new Date().toISOString(),
      restockedBy: 'admin' // This would be the current admin user
    }

    onRestock(product.id, restockData)
    onClose()
  }

  if (!show || !product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className="bi bi-box-seam text-primary me-2"></i>
            Restock Product
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
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
          
          <div className="row">
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Current Stock</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={product.stock}
                  readOnly
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label>Add Stock *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="1" 
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  placeholder="Enter amount to add"
                />
              </div>
            </div>
          </div>
          
          <div className="form-group mb-3">
            <label>New Total Stock</label>
            <input 
              type="number" 
              className="form-control" 
              value={product.stock + (parseInt(restockAmount) || 0)}
              readOnly
            />
          </div>
          
          <div className="form-group mb-3">
            <label>Restock Notes (optional)</label>
            <textarea 
              className="form-control" 
              rows="2" 
              placeholder="Add notes about this restock..."
              value={restockNotes}
              onChange={(e) => setRestockNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Stock levels will be updated immediately after confirmation.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-admin btn-admin-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-admin btn-admin-primary" onClick={handleSubmit}>
            <i className="bi bi-box-seam me-1"></i>
            Update Stock
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestockProductModal