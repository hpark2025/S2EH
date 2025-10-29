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
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Product</h5>
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
                  </select>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Product Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="img-thumbnail"
                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
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
