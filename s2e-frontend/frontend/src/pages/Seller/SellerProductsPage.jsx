import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';
import SimpleProductForm from './SimpleProductForm';
import MedusaProductForm from './MedusaProductForm';
import { productsAPI } from '../../services/authAPI';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [useSimpleForm, setUseSimpleForm] = useState(true); // Use SimpleProductForm by default for the new workflow

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    inventory_quantity: '',
    status: 'draft',
    category_id: '',
    images: [],
    // Add required product options
    options: [
      {
        title: 'Size',
        values: ['Small', 'Medium', 'Large']
      }
    ],
    variants: [
      {
        title: 'Default',
        prices: [
          {
            amount: '',
            currency_code: 'php'
          }
        ],
        options: [
          {
            option_id: '',
            value: 'Default'
          }
        ]
      }
    ]
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading seller products...');
      const response = await sellerAPI.products.getProducts();
      console.log('🔍 Seller products response:', response);
      
      // PHP backend returns: { products, pagination, stats }
      const productsData = response.products || [];
      console.log('🔍 Products array:', productsData);
      console.log('🔍 Total products:', productsData.length);
      
      if (productsData.length > 0) {
        console.log('🔍 First product:', productsData[0]);
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error('🔍 Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Format data for Medusa backend with the new JSON structure
      const productData = {
        title: formData.title,
        description: formData.description,
        default_price: Math.round(parseFloat(formData.price || 0) * 100), // Convert to cents
        default_currency: "usd",
        default_sku: `SKU-${Date.now()}`, // Generate unique SKU
        default_stock_quantity: parseInt(formData.inventory_quantity) || 0
      };

      await sellerAPI.products.createProduct(productData);
      toast.success('Product created successfully!');
      setShowAddModal(false);
      resetFormData();
      loadProducts();
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error('Failed to create product');
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      inventory_quantity: '',
      status: 'draft',
      category_id: '',
      images: [],
      options: [
        {
          title: 'Size',
          values: ['Small', 'Medium', 'Large']
        }
      ],
      variants: [
        {
          title: 'Default',
          prices: [
            {
              amount: '',
              currency_code: 'php'
            }
          ],
          options: [
            {
              option_id: '',
              value: 'Default'
            }
          ]
        }
      ]
    });
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      console.log('📡 Editing product with PHP backend:', editingProduct.title);
      console.log('📡 Form data:', formData);
      
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Format data for PHP backend (simple structure)
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price || 0), // PHP backend: decimal price
        stock_quantity: parseInt(formData.inventory_quantity) || 0, // PHP backend: stock_quantity
        status: formData.status,
        category_id: formData.category_id || null,
        sku: editingProduct.sku || `SKU-${Date.now()}`,
        unit: 'kg'
      };
      
      console.log('📡 Product update data:', productData);
      console.log('📡 Product ID:', editingProduct.id);
      
      await sellerAPI.products.updateProduct(editingProduct.id, productData);
      
      toast.success('✅ Product updated successfully!');
      setShowEditModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      toast.error(`Failed to update product: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await sellerAPI.products.deleteProduct(productId);
        toast.success('Product deleted successfully!');
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const openEditModal = (product) => {
    console.log('🔍 Opening edit modal for product:', product.title);
    console.log('🔍 Product ID:', product.id);
    console.log('🔍 Full product object:', product);
    console.log('🔍 Product first_variant:', product.first_variant);
    
    // Validate product ID
    if (!product.id) {
      console.error('❌ Product ID is missing!', product);
      toast.error('Product ID not found. Cannot edit this product.');
      return;
    }
    
    // Extract data - PHP backend uses direct columns
    const productPrice = product.price || 0; // PHP backend: direct decimal price
    const inventoryQuantity = product.stock_quantity || 0; // PHP backend: direct stock
    const productSKU = product.sku || product.first_variant?.sku || product.variants?.[0]?.sku || '';
    
    console.log('🔍 Extracted data for edit:', {
      price: productPrice,
      inventoryQuantity,
      sku: productSKU
    });
    
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: productPrice.toString(), // PHP backend: already in decimal
      inventory_quantity: inventoryQuantity.toString(),
      status: product.status || 'draft',
      category_id: product.category_id || '',
      images: product.images || [],
      options: product.options || [
        {
          title: 'Size',
          values: ['Small', 'Medium', 'Large']
        }
      ],
      variants: product.variants || [
        {
          title: 'Default',
          prices: [
            {
              amount: productPrice || '',
              currency_code: 'php'
            }
          ],
          options: [
            {
              option_id: '',
              value: 'Default'
            }
          ]
        }
      ]
    });
    setShowEditModal(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      'draft': 'bg-secondary',
      'proposed': 'bg-warning',
      'published': 'bg-success',
      'rejected': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price / 100);
  };

  // Helper function to get stock status (PHP backend uses stock_quantity)
  const getStockStatus = (product) => {
    // PHP backend structure - prioritize this first
    if (product.stock_quantity !== undefined) {
      const stock = parseInt(product.stock_quantity) || 0;
      return { 
        quantity: stock, 
        inStock: stock > 0 
      };
    }
    
    // Medusa fallback: Check if we have first_variant
    if (product.first_variant) {
      const variant = product.first_variant;
      if (variant.manage_inventory === false) {
        return { quantity: 'Unlimited', inStock: true };
      }
      return { 
        quantity: variant.inventory_quantity || 0, 
        inStock: (variant.inventory_quantity || 0) > 0 
      };
    }
    
    // Medusa fallback: Standard variants array
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      if (variant.manage_inventory === false) {
        return { quantity: 'Unlimited', inStock: true };
      }
      return { 
        quantity: variant.inventory_quantity || 0, 
        inStock: (variant.inventory_quantity || 0) > 0 
      };
    }
    
    // Final fallback
    const inventory = product.total_inventory || product.inventory_quantity || 0;
    return { 
      quantity: inventory, 
      inStock: inventory > 0 
    };
  };

  // Helper function to get product price (PHP backend uses price in decimal, Medusa uses cents)
  const getProductPrice = (product) => {
    // PHP backend structure - price is stored as decimal, convert to cents for formatPrice
    if (product.price !== undefined && !product.first_variant && !product.variants) {
      // PHP backend: price is in decimal (e.g., 100.50), convert to cents
      return parseFloat(product.price) * 100;
    }
    
    // Medusa fallback: Check if we have first_variant with new pricing structure
    if (product.first_variant && product.first_variant.pricing) {
      return product.first_variant.pricing.amount;
    }
    
    // Medusa fallback: first_variant calculated_price (old structure)
    if (product.first_variant && product.first_variant.calculated_price) {
      return product.first_variant.calculated_price.calculated_amount;
    }
    
    // Medusa fallback: standard variants array
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      if (variant.pricing) {
        return variant.pricing.amount;
      }
      if (variant.calculated_price) {
        return variant.calculated_price.calculated_amount;
      }
    }
    
    // Final fallback - assume it's already in cents if it's a large number, otherwise convert
    const price = parseFloat(product.price) || 0;
    return price > 1000 ? price : price * 100;
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
    <div className="seller-products-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">My Products</h2>
          <p className="text-muted mb-0">Manage your product inventory and listings</p>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="useSimpleForm"
              checked={useSimpleForm}
              onChange={(e) => setUseSimpleForm(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="useSimpleForm">
              Simple Form
            </label>
          </div>
          <button 
            className="btn btn-enhanced"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Product
          </button>
        </div>
      </div>


      {/* Enhanced Filters */}
      <div className="dashboard-card mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search products by name or description..."
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
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="proposed">Proposed</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="d-flex justify-content-between align-items-center">
              <span className="badge bg-primary fs-6">
                {filteredProducts.length} products
              </span>
              <div className="btn-group" role="group">
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-download"></i> Export
                </button>
                <button className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-funnel"></i> Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Products Table */}
      <div className="seller-table">
        <div className="table-responsive">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-box-seam display-1 text-muted"></i>
              </div>
              <h4 className="mb-3">No products found</h4>
              <p className="text-muted mb-4">Start by adding your first product to begin selling</p>
              <button
                className="btn btn-enhanced"
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Your First Product
              </button>
            </div>
          ) : (
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover-lift">
                    <td>
                      <div className="d-flex align-items-center">
                        {(() => {
                          const productImage = product.thumbnail || 
                                             (product.images && product.images.length > 0 ? product.images[0].url : null);
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
                          <h6 className="mb-1 fw-bold">{product.title}</h6>
                          <small className="text-muted">
                            {product.description?.substring(0, 50)}...
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong className="text-success">{formatPrice(getProductPrice(product))}</strong>
                    </td>
                    <td>
                      {(() => {
                        const stockStatus = getStockStatus(product);
                        return (
                          <span className={`status-badge ${stockStatus.inStock ? 'completed' : 'cancelled'}`}>
                            {typeof stockStatus.quantity === 'number' ? `${stockStatus.quantity} units` : stockStatus.quantity}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(product.created_at).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary hover-glow"
                          onClick={() => openEditModal(product)}
                          title="Edit Product"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger hover-glow"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete Product"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        useSimpleForm ? (
          <SimpleProductForm
            onProductCreated={loadProducts}
            onClose={() => setShowAddModal(false)}
          />
        ) : (
          <MedusaProductForm
            onProductCreated={loadProducts}
            onClose={() => setShowAddModal(false)}
          />
        )
      )}

      {/* Enhanced Edit Product Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content dashboard-card">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Product
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleEditProduct}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Product Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        placeholder="Enter product title"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Price (PHP) *</label>
                      <div className="input-group">
                        <span className="input-group-text">₱</span>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Description *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        required
                        placeholder="Describe your product..."
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Stock Quantity *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.inventory_quantity}
                        onChange={(e) => setFormData({...formData, inventory_quantity: e.target.value})}
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="draft">Draft</option>
                        <option value="proposed">Proposed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-enhanced">
                    <i className="bi bi-check-circle me-2"></i>
                    Update Product
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