import PropTypes from 'prop-types'

export default function DeleteAddressModal({ show, onClose, onConfirm, address }) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  if (!show || !address) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title text-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>Delete Address
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
              <i className="bi bi-geo-alt-fill text-danger" style={{ fontSize: '4rem' }}></i>
            </div>
            <h6 className="mb-3">Are you sure you want to delete this address?</h6>
            <div className="alert alert-light border" role="alert">
              <div className="d-flex align-items-start">
                <i className="bi bi-geo-alt text-primary me-2 mt-1"></i>
                <div className="text-start">
                  <strong>{address.label}</strong><br />
                  <small className="text-muted">
                    {address.name}<br />
                    {address.street}<br />
                    {address.city}, {address.province} {address.postalCode}
                  </small>
                </div>
              </div>
            </div>
            <p className="text-muted">This action cannot be undone.</p>
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
              <i className="bi bi-trash me-1"></i>Delete Address
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

DeleteAddressModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  address: PropTypes.object
}