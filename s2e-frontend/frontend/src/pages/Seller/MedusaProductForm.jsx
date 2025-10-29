import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';

export default function MedusaProductForm({ onProductCreated, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    inventory_quantity: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create product data in the format expected by Medusa backend
      const productData = {
        title: formData.title,
        description: formData.description,
        default_price: Math.round(parseFloat(formData.price || 0) * 100), // Convert to cents
        default_currency: "usd",
        default_sku: `SKU-${Date.now()}`, // Generate unique SKU
        default_stock_quantity: parseInt(formData.inventory_quantity) || 0
      };

      console.log('Creating product with data:', productData);
      
      const response = await sellerAPI.products.createProduct(productData);
      console.log('Product created successfully:', response);
      
      toast.success('Product created successfully!');
      onProductCreated && onProductCreated();
      onClose && onClose();
      
    } catch (error) {
      console.error('Failed to create product:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to create product: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Product (Simple)</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Product Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Price (PHP) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    disabled={loading}
                  ></textarea>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.inventory_quantity}
                    onChange={(e) => setFormData({...formData, inventory_quantity: e.target.value})}
                    required
                    min="0"
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    disabled={loading}
                  >
                    <option value="draft">Draft</option>
                    <option value="proposed">Proposed</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Note:</strong> This creates a basic product without variants. You may need to add variants and pricing separately in MedusaJS admin.
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

