import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';

export default function SellerInventoryManagementPage() {
  const [products, setProducts] = useState([]);
  const [stockLocations, setStockLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryData, setInventoryData] = useState({
    product_id: '',
    location_id: '',
    stocked_quantity: 0,
    reserved_quantity: 0,
    available_quantity: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, locationsResponse] = await Promise.all([
        sellerAPI.products.getProducts(),
        sellerAPI.stockLocations.getStockLocations()
      ]);

      setProducts(productsResponse.products || []);
      setStockLocations(locationsResponse.stock_locations || []);
      
      // Load inventory data (this would be a custom endpoint)
      // For now, we'll create mock data
      setInventory([]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      // This would call your custom inventory update endpoint
      // await sellerAPI.inventory.updateInventory(inventoryData);
      
      toast.success('Inventory updated successfully!');
      setShowInventoryModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to update inventory:', error);
      toast.error('Failed to update inventory');
    }
  };

  const openInventoryModal = (product, location) => {
    setSelectedProduct(product);
    setSelectedLocation(location);
    setInventoryData({
      product_id: product.id,
      location_id: location.id,
      stocked_quantity: 0,
      reserved_quantity: 0,
      available_quantity: 0
    });
    setShowInventoryModal(true);
  };

  const getInventoryForProduct = (productId) => {
    return inventory.filter(inv => inv.product_id === productId);
  };

  const getTotalStock = (productId) => {
    return getInventoryForProduct(productId).reduce((total, inv) => total + inv.stocked_quantity, 0);
  };

  const getTotalAvailable = (productId) => {
    return getInventoryForProduct(productId).reduce((total, inv) => total + inv.available_quantity, 0);
  };

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
    <div className="seller-inventory-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Inventory Management</h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={loadData}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <a href="/seller/stock-locations" className="btn btn-primary">
            <i className="bi bi-geo-alt"></i> Manage Locations
          </a>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-box display-6"></i>
              <h4 className="mt-2">{products.length}</h4>
              <small>Total Products</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="bi bi-geo-alt display-6"></i>
              <h4 className="mt-2">{stockLocations.length}</h4>
              <small>Stock Locations</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-check-circle display-6"></i>
              <h4 className="mt-2">{inventory.length}</h4>
              <small>Inventory Records</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="bi bi-exclamation-triangle display-6"></i>
              <h4 className="mt-2">
                {products.filter(p => getTotalStock(p.id) < 10).length}
              </h4>
              <small>Low Stock Items</small>
            </div>
          </div>
        </div>
      </div>

      {/* Products and Inventory Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Product Inventory Overview</h5>
        </div>
        <div className="card-body">
          {products.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam display-1 text-muted"></i>
              <h4 className="mt-3">No products found</h4>
              <p className="text-muted">Create products first to manage inventory</p>
              <a href="/seller/products" className="btn btn-primary">
                Go to Products
              </a>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Total Stock</th>
                    <th>Available</th>
                    <th>Locations</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const totalStock = getTotalStock(product.id);
                    const totalAvailable = getTotalAvailable(product.id);
                    const productInventory = getInventoryForProduct(product.id);
                    
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.title}
                                className="rounded me-3"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="bg-light rounded me-3 d-flex align-items-center justify-content-center"
                                   style={{ width: '50px', height: '50px' }}>
                                <i className="bi bi-image text-muted"></i>
                              </div>
                            )}
                            <div>
                              <h6 className="mb-0">{product.title}</h6>
                              <small className="text-muted">SKU: {product.handle || 'N/A'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${totalStock > 0 ? 'bg-success' : 'bg-danger'}`}>
                            {totalStock}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${totalAvailable > 0 ? 'bg-info' : 'bg-secondary'}`}>
                            {totalAvailable}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {productInventory.map((inv) => {
                              const location = stockLocations.find(l => l.id === inv.location_id);
                              return (
                                <span key={inv.id} className="badge bg-light text-dark">
                                  {location?.name || 'Unknown'}
                                </span>
                              );
                            })}
                            {productInventory.length === 0 && (
                              <span className="text-muted">No locations</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            totalStock === 0 ? 'bg-danger' :
                            totalStock < 10 ? 'bg-warning' : 'bg-success'
                          }`}>
                            {totalStock === 0 ? 'Out of Stock' :
                             totalStock < 10 ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                if (stockLocations.length === 0) {
                                  toast.error('Please create stock locations first');
                                  return;
                                }
                                openInventoryModal(product, stockLocations[0]);
                              }}
                              title="Manage Inventory"
                            >
                              <i className="bi bi-boxes"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => {
                                // Show detailed inventory for this product
                                console.log('Show inventory details for:', product.id);
                              }}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </div>
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

      {/* Inventory Management Modal */}
      {showInventoryModal && selectedProduct && selectedLocation && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Manage Inventory - {selectedProduct.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowInventoryModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateInventory}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedProduct.title}
                        disabled
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock Location</label>
                      <select
                        className="form-select"
                        value={inventoryData.location_id}
                        onChange={(e) => setInventoryData({
                          ...inventoryData,
                          location_id: e.target.value
                        })}
                      >
                        {stockLocations.map(location => (
                          <option key={location.id} value={location.id}>
                            {location.name} - {location.address?.city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Stocked Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={inventoryData.stocked_quantity}
                        onChange={(e) => setInventoryData({
                          ...inventoryData,
                          stocked_quantity: parseInt(e.target.value) || 0
                        })}
                        min="0"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Reserved Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={inventoryData.reserved_quantity}
                        onChange={(e) => setInventoryData({
                          ...inventoryData,
                          reserved_quantity: parseInt(e.target.value) || 0
                        })}
                        min="0"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Available Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={inventoryData.available_quantity}
                        onChange={(e) => setInventoryData({
                          ...inventoryData,
                          available_quantity: parseInt(e.target.value) || 0
                        })}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Note:</strong> Available quantity should be less than or equal to stocked quantity minus reserved quantity.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowInventoryModal(false)}
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

