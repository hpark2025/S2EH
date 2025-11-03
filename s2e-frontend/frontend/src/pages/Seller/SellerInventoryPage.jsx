import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';
import SimpleProductForm from './SimpleProductForm';

export default function SellerInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updateData, setUpdateData] = useState({
    inventory_quantity: '',
    status: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading inventory products...');
      const response = await sellerAPI.products.getProducts();
      console.log('🔍 Inventory products response:', response);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      // Map inventory_quantity to stock_quantity for backend
      const updatePayload = {
        stock_quantity: parseInt(updateData.inventory_quantity, 10),
        status: updateData.status
      };
      
      await sellerAPI.products.updateProduct(selectedProduct.id, updatePayload);
      toast.success('Inventory updated successfully!');
      setShowUpdateModal(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Failed to update inventory:', error);
      toast.error(error.response?.data?.message || 'Failed to update inventory');
    }
  };

  const openUpdateModal = (product) => {
    setSelectedProduct(product);
    setUpdateData({
      inventory_quantity: product.stock_quantity || 0,
      status: product.status || 'draft'
    });
    setShowUpdateModal(true);
  };

  // Helper function to get inventory quantity from products table
  const getInventoryQuantity = (product) => {
    // Use stock_quantity directly from products table
    return product.stock_quantity || 0;
  };

  // Helper function to get product price from products table
  const getProductPrice = (product) => {
    // Use price directly from products table (already in PHP/PHP format, not cents)
    return parseFloat(product.price) || 0;
  };

  // Helper function to get SKU from products table
  const getProductSKU = (product) => {
    // Use sku directly from products table
    return product.sku || 'N/A';
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: 'out', class: 'bg-danger', text: 'Out of Stock' };
    if (quantity < 10) return { status: 'low', class: 'bg-warning', text: 'Low Stock' };
    if (quantity < 50) return { status: 'medium', class: 'bg-info', text: 'Medium Stock' };
    return { status: 'good', class: 'bg-success', text: 'In Stock' };
  };

  const filteredProducts = products.filter(product => {
    const inventoryQuantity = getInventoryQuantity(product);
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'low' && inventoryQuantity < 10) ||
      (filterStatus === 'out' && inventoryQuantity === 0) ||
      (filterStatus === 'good' && inventoryQuantity >= 10);
    return matchesSearch && matchesStatus;
  });

  const getInventoryStats = () => {
    const totalProducts = products.length;
    const outOfStock = products.filter(p => getInventoryQuantity(p) === 0).length;
    const lowStock = products.filter(p => {
      const quantity = getInventoryQuantity(p);
      return quantity > 0 && quantity < 10;
    }).length;
    const totalValue = products.reduce((total, product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = product.stock_quantity || 0;
      return total + (price * quantity);
    }, 0);

    return { totalProducts, outOfStock, lowStock, totalValue };
  };

  const stats = getInventoryStats();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-inventory-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Inventory Management</h2>
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={loadProducts}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-circle"></i> Add Product
          </button>
        </div>
      </div>


      {/* Inventory Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-box display-6"></i>
              <h4 className="mt-2">{stats.totalProducts}</h4>
              <small>Total Products</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <i className="bi bi-exclamation-triangle display-6"></i>
              <h4 className="mt-2">{stats.outOfStock}</h4>
              <small>Out of Stock</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-exclamation-circle display-6"></i>
              <h4 className="mt-2">{stats.lowStock}</h4>
              <small>Low Stock</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₱</span>
              <h4 className="mt-2">
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP'
                }).format(stats.totalValue)}
              </h4>
              <small>Total Value</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Stock Levels</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
            <option value="good">Good Stock</option>
          </select>
        </div>
        <div className="col-md-3">
          <div className="text-end">
            <span className="badge bg-info">
              {filteredProducts.length} products
            </span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam display-1 text-muted"></i>
              <h4 className="mt-3">No products found</h4>
              <p className="text-muted">Start by adding your first product</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Current Stock</th>
                    <th>Stock Status</th>
                    <th>Unit Price</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const inventoryQuantity = getInventoryQuantity(product);
                    const productPrice = getProductPrice(product);
                    const productSKU = getProductSKU(product);
                    const stockInfo = getStockStatus(inventoryQuantity);
                    const totalValue = productPrice * inventoryQuantity;
                    
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {(() => {
                            // Get image from thumbnail or first image
                            let productImage = product.thumbnail;
                            if (!productImage && product.images && product.images.length > 0) {
                              // Handle both array of strings and array of objects
                              const firstImage = product.images[0];
                              productImage = typeof firstImage === 'string' ? firstImage : firstImage.url || firstImage;
                            }
                            const imageUrl = productImage 
                              ? (productImage.startsWith('http') 
                                  ? productImage 
                                  : `http://localhost:8080/S2EH/s2e-backend${productImage}`)
                              : null;
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.title}
                                className="rounded me-3"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="bg-light rounded me-3 d-flex align-items-center justify-content-center"
                                   style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-image text-muted"></i>
                              </div>
                            );
                          })()}
                            <div>
                              <h6 className="mb-0">{product.title}</h6>
                              <small className="text-muted">
                                {product.description?.substring(0, 50)}...
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code>{productSKU}</code>
                        </td>
                        <td>
                          <span className="fw-bold">{inventoryQuantity}</span>
                        </td>
                        <td>
                          <span className={`badge ${stockInfo.class}`}>
                            {stockInfo.text}
                          </span>
                        </td>
                        <td>
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP'
                          }).format(productPrice)}
                        </td>
                        <td>
                          <strong>
                            {new Intl.NumberFormat('en-PH', {
                              style: 'currency',
                              currency: 'PHP'
                            }).format(totalValue)}
                          </strong>
                        </td>
                        <td>
                          <span style={{ color: '#28a745', fontWeight: '600', textTransform: 'capitalize' }}>
                            {product.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openUpdateModal(product)}
                            title="Update Inventory"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update Inventory Modal */}
      {showUpdateModal && selectedProduct && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Inventory - {selectedProduct.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUpdateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateInventory}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock Quantity *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={updateData.inventory_quantity}
                        onChange={(e) => setUpdateData({...updateData, inventory_quantity: e.target.value})}
                        required
                        min="0"
                      />
                      <small className="text-muted">Current: {selectedProduct.stock_quantity || 0}</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Status</label>
                      <select
                        className="form-select"
                        value={updateData.status}
                        onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                      >
                        <option value="draft">Draft</option>
                        <option value="proposed">Proposed</option>
                        <option value="published">Published</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Current Value:</strong> {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP'
                    }).format((parseFloat(selectedProduct.price) || 0) * (selectedProduct.stock_quantity || 0))}
                    <br />
                    <strong>New Value:</strong> {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP'
                    }).format((parseFloat(selectedProduct.price) || 0) * parseFloat(updateData.inventory_quantity || 0))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUpdateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Inventory
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <SimpleProductForm
          onProductCreated={loadProducts}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}