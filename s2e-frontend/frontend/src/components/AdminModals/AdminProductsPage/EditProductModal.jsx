import { useState, useEffect } from 'react'

const EditProductModal = ({ show, onClose, onEdit, product }) => {
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [producer, setProducer] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('')

  useEffect(() => {
    if (product) {
      setProductName(product.name || '')
      setCategory(product.category?.toLowerCase().replace(' ', '-') || '')
      setProducer(product.producer || '')
      setPrice(product.price?.toString() || '')
      setDescription(product.description || '')
      setStock(product.stock?.toString() || '')
    }
  }, [product])

  useEffect(() => {
    if (!show) {
      setProductName('')
      setCategory('')
      setProducer('')
      setPrice('')
      setDescription('')
      setStock('')
    }
  }, [show])

  const handleSubmit = () => {
    if (!productName || !category || !producer || !price) {
      alert('Please fill in all required fields')
      return
    }

    if (parseFloat(price) <= 0) {
      alert('Price must be greater than 0')
      return
    }

    if (parseInt(stock) < 0) {
      alert('Stock cannot be negative')
      return
    }

    const editData = {
      name: productName,
      category: category,
      producer: producer,
      price: parseFloat(price),
      description: description,
      stock: parseInt(stock) || 0,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin' // This would be the current admin user
    }

    onEdit(product.id, editData)
    onClose()
  }

  if (!show || !product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className="bi bi-pencil text-primary me-2"></i>
            Edit Product - {product.name}
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <form>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    className="form-control" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="handicrafts">Handicrafts</option>
                    <option value="food-products">Food Products</option>
                    <option value="textiles">Textiles</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div className="form-group">
                  <label>Producer *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    required
                    readOnly
                  />
                </div>
              </div>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <div className="form-group">
                  <label>Price (PHP) *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0" 
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Product Description</label>
              <textarea 
                className="form-control" 
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description..."
              ></textarea>
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input 
                type="number" 
                className="form-control" 
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
              />
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn-admin btn-admin-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-admin btn-admin-primary" onClick={handleSubmit}>
            <i className="bi bi-check-circle me-1"></i>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditProductModal