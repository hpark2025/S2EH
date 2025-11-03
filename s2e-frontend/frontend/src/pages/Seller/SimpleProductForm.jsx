import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';

export default function SimpleProductForm({ onProductCreated, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    inventory_quantity: '',
    status: 'draft',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, image: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for multipart/form-data (to support image upload)
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price || 0));
      formDataToSend.append('stock_quantity', parseInt(formData.inventory_quantity) || 0);
      formDataToSend.append('sku', `SKU-${Date.now()}`);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('unit', 'kg');
      
      // Add image if selected
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('📡 Creating product with FormData (including image)');
      
      const response = await sellerAPI.products.createProduct(formDataToSend);
      console.log('✅ Product created successfully:', response);
      
      toast.success('✅ Product created successfully!');
      onProductCreated && onProductCreated();
      onClose && onClose();
      
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to create product: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg" style={{ maxHeight: '90vh' }}>
        <div className="modal-content" style={{ maxHeight: '90vh' }}>
          <div className="modal-header">
            <h5 className="modal-title">Add New Product</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                onClose();
                setFormData({
                  title: '',
                  description: '',
                  price: '',
                  inventory_quantity: '',
                  status: 'draft',
                  image: null
                });
                setImagePreview(null);
              }}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    disabled={loading}
                    placeholder="e.g., Fresh Organic Tomatoes, Premium Rice"
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
                    placeholder="0.00"
                  />
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
                    placeholder="Available quantity"
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
                    <option value="">Select Status</option>
                    <option value="draft">Draft</option>
                    <option value="proposed">Proposed</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Product Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  <small className="text-muted">Upload a clear image of your product</small>
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
                    placeholder="Describe your product features, benefits, and specifications..."
                  ></textarea>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="col-12 mb-3">
                    <label className="form-label">Product Image Preview</label>
                    <div style={{ height: '300px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
                      <img 
                        src={imagePreview} 
                        alt="Product Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="col-12 mb-3 text-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Creating product...</span>
                    </div>
                    <small className="text-muted ms-2">Creating product...</small>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  setFormData({
                    title: '',
                    description: '',
                    price: '',
                    inventory_quantity: '',
                    status: 'draft',
                    image: null
                  });
                  setImagePreview(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
