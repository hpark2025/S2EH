import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export default function EditInventoryModal({ show, onClose, onSave, item }) {
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    reorderPoint: 0,
    unit: 'pcs',
    location: '',
    supplier: '',
    costPrice: 0,
    sellingPrice: 0,
    expiryDate: '',
    batchNumber: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (item) {
      setFormData({
        productName: item.productName || '',
        sku: item.sku || '',
        category: item.category || '',
        currentStock: item.currentStock || 0,
        minStockLevel: item.minStockLevel || 0,
        maxStockLevel: item.maxStockLevel || 0,
        reorderPoint: item.reorderPoint || 0,
        unit: item.unit || 'pcs',
        location: item.location || '',
        supplier: item.supplier || '',
        costPrice: item.costPrice || 0,
        sellingPrice: item.sellingPrice || 0,
        expiryDate: item.expiryDate || '',
        batchNumber: item.batchNumber || '',
        notes: item.notes || ''
      })
    }
  }, [item])

  if (!show) return null

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (formData.currentStock < 0) {
      newErrors.currentStock = 'Current stock cannot be negative'
    }

    if (formData.minStockLevel < 0) {
      newErrors.minStockLevel = 'Minimum stock level cannot be negative'
    }

    if (formData.maxStockLevel <= formData.minStockLevel) {
      newErrors.maxStockLevel = 'Maximum stock level must be greater than minimum'
    }

    if (formData.costPrice < 0) {
      newErrors.costPrice = 'Cost price cannot be negative'
    }

    if (formData.sellingPrice < 0) {
      newErrors.sellingPrice = 'Selling price cannot be negative'
    }

    if (formData.sellingPrice <= formData.costPrice) {
      newErrors.sellingPrice = 'Selling price should be greater than cost price'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const calculateMargin = () => {
    if (formData.costPrice > 0 && formData.sellingPrice > formData.costPrice) {
      return (((formData.sellingPrice - formData.costPrice) / formData.sellingPrice) * 100).toFixed(1)
    }
    return 0
  }

  const getStockStatus = () => {
    if (formData.currentStock === 0) return { status: 'Out of Stock', class: 'danger' }
    if (formData.currentStock <= formData.minStockLevel) return { status: 'Low Stock', class: 'warning' }
    if (formData.currentStock <= formData.reorderPoint) return { status: 'Reorder Soon', class: 'info' }
    return { status: 'In Stock', class: 'success' }
  }

  const stockStatus = getStockStatus()

  const categories = [
    'Fresh Produce',
    'Seafood',
    'Livestock & Poultry',
    'Rice & Grains',
    'Processed Foods',
    'Dairy Products',
    'Beverages'
  ]

  const units = [
    'pcs', 'kg', 'g', 'lbs', 'oz',
    'L', 'mL', 'gal', 'qt',
    'box', 'pack', 'bag', 'sack',
    'dozen', 'bundle', 'tray'
  ]

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil-square me-2"></i>
              {item ? 'Edit Inventory Item' : 'Add New Item'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              {item ? 'Update the inventory item details below.' : 'Fill in the details to add a new inventory item.'} All required fields are marked with an asterisk (*).
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="productName" className="form-label">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.productName ? 'is-invalid' : ''}`}
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                  />
                  {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="sku" className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-control"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Stock Keeping Unit"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="category" className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="unit" className="form-label">Unit</label>
                  <select
                    className="form-select"
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                  >
                    {units.map((unit, index) => (
                      <option key={index} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="currentStock" className="form-label">Current Stock</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className={`form-control ${errors.currentStock ? 'is-invalid' : ''}`}
                      id="currentStock"
                      name="currentStock"
                      value={formData.currentStock}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                    <span className="input-group-text">{formData.unit}</span>
                  </div>
                  {errors.currentStock && <div className="invalid-feedback">{errors.currentStock}</div>}
                  <div className="mt-1">
                    <span className={`badge bg-${stockStatus.class}`}>{stockStatus.status}</span>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="minStockLevel" className="form-label">Min Stock</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className={`form-control ${errors.minStockLevel ? 'is-invalid' : ''}`}
                      id="minStockLevel"
                      name="minStockLevel"
                      value={formData.minStockLevel}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                    <span className="input-group-text">{formData.unit}</span>
                  </div>
                  {errors.minStockLevel && <div className="invalid-feedback">{errors.minStockLevel}</div>}
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="maxStockLevel" className="form-label">Max Stock</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className={`form-control ${errors.maxStockLevel ? 'is-invalid' : ''}`}
                      id="maxStockLevel"
                      name="maxStockLevel"
                      value={formData.maxStockLevel}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                    <span className="input-group-text">{formData.unit}</span>
                  </div>
                  {errors.maxStockLevel && <div className="invalid-feedback">{errors.maxStockLevel}</div>}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="costPrice" className="form-label">Cost Price</label>
                  <div className="input-group">
                    <span className="input-group-text">₱</span>
                    <input
                      type="number"
                      className={`form-control ${errors.costPrice ? 'is-invalid' : ''}`}
                      id="costPrice"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.costPrice && <div className="invalid-feedback">{errors.costPrice}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="sellingPrice" className="form-label">Selling Price</label>
                  <div className="input-group">
                    <span className="input-group-text">₱</span>
                    <input
                      type="number"
                      className={`form-control ${errors.sellingPrice ? 'is-invalid' : ''}`}
                      id="sellingPrice"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.sellingPrice && <div className="invalid-feedback">{errors.sellingPrice}</div>}
                  {formData.costPrice > 0 && formData.sellingPrice > formData.costPrice && (
                    <small className="text-success">Profit Margin: {calculateMargin()}%</small>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="supplier" className="form-label">Supplier</label>
                  <input
                    type="text"
                    className="form-control"
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="Supplier name"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="location" className="form-label">Storage Location</label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Warehouse A, Shelf 1"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="batchNumber" className="form-label">Batch Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="batchNumber"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    placeholder="Batch/Lot number"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes about this item..."
                  maxLength={500}
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              <i className="bi bi-check-lg me-2"></i>
              {item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

EditInventoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.string,
    productName: PropTypes.string,
    sku: PropTypes.string,
    category: PropTypes.string,
    currentStock: PropTypes.number,
    minStockLevel: PropTypes.number,
    maxStockLevel: PropTypes.number,
    reorderPoint: PropTypes.number,
    unit: PropTypes.string,
    location: PropTypes.string,
    supplier: PropTypes.string,
    costPrice: PropTypes.number,
    sellingPrice: PropTypes.number,
    expiryDate: PropTypes.string,
    batchNumber: PropTypes.string,
    notes: PropTypes.string
  })
}