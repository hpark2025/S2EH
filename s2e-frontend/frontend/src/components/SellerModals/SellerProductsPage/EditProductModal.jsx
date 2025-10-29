import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function EditProductModal({ show, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    id: '',
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

  // Helper function to get inventory quantity from Medusa product structure
  const getInventoryQuantity = (product) => {
    console.log('🔍 EditModal - Getting inventory quantity for product:', product.title);
    console.log('🔍 EditModal - Product first_variant:', product.first_variant);
    console.log('🔍 EditModal - Product total_inventory:', product.total_inventory);
    
    // Check if we have first_variant (custom backend structure)
    if (product.first_variant && product.first_variant.inventory_quantity !== undefined) {
      console.log('🔍 EditModal - Using first_variant inventory_quantity:', product.first_variant.inventory_quantity);
      return product.first_variant.inventory_quantity;
    }
    
    // Fallback to total_inventory
    if (product.total_inventory !== undefined) {
      console.log('🔍 EditModal - Using total_inventory:', product.total_inventory);
      return product.total_inventory;
    }
    
    // Fallback to standard variants array
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      console.log('🔍 EditModal - Using standard variant inventory_quantity:', variant.inventory_quantity);
      return variant.inventory_quantity || 0;
    }
    
    // Final fallback
    console.log('🔍 EditModal - Using direct inventory_quantity:', product.inventory_quantity);
    return product.inventory_quantity || 0;
  };

  // Helper function to get product price from variants
  const getProductPrice = (product) => {
    console.log('🔍 EditModal - Getting price for product:', product.title);
    
    // Check if we have first_variant with new pricing structure
    if (product.first_variant && product.first_variant.pricing) {
      console.log('🔍 EditModal - Using first_variant pricing:', product.first_variant.pricing);
      return product.first_variant.pricing.amount;
    }
    
    // Fallback to first_variant calculated_price (old structure)
    if (product.first_variant && product.first_variant.calculated_price) {
      console.log('🔍 EditModal - Using first_variant calculated_price (old):', product.first_variant.calculated_price);
      return product.first_variant.calculated_price.calculated_amount;
    }
    
    // Fallback to standard variants array
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      console.log('🔍 EditModal - Using standard variant pricing:', variant.pricing);
      if (variant.pricing) {
        return variant.pricing.amount;
      }
      if (variant.calculated_price) {
        return variant.calculated_price.calculated_amount;
      }
    }
    
    console.log('🔍 EditModal - Using fallback price:', product.price);
    return product.price || 0;
  };

  useEffect(() => {
    if (product && show) {
      console.log('🔍 EditModal - Populating form with product:', product);
      
      // Extract data using helper functions
      const productPrice = getProductPrice(product);
      const inventoryQuantity = getInventoryQuantity(product);
      
      console.log('🔍 EditModal - Extracted data:', {
        price: productPrice,
        inventoryQuantity
      });
      
      setFormData({
        id: product.id || '',
        name: product.title || product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: productPrice ? (productPrice / 100).toString() : '', // Convert from cents
        stock: inventoryQuantity.toString(),
        images: product.images || [],
        specifications: {
          weight: product.specifications?.weight || '',
          dimensions: product.specifications?.dimensions || '',
          origin: product.specifications?.origin || 'Sagnay, Camarines Sur'
        },
        isOrganic: product.isOrganic || false,
        harvestDate: product.harvestDate || '',
        expiryDate: product.expiryDate || ''
      });
    }
  }, [product, show]);

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
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      // Format data for Medusa backend with the new JSON structure
      const productData = {
        title: formData.name,
        description: formData.description,
        default_price: Math.round(parseFloat(formData.price || 0) * 100), // Convert to cents
        default_currency: "usd",
        default_sku: product.first_variant?.sku || product.variants?.[0]?.sku || `SKU-${Date.now()}`, // Use existing SKU
        default_stock_quantity: parseInt(formData.stock) || 0
      };

      console.log('🔍 EditModal - Submitting product data:', productData);
      onSave(productData);
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
              <i className="bi bi-pencil-square me-2"></i>
              Edit Product
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <form id="editProductForm" onSubmit={handleSubmit}>
              <div className="row">
                {/* Basic Information */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editProductName" className="form-label">
                      Product Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editProductName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="editProductCategory" className="form-label">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="editProductCategory"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="rice-grains">Rice & Grains</option>
                      <option value="vegetables">Fresh Vegetables</option>
                      <option value="fruits">Fresh Fruits</option>
                      <option value="seafood">Seafood</option>
                      <option value="poultry">Poultry</option>
                      <option value="livestock">Livestock</option>
                      <option value="processed">Processed Foods</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="editProductPrice" className="form-label">
                      Price (₱) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="editProductPrice"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="editProductStock" className="form-label">
                      Stock Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="editProductStock"
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
                    <label htmlFor="editProductWeight" className="form-label">
                      Weight/Size
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="editProductWeight"
                      value={formData.specifications.weight}
                      onChange={(e) => handleSpecificationChange('weight', e.target.value)}
                      placeholder="e.g., 5kg, 1 dozen"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="editHarvestDate" className="form-label">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="editHarvestDate"
                      name="harvestDate"
                      value={formData.harvestDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="editExpiryDate" className="form-label">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="editExpiryDate"
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
                        id="editIsOrganic"
                        name="isOrganic"
                        checked={formData.isOrganic}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="editIsOrganic">
                        Organic Product
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="editProductDescription" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="editProductDescription"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="editProductImages" className="form-label">
                  Update Product Images
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="editProductImages"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                <div className="form-text">
                  Upload new images or keep existing ones. First image will be the main product image.
                </div>
              </div>

              {product && (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Product ID:</strong> {product.id}
                </div>
              )}
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
              form="editProductForm"
              className="btn btn-primary"
            >
              <i className="bi bi-check-circle me-1"></i>
              Update Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

EditProductModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  product: PropTypes.object,
};