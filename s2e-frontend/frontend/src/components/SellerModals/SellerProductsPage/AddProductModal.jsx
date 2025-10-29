import { useState } from 'react';
import PropTypes from 'prop-types';

export default function AddProductModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    images: [],
    specifications: {
      weight: '',
      dimensions: '',
      origin: 'Sagnay, Camarines Sur'
    },
    isOrganic: false,
    harvestDate: '',
    expiryDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Handle image upload logic here
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>
              Add New Product
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <form id="addProductForm" onSubmit={handleSubmit}>
              <div className="row">
                {/* Basic Information */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="productName" className="form-label">
                      Product Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="productName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="productCategory" className="form-label">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="productCategory"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="handicrafts">Handicrafts</option>
                      <option value="food-processing">Food Processing</option>
                      <option value="textiles">Textiles</option>
                      <option value="fisheries">Fisheries</option>
                      <option value="tourism">Tourism</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="productPrice" className="form-label">
                      Price (₱) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="productPrice"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="productStock" className="form-label">
                      Stock Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="productStock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="productWeight" className="form-label">
                      Weight/Size
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="productWeight"
                      value={formData.specifications.weight}
                      onChange={(e) => handleSpecificationChange('weight', e.target.value)}
                      placeholder="e.g., 5kg, 1 dozen"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="harvestDate" className="form-label">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="harvestDate"
                      name="harvestDate"
                      value={formData.harvestDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="expiryDate" className="form-label">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isOrganic"
                        name="isOrganic"
                        checked={formData.isOrganic}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="isOrganic">
                        Organic Product
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="productDescription" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="productDescription"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="productImages" className="form-label">
                  Product Images
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="productImages"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                <div className="form-text">
                  Upload up to 5 images. First image will be the main product image.
                </div>
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
              form="addProductForm"
              className="btn btn-primary"
            >
              <i className="bi bi-check-circle me-1"></i>
              Add Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

AddProductModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};