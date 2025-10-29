import { useState } from 'react';
import PropTypes from 'prop-types';

export default function RestockProductModal({ show, onClose, onSave, product }) {
  const [restockData, setRestockData] = useState({
    quantity: '',
    reason: 'Regular Restock',
    notes: '',
    supplier: '',
    cost: '',
    harvestDate: '',
    expiryDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRestockData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (onSave && product) {
      const restockInfo = {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        addedQuantity: parseInt(restockData.quantity),
        newStock: parseInt(product.stock) + parseInt(restockData.quantity),
        ...restockData,
        restockDate: new Date().toISOString()
      };
      onSave(restockInfo);
    }
    
    // Reset form
    setRestockData({
      quantity: '',
      reason: 'Regular Restock',
      notes: '',
      supplier: '',
      cost: '',
      harvestDate: '',
      expiryDate: ''
    });
    
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-box-seam me-2"></i>
              Restock Product
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <form id="restockProductForm" onSubmit={handleSubmit}>
              {/* Product Information */}
              {product && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-title text-primary">{product.name}</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small className="text-muted">Current Stock:</small>
                        <p className="mb-0 fw-bold">{product.stock} units</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Product ID:</small>
                        <p className="mb-0 font-monospace">{product.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Restock Form */}
              <div className="mb-3">
                <label htmlFor="restockQuantity" className="form-label">
                  Quantity to Add <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="restockQuantity"
                  name="quantity"
                  value={restockData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
                {restockData.quantity && product && (
                  <div className="form-text">
                    New stock will be: {parseInt(product.stock || 0) + parseInt(restockData.quantity)} units
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="restockReason" className="form-label">
                  Reason for Restock
                </label>
                <select
                  className="form-select"
                  id="restockReason"
                  name="reason"
                  value={restockData.reason}
                  onChange={handleInputChange}
                >
                  <option value="Regular Restock">Regular Restock</option>
                  <option value="New Harvest">New Harvest</option>
                  <option value="Emergency Restock">Emergency Restock</option>
                  <option value="Seasonal Stock">Seasonal Stock</option>
                  <option value="Quality Replacement">Quality Replacement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="supplier" className="form-label">
                  Supplier (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="supplier"
                  name="supplier"
                  value={restockData.supplier}
                  onChange={handleInputChange}
                  placeholder="Supplier name or source"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="restockCost" className="form-label">
                  Total Cost (₱) - Optional
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="restockCost"
                  name="cost"
                  value={restockData.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Cost for this restock"
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="newHarvestDate" className="form-label">
                      Harvest Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="newHarvestDate"
                      name="harvestDate"
                      value={restockData.harvestDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="newExpiryDate" className="form-label">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="newExpiryDate"
                      name="expiryDate"
                      value={restockData.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="restockNotes" className="form-label">
                  Additional Notes
                </label>
                <textarea
                  className="form-control"
                  id="restockNotes"
                  name="notes"
                  rows="3"
                  value={restockData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information about this restock..."
                ></textarea>
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="restockProductForm"
              className="btn btn-success"
              disabled={!restockData.quantity}
            >
              <i className="bi bi-check-circle me-1"></i>
              Update Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

RestockProductModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  product: PropTypes.object,
};