import PropTypes from 'prop-types'

export default function ClearCartModal({ show, onClose, onConfirm, itemCount }) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title text-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>Clear Basket
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
              <i className="bi bi-cart-x text-danger" style={{ fontSize: '4rem' }}></i>
            </div>
            <h6 className="mb-3">Clear all items from your basket?</h6>
            <div className="alert alert-warning" role="alert">
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <span>
                  You have <strong>{itemCount} item{itemCount !== 1 ? 's' : ''}</strong> in your basket
                </span>
              </div>
            </div>
            <p className="text-muted">
              This will remove all items from your basket. This action cannot be undone.
            </p>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-1"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={handleConfirm}
            >
              <i className="bi bi-trash me-1"></i>Clear Basket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ClearCartModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  itemCount: PropTypes.number.isRequired
}