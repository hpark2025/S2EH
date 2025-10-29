import PropTypes from 'prop-types'

export default function RemoveFromCartModal({ show, onClose, onConfirm, item }) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  if (!show || !item) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title text-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>Remove Item
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body text-center">
            <div className="mb-4">
              <i className="bi bi-cart-x text-warning" style={{ fontSize: '4rem' }}></i>
            </div>
            <h6 className="mb-3">Remove this item from your basket?</h6>
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="rounded me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                  <div className="text-start">
                    <h6 className="mb-1">{item.name}</h6>
                    <p className="text-muted mb-1 small">By: {item.seller}</p>
                    <div className="d-flex align-items-center">
                      <span className="text-muted small me-2">Qty: {item.quantity}</span>
                      <span className="fw-bold">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-muted mt-3">This item will be removed from your basket.</p>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-1"></i>Keep Item
            </button>
            <button 
              type="button" 
              className="btn btn-warning" 
              onClick={handleConfirm}
            >
              <i className="bi bi-trash me-1"></i>Remove Item
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

RemoveFromCartModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  item: PropTypes.object
}