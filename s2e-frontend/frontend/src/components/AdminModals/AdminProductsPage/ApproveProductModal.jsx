const ApproveProductModal = ({ show, onClose, onApprove, product }) => {
  const handleSubmit = () => {
    onApprove()
  }

  if (!show || !product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className="bi bi-check-circle text-success me-2"></i>
            Approve Product
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <div className="text-center mb-3">
            <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
          </div>
          <h6 className="text-center mb-3">Approve this product for listing?</h6>
          
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
          
          <div className="alert alert-success">
            <i className="bi bi-info-circle me-2"></i>
            This product will be immediately available for purchase once approved.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-admin btn-admin-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-admin btn-admin-success" onClick={handleSubmit}>
            <i className="bi bi-check-circle me-1"></i>
            Approve Product
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApproveProductModal