import PropTypes from 'prop-types';

export default function ArchiveProductModal({ show, onClose, onConfirm, product }) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(product);
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-warning">
              <i className="bi bi-archive me-2"></i>
              Archive Product
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="text-center mb-4">
              <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '4rem' }}></i>
            </div>

            <div className="alert alert-warning">
              <h6 className="alert-heading">
                <i className="bi bi-info-circle me-2"></i>
                Archive Confirmation
              </h6>
              <p className="mb-0">
                You are about to archive this product. This action will:
              </p>
            </div>

            <ul className="list-unstyled ms-3">
              <li><i className="bi bi-check-circle text-success me-2"></i>Remove the product from active listings</li>
              <li><i className="bi bi-check-circle text-success me-2"></i>Prevent new orders for this product</li>
              <li><i className="bi bi-check-circle text-success me-2"></i>Keep the product data for future reference</li>
              <li><i className="bi bi-arrow-clockwise text-info me-2"></i>Allow you to reactivate it later if needed</li>
            </ul>

            {product && (
              <div className="card mt-3">
                <div className="card-body">
                  <h6 className="card-title">Product Details:</h6>
                  <div className="row g-2">
                    <div className="col-sm-6">
                      <strong>Name:</strong> {product.name}
                    </div>
                    <div className="col-sm-6">
                      <strong>Price:</strong> ₱{parseFloat(product.price || 0).toFixed(2)}
                    </div>
                    <div className="col-sm-6">
                      <strong>Stock:</strong> {product.stock} units
                    </div>
                    <div className="col-sm-6">
                      <strong>Status:</strong> 
                      <span className={`badge ms-1 ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {product.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3">
              <p className="text-muted mb-0">
                <strong>Note:</strong> You can reactivate this product anytime from the archived products section.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="bi bi-x-circle me-1"></i>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleConfirm}
            >
              <i className="bi bi-archive me-1"></i>
              Archive Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ArchiveProductModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  product: PropTypes.object,
};