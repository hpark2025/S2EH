import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import UserFooter from "../../components/partials/UserFooter.jsx"
import { useCart } from "../../hooks/useCart"
import { userCartAPI } from "../../services/userCartAPI"
import { useAppState } from "../../context/AppContext.jsx"

export default function UserHomePage() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { state } = useAppState()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "From Sagnay to Every Home | E-Commerce Platform"
    loadFeaturedProducts()
  }, [])
  
  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading featured products from PHP backend using Vite proxy...')
      console.log('🔍 Fetching products with status=published')
      
      // Use Vite proxy to avoid CORS issues
      const apiUrl = '/api/products?limit=100'
      console.log('🔍 API URL (via Vite proxy):', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Response data:', data)
      
      // Backend returns { success: true, data: { products: [...], pagination: {...} } }
      const products = data.data?.products || data.products || []
      console.log('✅ Products array:', products)
      console.log('✅ Products count:', products.length)
      console.log('✅ Products status:', products.map(p => ({ id: p.id, title: p.title, status: p.status })))
      
      setFeaturedProducts(products)
    } catch (error) {
      console.error('❌ Failed to load products:', error)
      console.error('❌ Error details:', error.message)
      toast.error(`Failed to load products: ${error.message}`)
      setFeaturedProducts([])
    } finally {
      setLoading(false)
    }
  }

  const getProductPrice = (product) => {
    // PHP backend: direct price field (already in pesos, not cents)
    if (product.price !== undefined && product.price !== null) {
      return parseFloat(product.price);
    }
    
    // Fallback: Medusa-style variants (for backward compatibility)
    if (product.first_variant && product.first_variant.pricing) {
      return product.first_variant.pricing.amount / 100; // Convert from cents
    }
    
    if (product.first_variant && product.first_variant.calculated_price) {
      return product.first_variant.calculated_price.calculated_amount / 100;
    }
    
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      if (variant.pricing) {
        return variant.pricing.amount / 100;
      }
      if (variant.calculated_price) {
        return variant.calculated_price.calculated_amount / 100;
      }
    }
    return 0;
  }

  const getProductImage = (product) => {
    if (product.thumbnail) {
      return product.thumbnail.startsWith('http') 
        ? product.thumbnail 
        : `http://localhost:8080/S2EH/s2e-backend${product.thumbnail}`;
    }
    if (product.images && product.images.length > 0) {
      const image = product.images[0].url || product.images[0];
      return image.startsWith('http') 
        ? image 
        : `http://localhost:8080/S2EH/s2e-backend${image}`;
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
  }

  const getProductName = (product) => {
    return product.title || product.name || 'Unknown Product';
  }

  const getStockStatus = (product) => {
    // PHP backend: direct stock_quantity field
    if (product.stock_quantity !== undefined && product.stock_quantity !== null) {
      return {
        quantity: product.stock_quantity,
        manage_inventory: true
      };
    }
    
    // Fallback: Medusa-style first_variant
    if (product.first_variant && product.first_variant.inventory_quantity !== undefined) {
      return {
        quantity: product.first_variant.inventory_quantity,
        manage_inventory: product.first_variant.manage_inventory
      };
    }
    
    // Fallback: standard variants array
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      return {
        quantity: variant.inventory_quantity || 0,
        manage_inventory: variant.manage_inventory || false
      };
    }
    
    return { quantity: 0, manage_inventory: false };
  }

  // Filter products based on search term (real-time filtering)
  const filteredProducts = useMemo(() => {
    if (!state.searchTerm || state.searchTerm.trim() === '') {
      return featuredProducts;
    }
    
    const searchLower = state.searchTerm.toLowerCase().trim();
    return featuredProducts.filter(product => {
      const title = (product.title || product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const sellerName = (product.seller_name || '').toLowerCase();
      
      return title.includes(searchLower) || 
             description.includes(searchLower) || 
             sellerName.includes(searchLower);
    });
  }, [featuredProducts, state.searchTerm]);

  const handleAddToCart = async (product) => {
    try {
      console.log('🛒 Adding product to cart:', product);
      
      // Add to database cart
      await userCartAPI.addToCart(product.id, 1);
      
      // Also update localStorage cart for immediate UI feedback
      const success = addToCart(product, 1);
      
      if (success) {
        toast.success(`${product.title} added to basket!`, {
          duration: 2000,
          icon: '🛒'
        });
      }
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      toast.error(error.message || 'Failed to add to basket. Please make sure you are logged in.');
    }
  }

  return (
    <>
      {/* Carousel Section */}
      <div className="container mt-3">
        <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
            <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="3" aria-label="Slide 4"></button>
          </div>

          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/images/sagnay-tourism.jpg" className="d-block w-100" alt="Fresh Agricultural Products" />
            </div>
            <div className="carousel-item">
              <img src="/images/fish-farming.jpg" className="d-block w-100" alt="Traditional Fish Farming" />
            </div>
            <div className="carousel-item">
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836" className="d-block w-100" alt="Local Delicacies" />
            </div>
            <div className="carousel-item">
              <img src="/images/fishes.jpg" className="d-block w-100" alt="Local Delicacies" />
            </div>
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="featured-products py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">
            <i className="bi bi-star-fill me-2"></i>Featured Products
          </h2>
          
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No products available</h4>
              <p className="text-muted">Check back later for new products</p>
            </div>
          ) : filteredProducts.length === 0 && state.searchTerm ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No products found</h4>
              <p className="text-muted">Try adjusting your search: "{state.searchTerm}"</p>
            </div>
          ) : (
            <>
              {state.searchTerm && (
                <div className="mb-3 text-center">
                  <p className="text-muted">
                    Showing {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{state.searchTerm}"
                  </p>
                </div>
              )}
              <div className="row g-4">
                {filteredProducts.map((product) => {
                  const price = getProductPrice(product);
                  const image = getProductImage(product);
                  const name = getProductName(product);
                  const stockStatus = getStockStatus(product);
                  
                  return (
                    <div className="col-md-3" key={product.id}>
                      <div className="card product-card h-100">
                        <img 
                          src={image} 
                          className="card-img-top" 
                          alt={name}
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">{name}</h5>
                          <p className="text-muted small mb-2">
                            {product.description ? 
                              (product.description.length > 100 ? 
                                product.description.substring(0, 100) + '...' : 
                                product.description
                              ) : 
                              'No description available'
                            }
                          </p>
                          
                          {/* Stock Status */}
                          <div className="mb-2">
                            {stockStatus.manage_inventory ? (
                              <span className={`badge ${stockStatus.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                                {stockStatus.quantity > 0 ? `In Stock (${stockStatus.quantity})` : 'Out of Stock'}
                              </span>
                            ) : (
                              <span className="badge bg-info">Available</span>
                            )}
                          </div>
                          
                          <p className="price fw-bold text-success mb-3">₱{price.toFixed(2)}</p>
                          
                          <div className="d-flex justify-content-between mt-auto">
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              onClick={() => navigate(`/user/products/${product.id}`)}
                            >
                              View Details
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-success"
                              onClick={() => handleAddToCart(product)}
                              disabled={stockStatus.manage_inventory && stockStatus.quantity === 0}
                            >
                              <i className="bi bi-basket me-1"></i>Add to Basket
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-4">
                <button type="button" className="btn btn-success" onClick={() => navigate("/user/products")}>
                  View All Products
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">
            <i className="bi bi-info-circle me-2"></i>How It Works
          </h2>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="process-step">
                <div className="process-icon mb-3">
                  <i className="bi bi-shop fs-1 text-success"></i>
                </div>
                <h4>1. Local Producers List Products</h4>
                <p>Producers from Sagnay create accounts and list their products with LGU-validated prices.</p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="process-step">
                <div className="process-icon mb-3">
                  <i className="bi bi-cart-check fs-1 text-success"></i>
                </div>
                <h4>2. Customers Shop Online</h4>
                <p>Customers across the Philippines browse and purchase authentic local goods from Sagnay.</p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="process-step">
                <div className="process-icon mb-3">
                  <i className="bi bi-truck fs-1 text-success"></i>
                </div>
                <h4>3. Delivery Nationwide</h4>
                <p>Products are delivered directly to customers' homes anywhere in the Philippines.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </>
  )
}
