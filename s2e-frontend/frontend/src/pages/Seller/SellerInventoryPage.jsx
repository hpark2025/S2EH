import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';

export default function SellerInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
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
      await sellerAPI.inventory.updateInventory(selectedProduct.id, updateData);
      toast.success('Inventory updated successfully!');
      setShowUpdateModal(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Failed to update inventory:', error);
      toast.error('Failed to update inventory');
    }
  };

  const openUpdateModal = (product) => {
    setSelectedProduct(product);
    setUpdateData({
      inventory_quantity: getInventoryQuantity(product),
      status: product.status || 'draft'
    });
    setShowUpdateModal(true);
  };

  // Helper function to get inventory quantity from Medusa product structure
  const getInventoryQuantity = (product) => {
    console.log('🔍 Getting inventory quantity for product:', product.title);
    console.log('🔍 Product first_variant:', product.first_variant);
    console.log('🔍 Product total_inventory:', product.total_inventory);
    
    // Check if we have first_variant (custom backend structure)
    if (product.first_variant && product.first_variant.inventory_quantity !== undefined) {
      console.log('🔍 Using first_variant inventory_quantity:', product.first_variant.inventory_quantity);
      return product.first_variant.inventory_quantity;
    }
    
    // Fallback to total_inventory
    if (product.total_inventory !== undefined) {
      console.log('🔍 Using total_inventory:', product.total_inventory);
      return product.total_inventory;
    }
    
    // Fallback to standard variants array
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      console.log('🔍 Using standard variant inventory_quantity:', variant.inventory_quantity);
      return variant.inventory_quantity || 0;
    }
    
    // Final fallback
    console.log('🔍 Using direct inventory_quantity:', product.inventory_quantity);
    return product.inventory_quantity || 0;
  };

  // Helper function to get product price from variants
  const getProductPrice = (product) => {
    console.log('🔍 Getting price for product:', product.title);
    
    // Check if we have first_variant with new pricing structure
    if (product.first_variant && product.first_variant.pricing) {
      console.log('🔍 Using first_variant pricing:', product.first_variant.pricing);
      return product.first_variant.pricing.amount;
    }
    
    // Fallback to first_variant calculated_price (old structure)
    if (product.first_variant && product.first_variant.calculated_price) {
      console.log('🔍 Using first_variant calculated_price (old):', product.first_variant.calculated_price);
      return product.first_variant.calculated_price.calculated_amount;
    }
    
    // Fallback to standard variants array
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      console.log('🔍 Using standard variant pricing:', variant.pricing);
      if (variant.pricing) {
        return variant.pricing.amount;
      }
      if (variant.calculated_price) {
        return variant.calculated_price.calculated_amount;
      }
    }
    
    console.log('🔍 Using fallback price:', product.price);
    return product.price || 0;
  };

  // Helper function to get SKU from variants
  const getProductSKU = (product) => {
    // Check if we have first_variant (custom backend structure)
    if (product.first_variant && product.first_variant.sku) {
      return product.first_variant.sku;
    }
    
    // Fallback to standard variants array
    if (product.variants && product.variants.length > 0) {
      return product.variants[0].sku || 'N/A';
    }
    
    return product.handle || 'N/A';
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
      const price = getProductPrice(product);
      const quantity = getInventoryQuantity(product);
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
          <a href="/seller/products" className="btn btn-primary btn-sm">
            <i className="bi bi-plus-circle"></i> Add Product
          </a>
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
              <i className="bi bi-currency-dollar display-6"></i>
              <h4 className="mt-2">
                {new Intl.NumberFormat('en-PH', {
                  style: 'currency',
                  currency: 'PHP'
                }).format(stats.totalValue / 100)}
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
              <a href="/seller/products" className="btn btn-primary">
                Add Your First Product
              </a>
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
                            const productImage = product.thumbnail || 
                                               (product.images && product.images.length > 0 ? product.images[0].url : null);
                            return productImage ? (
                              <img
                                src={productImage}
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
                          }).format(productPrice / 100)}
                        </td>
                        <td>
                          <strong>
                            {new Intl.NumberFormat('en-PH', {
                              style: 'currency',
                              currency: 'PHP'
                            }).format(totalValue / 100)}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge ${
                            product.status === 'published' ? 'bg-success' :
                            product.status === 'draft' ? 'bg-secondary' :
                            product.status === 'proposed' ? 'bg-warning' : 'bg-danger'
                          }`}>
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
                      <small className="text-muted">Current: {selectedProduct.inventory_quantity || 0}</small>
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
                    }).format(((selectedProduct.price || 0) * (selectedProduct.inventory_quantity || 0)) / 100)}
                    <br />
                    <strong>New Value:</strong> {new Intl.NumberFormat('en-PH', {
                      style: 'currency',
                      currency: 'PHP'
                    }).format(((selectedProduct.price || 0) * updateData.inventory_quantity) / 100)}
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
    </div>
  );
}