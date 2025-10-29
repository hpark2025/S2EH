import PropTypes from 'prop-types';

export default function ViewProductModal({ show, onClose, product, onEdit }) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-eye me-2"></i>
              Product Details
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {product ? (
              <div className="row">
                {/* Product Image */}
                <div className="col-md-4">
                  <div className="product-image-container">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="img-fluid rounded shadow-sm"
                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center rounded" 
                           style={{ height: '300px' }}>
                        <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                      </div>
                    )}
                    {product.isOrganic && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-success">
                          <i className="bi bi-leaf me-1"></i>
                          Organic
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Information */}
                <div className="col-md-8">
                  <div className="row g-3">
                    <div className="col-12">
                      <h4 className="text-primary mb-2">{product.name}</h4>
                      <p className="text-muted mb-3">{product.description}</p>
                    </div>

                    <div className="col-md-6">
                      <div className="info-item">
                        <label className="fw-bold text-dark">Category:</label>
                        <p className="mb-2">{product.category}</p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-item">
                        <label className="fw-bold text-dark">Price:</label>
                        <p className="mb-2 text-success fw-bold">₱{parseFloat(product.price).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-item">
                        <label className="fw-bold text-dark">Stock:</label>
                        <p className="mb-2">
                          <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                            {product.stock} units
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="info-item">
                        <label className="fw-bold text-dark">Status:</label>
                        <p className="mb-2">
                          <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {product.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {product.specifications?.weight && (
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="fw-bold text-dark">Weight/Size:</label>
                          <p className="mb-2">{product.specifications.weight}</p>
                        </div>
                      </div>
                    )}

                    {product.specifications?.origin && (
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="fw-bold text-dark">Origin:</label>
                          <p className="mb-2">{product.specifications.origin}</p>
                        </div>
                      </div>
                    )}

                    {product.harvestDate && (
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="fw-bold text-dark">Harvest Date:</label>
                          <p className="mb-2">{new Date(product.harvestDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}

                    {product.expiryDate && (
                      <div className="col-md-6">
                        <div className="info-item">
                          <label className="fw-bold text-dark">Expiry Date:</label>
                          <p className="mb-2">{new Date(product.expiryDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <div className="info-item">
                        <label className="fw-bold text-dark">Product ID:</label>
                        <p className="mb-2 font-monospace">{product.id}</p>
                      </div>
                    </div>

                    {product.dateAdded && (
                      <div className="col-12">
                        <div className="info-item">
                          <label className="fw-bold text-dark">Date Added:</label>
                          <p className="mb-2">{new Date(product.dateAdded).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '3rem' }}></i>
                <p className="mt-2 text-muted">No product data available</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            {onEdit && product && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onEdit}
              >
                <i className="bi bi-pencil-square me-1"></i>
                Edit Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ViewProductModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  onEdit: PropTypes.func,
};