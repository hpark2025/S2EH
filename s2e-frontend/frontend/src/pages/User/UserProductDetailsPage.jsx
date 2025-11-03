import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import UserConditionalCategoryLink from '../../components/partials/UserConditionalCategoryLink.jsx'
import UserFooter from '../../components/partials/UserFooter.jsx'
import { ProductImageModal, ProductReviewModal, ProductChatModal } from '../../components/UserModals'
import { productsAPI } from '../../services/authAPI.js'
import { userCartAPI } from '../../services/userCartAPI.js'
import { useCart } from '../../hooks/useCart.js'
import { toast } from 'react-hot-toast'

export default function UserProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useAppState()
  const { isLoggedIn } = state
  const { addToCart } = useCart()
  const [activeTab, setActiveTab] = useState('description')
  const [showImageModal, setShowImageModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  
  // State for product data
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock product data (fallback when API is unavailable)
  const MOCK_PRODUCT = {
    id: id || 'prod-0001',
    name: 'Pili Nuts (250g)',
    description:
      'Premium handpicked Pili nuts from Sagnay, Camarines Sur. Lightly roasted to preserve natural flavor and crunch. Perfect snack and great for gifting.',
    price: 180,
    originalPrice: 220,
    unit: '250g pack',
    stock: 42,
    image: '/images/unknown.jpg',
    images: ['/images/unknown.jpg', '/images/unknown.jpg', '/images/unknown.jpg'],
    category: { id: 'agri', name: 'Agricultural Products' },
    seller: "Maria's Farm",
    sellerId: 'seller-marias-farm',
    reviewCount: 12,
    avgRating: 4.6,
    isFeatured: true,
    tags: ['organic', 'local', 'premium', 'healthy'],
    specifications: {
      'Weight': '250g',
      'Origin': 'Sagnay, Camarines Sur',
      'Storage': 'Cool, dry place',
      'Shelf Life': '12 months',
      'Certification': 'LGU Validated'
    },
    reviews: [
      {
        id: 1,
        user: 'Juan Dela Cruz',
        rating: 5,
        comment: 'Excellent quality! Very fresh and tasty.',
        date: '2024-01-15',
        verified: true
      },
      {
        id: 2,
        user: 'Maria Santos',
        rating: 4,
        comment: 'Good product, fast delivery.',
        date: '2024-01-10',
        verified: true
      }
    ],
    shippingInfo: {
      freeShipping: true,
      minOrder: 1000,
      standardDelivery: '3-7 business days',
      expressDelivery: '1-2 business days'
    }
  }

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await productsAPI.getProduct(id)
        console.log('📦 Product details loaded:', response.product)
        console.log('📦 Rating data:', {
          average_rating: response.product.average_rating,
          review_count: response.product.review_count
        })
        
        // Map backend fields to frontend format
        const productData = {
          ...response.product,
          // Map rating fields for backward compatibility
          avgRating: parseFloat(response.product.average_rating) || 0,
          reviewCount: parseInt(response.product.review_count) || 0,
          // Keep original values as well
          average_rating: parseFloat(response.product.average_rating) || 0,
          review_count: parseInt(response.product.review_count) || 0
        }
        
        setProduct(productData)
      } catch (error) {
        console.error('Error loading product:', error)
        setError('Failed to load product details')
        // Fallback to mock data on error
        setProduct(MOCK_PRODUCT)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProduct()
    } else {
      // Use mock data when no ID provided
      setProduct(MOCK_PRODUCT)
      setLoading(false)
    }
  }, [id])

  // Helper functions for product structure
  const getProductPrice = (product) => {
    // PHP backend: direct price field (already in pesos, not cents)
    if (product.price !== undefined && product.price !== null) {
      return parseFloat(product.price);
    }
    
    // Fallback: Medusa-style variants (for backward compatibility)
    if (product.first_variant && product.first_variant.pricing) {
      return product.first_variant.pricing.amount / 100;
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
  };

  const getStockStatus = (product) => {
    // PHP backend: direct stock_quantity field
    if (product.stock_quantity !== undefined && product.stock_quantity !== null) {
      return {
        inStock: product.stock_quantity > 0,
        quantity: product.stock_quantity
      };
    }
    
    // Fallback: Medusa-style variants
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      if (variant.manage_inventory === false) {
        return { inStock: true, quantity: 'Unlimited' };
      }
      return { 
        inStock: (variant.inventory_quantity || 0) > 0, 
        quantity: variant.inventory_quantity || 0 
      };
    }
    return { inStock: product.stock > 0, quantity: product.stock || 0 };
  };

  const getProductImages = (product) => {
    // PHP backend: images is already an array of URLs
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Check if it's already an array of strings (PHP backend)
      if (typeof product.images[0] === 'string') {
        return product.images.map(img => 
          img.startsWith('http') 
            ? img 
            : `http://localhost:8080/S2EH/s2e-backend${img}`
        );
      }
      // Medusa-style: array of objects with .url property
      return product.images.map(img => {
        const url = img.url || img;
        return url.startsWith('http') 
          ? url 
          : `http://localhost:8080/S2EH/s2e-backend${url}`;
      });
    }
    const thumbnail = product.thumbnail;
    if (thumbnail) {
      return [thumbnail.startsWith('http') 
        ? thumbnail 
        : `http://localhost:8080/S2EH/s2e-backend${thumbnail}`
      ];
    }
    return ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E'];
  };

  const chatWithSeller = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    
    if (!product) {
      toast.error('Product information not available')
      return
    }
    
    // Extract seller_id from product data (PHP backend returns seller_id directly)
    const sellerId = product.seller_id || product.sellerId || product.seller?.id
    
    if (!sellerId || sellerId === 'unknown') {
      toast.error('Seller information not available')
      return
    }
    
    setShowChatModal(true)
  }

  const viewSellerProfile = () => {
    if (!product) return
    const sellerId = product.sellerId || product.seller?.id || 'unknown'
    const path = isLoggedIn ? `/auth/seller/${sellerId}` : `/seller/${sellerId}`
    navigate(path)
  }

  const handleSubmitReview = async (reviewData) => {
    try {
      // Handle review submission - you'll need to implement this API endpoint
      console.log('Review submitted:', reviewData)
      alert('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review')
    }
  }

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    if (!product) {
      toast.error('Product not loaded')
      return
    }

    try {
      console.log('🛒 Adding product to cart:', product)
      console.log('🛒 Quantity:', quantity)

      // Add to database cart
      await userCartAPI.addToCart(product.id, quantity)

      // Also update localStorage cart for immediate UI feedback
      const productImage = getProductImages(product)[0]
      const cartProduct = {
        id: product.id,
        title: product.title,
        price: parseFloat(product.price),
        thumbnail: productImage,
        images: product.images || [productImage],
        sku: product.sku,
        seller_name: product.seller,
        quantity: quantity
      }

      const success = addToCart(cartProduct, quantity)

      if (success) {
        toast.success(`${product.title} added to basket!`, {
          duration: 2000,
          icon: '🛒'
        })
      }
    } catch (error) {
      console.error('❌ Failed to add to cart:', error)
      toast.error(error.message || 'Failed to add to basket. Please make sure you are logged in.')
    }
  }

  const buyNow = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    // Add to cart first, then navigate to checkout
    try {
      await addToCart()
      navigate('/auth/checkout')
    } catch (error) {
      console.error('Error in buy now:', error)
    }
  }

  const toggleWishlist = () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    setIsWishlisted(!isWishlisted)
    // Here you would typically call an API to add/remove from wishlist
  }

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      })
    } else {
      setShowShareModal(true)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i 
        key={i} 
        className={`bi bi-star${i < Math.floor(rating) ? '-fill' : ''} ${i < rating ? 'text-warning' : 'text-muted'}`}
      ></i>
    ));
  }

  if (loading) {
    return (
      <>
        <div className="container" style={{ marginTop: '100px' }}>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading product details...</p>
          </div>
        </div>
        <UserFooter />
      </>
    )
  }

  if (error && !product) {
    return (
      <>
        <div className="container" style={{ marginTop: '100px' }}>
          <div className="text-center py-5">
            <i className="bi bi-box" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
            <h3 className="mt-3">Product Not Available</h3>
            <p className="text-muted mb-4">
              {!product ? 
                'This product could not be found or may no longer be available.' :
                'Unable to load product information at the moment.'
              }
            </p>
            <Link to={isLoggedIn ? "/auth/products" : "/products"} className="btn btn-primary me-2">
              Browse Products
            </Link>
            <Link to={isLoggedIn ? "/auth/home" : "/home"} className="btn btn-outline-secondary">
              Back to Home
            </Link>
          </div>
        </div>
        <UserFooter />
      </>
    )
  }

  return (
    <div>
      {/* Product Details Content */}
      <div className="container product-details-container" style={{ marginTop: '90px' }}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to={isLoggedIn ? "/auth/home" : "/home"}>Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={isLoggedIn ? "/auth/products" : "/products"}>Products</Link>
            </li>
            {product.category && (
              <li className="breadcrumb-item">
                <Link to={isLoggedIn ? `/auth/products` : `/user/products`}>
                  {product.category.name}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details Section */}
        <div className="row g-4 align-items-start mb-5">
          {/* Left Column - Product Image */}
          <div className="col-lg-6 mb-4 mb-lg-0">
            <div className="product-image-gallery card border p-3 bg-white">
              <div className="row g-3">
                {/* Thumbnail Images */}
                <div className="col-2">
                  <div className="product-thumbnails d-flex flex-column gap-2">
                    {getProductImages(product).map((image, index) => (
                      <button
                        key={index}
                        className={`product-thumbnail border ${selectedImageIndex === index ? 'border-primary' : 'border-light'}`}
                        onClick={() => setSelectedImageIndex(index)}
                        style={{ padding: '2px', borderRadius: '4px' }}
                      >
                        <img
                          src={image}
                          alt={`${product.title || product.name} ${index + 1}`}
                          className="img-fluid rounded"
                          style={{ height: '60px', width: '60px', objectFit: 'cover' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Product Image */}
                <div className="col-10">
                  <div className="product-main-image position-relative">
                    <img 
                      src={getProductImages(product)[selectedImageIndex] || product.thumbnail || '/images/unknown.jpg'} 
                      alt={product.title || product.name} 
                      className="img-fluid w-100 rounded"
                      style={{ minHeight: '400px', maxHeight: '500px', objectFit: 'contain', backgroundColor: '#ffffff' }}
                    />
                    
                  {/* Product Badges - Top Left */}
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-success mb-2 d-block">
                      <i className="bi bi-shield-check me-1"></i>LGU Validated
                    </span>
                    {product.isFeatured && (
                      <span className="badge bg-primary mb-2 d-block">
                        <i className="bi bi-patch-check me-1"></i>Featured
                      </span>
                    )}
                    {product.originalPrice > product.price && (
                      <span className="badge bg-danger mb-2 d-block">
                        <i className="bi bi-percent me-1"></i>
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Image Controls - Bottom Right */}
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <button 
                      className="btn btn-dark btn-sm me-2"
                      onClick={() => setShowImageModal(true)}
                      title="Fullscreen"
                    >
                      <i className="bi bi-arrows-fullscreen"></i>
                    </button>
                    <button 
                      className="btn btn-dark btn-sm me-2"
                      onClick={shareProduct}
                      title="Share"
                    >
                      <i className="bi bi-share"></i>
                    </button>
                    <button 
                      className={`btn btn-sm me-2 ${isWishlisted ? 'btn-danger' : 'btn-light'}`}
                      onClick={toggleWishlist}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <i className={`bi bi-heart${isWishlisted ? '-fill' : ''}`}></i>
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="col-lg-6">
            <div className="product-info-card card border p-4 mb-4 bg-white">
              {/* Product Title */}
              <h1 className="product-title h4 mb-3">{product.title || product.name}</h1>

              {/* Price and stock quick info */}
              <div className="product-price-section mb-3 bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="product-price-main fs-3 fw-bold text-dark">₱{getProductPrice(product).toFixed(2)}</span>
                      {product.originalPrice > getProductPrice(product) && (
                        <span className="product-price-original text-decoration-line-through ms-2 text-muted fs-5">₱{product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <small className="text-muted">Price includes all applicable taxes</small>
                    {product.originalPrice > getProductPrice(product) && (
                      <div className="mt-2">
                        <span className="product-savings badge bg-secondary">
                          Save ₱{(product.originalPrice - getProductPrice(product)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-end">
                    {(() => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <span className={`badge ${
                          stockStatus.inStock ? 
                            (typeof stockStatus.quantity === 'number' && stockStatus.quantity > 10 ? 'bg-secondary' : 'bg-secondary') : 
                            'bg-secondary'
                        }`}>
                          {stockStatus.inStock ? 
                            (typeof stockStatus.quantity === 'number' ? `${stockStatus.quantity} in stock` : 'In stock') : 
                            'Out of stock'
                          }
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-3">
                {product.tags?.map((tag, index) => (
                  <span key={index} className="badge bg-light text-dark me-1 mb-1">{tag}</span>
                ))}
              </div>

            {/* Seller Information */}
            <div className="seller-info-card card border p-3 mb-4 bg-white">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div className="seller-avatar bg-light text-dark border rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    {(product.seller?.charAt(0) || '?').toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1">{product.seller}</h6>
                  <small className="text-muted">({product.review_count || product.reviewCount || 0} reviews)</small>
                  <br />
                  <small className="text-muted">
                    <i className="bi bi-geo-alt me-1"></i>Sagnay, Camarines Sur
                  </small>
                </div>
                <div>
                  <button className="btn btn-outline-success btn-sm" onClick={chatWithSeller}>
                    <i className="bi bi-chat me-1"></i>Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="card border p-3 mb-4 bg-white">
              <div className="d-flex align-items-center">
                {(() => {
                  const rating = product.average_rating || product.avgRating || 0;
                  const count = product.review_count || product.reviewCount || 0;
                  const hasRating = rating > 0 && count > 0;
                  
                  return hasRating ? (
                    <>
                      <div className="me-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`bi ${star <= Math.round(rating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                            style={{ fontSize: '1.2rem' }}
                          />
                        ))}
                      </div>
                      <strong className="me-2 fs-5">{rating.toFixed(1)}</strong>
                      <span className="text-muted me-3">({count} {count === 1 ? 'review' : 'reviews'})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-warning me-2 fs-4">★</span>
                      <strong className="me-2 fs-5">0</strong>
                      <span className="text-muted me-3">(0 reviews)</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Quantity */}
            {product && (
              <div className="card border p-3 mb-4 bg-white">
                <div className="mb-2"><strong>Quantity:</strong></div>
                <div className="d-flex align-items-center">
                  <div className="d-flex border rounded overflow-hidden">
                    <button 
                      className="btn btn-sm btn-outline-secondary px-3"
                      onClick={() => {
                        if (quantity > 1) {
                          setQuantity(quantity - 1)
                        }
                      }}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      className="form-control border-0 text-center"
                      value={quantity} 
                      min="1" 
                      max={(() => {
                        if (!product) return 1
                        const stockStatus = getStockStatus(product)
                        return stockStatus.quantity === 'Unlimited' ? undefined : (stockStatus.quantity || 1)
                      })()}
                      onChange={(e) => {
                        if (!product) return
                        const stockStatus = getStockStatus(product)
                        const maxQty = stockStatus.quantity === 'Unlimited' ? undefined : (stockStatus.quantity || 1)
                        const inputValue = parseInt(e.target.value) || 1
                        const newQty = maxQty ? Math.max(1, Math.min(maxQty, inputValue)) : Math.max(1, inputValue)
                        setQuantity(newQty)
                      }}
                      style={{ width: '60px' }} 
                    />
                    <button 
                      className="btn btn-sm btn-outline-secondary px-3"
                      onClick={() => {
                        if (!product) return
                        const stockStatus = getStockStatus(product)
                        const maxQty = stockStatus.quantity === 'Unlimited' ? undefined : (stockStatus.quantity || 1)
                        if (maxQty) {
                          const newQty = Math.min(maxQty, quantity + 1)
                          setQuantity(newQty)
                        } else {
                          setQuantity(quantity + 1)
                        }
                      }}
                      disabled={(() => {
                        if (!product) return true
                        const stockStatus = getStockStatus(product)
                        if (stockStatus.quantity === 'Unlimited') return false
                        return quantity >= (stockStatus.quantity || 0)
                      })()}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-muted ms-3">
                    {(() => {
                      if (!product) return 'Loading...'
                      const stockStatus = getStockStatus(product)
                      return stockStatus.quantity === 'Unlimited' 
                        ? 'Unlimited pieces available' 
                        : `${stockStatus.quantity || 0} pieces available`
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="card border p-3 mb-4 bg-white">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-success"
                  onClick={handleAddToCart}
                  disabled={getStockStatus(product).quantity === 0}
                >
                  <i className="bi bi-cart-plus me-2"></i>Add to Cart
                </button>
                <button 
                  className="btn btn-success"
                  onClick={buyNow}
                  disabled={getStockStatus(product).quantity === 0}
                >
                  <i className="bi bi-lightning me-2"></i>Buy Now
                </button>
              </div>
            </div>

            {/* Product Guarantee */}
            <div className="card border p-3 mb-4 bg-white">
              <div className="d-flex align-items-center">
                <i className="bi bi-shield-check text-success me-2 fs-4"></i>
                <small>100% Authentic Products Guaranteed</small>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-tabs mt-5 card border p-0 bg-white">
          {/* Tab Navigation */}
          <div className="card-header bg-white p-0 m-0 w-100 border-bottom-0">
            <ul className="nav nav-tabs card-header-tabs border-bottom-0 d-flex flex-nowrap overflow-auto w-100">
              <li className="nav-item">
                <button 
                  className={`nav-link px-4 py-3 ${activeTab === 'description' ? 'active fw-bold' : ''}`}
                  onClick={() => setActiveTab('description')}
                  type="button"
                >
                  <i className="bi bi-file-text me-1"></i>Description
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link px-4 py-3 ${activeTab === 'specifications' ? 'active fw-bold' : ''}`}
                  onClick={() => setActiveTab('specifications')}
                  type="button"
                >
                  <i className="bi bi-list-ul me-1"></i>Specifications
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link px-4 py-3 ${activeTab === 'reviews' ? 'active fw-bold' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                  type="button"
                >
                  <i className="bi bi-star me-1"></i>Reviews ({product.review_count || product.reviewCount || 0})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link px-4 py-3 ${activeTab === 'shipping' ? 'active fw-bold' : ''}`}
                  onClick={() => setActiveTab('shipping')}
                  type="button"
                >
                  <i className="bi bi-truck me-1"></i>Shipping & Returns
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className="card-body p-4 w-100">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="tab-content">
                <h5>Product Description</h5>
                <div className="mt-3">
                  <p>{product.description || 'No description available for this product.'}</p>
                  <div className="mt-3">
                    <h6>Product Details:</h6>
                    <ul className="mt-2">
                      <li><strong>Unit:</strong> {product.unit}</li>
                      <li><strong>Category:</strong> {product.category?.name || 'Uncategorized'}</li>
                      <li><strong>Seller:</strong> {product.seller}</li>
                      <li><strong>Stock Available:</strong> {product.stock} units</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="tab-content">
                <h5>Product Specifications</h5>
                <div className="table-responsive mt-3">
                  <table className="table table-striped">
                    <tbody>
                      <tr>
                        <td className="fw-bold">Unit</td>
                        <td>{product.unit}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Category</td>
                        <td>{product.category?.name || 'Uncategorized'}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Stock Available</td>
                        <td>{product.stock} units</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Seller</td>
                        <td>{product.seller}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Origin</td>
                        <td>Sagnay, Camarines Sur</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Certification</td>
                        <td>LGU Validated</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="tab-content">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5>Customer Reviews</h5>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <i className="bi bi-pencil me-2"></i>Write a Review
                  </button>
                </div>

                {/* Rating Summary */}
                <div className="row mb-4">
                  <div className="col-md-4 text-center">
                    {(() => {
                      const rating = product.average_rating || product.avgRating || 0;
                      const count = product.review_count || product.reviewCount || 0;
                      return (
                        <>
                          <div className="display-4 text-warning mb-2">{rating.toFixed(1)}</div>
                          <div className="mb-2">{renderStars(rating)}</div>
                          <small className="text-muted">Based on {count} {count === 1 ? 'review' : 'reviews'}</small>
                        </>
                      );
                    })()}
                  </div>
                  <div className="col-md-8 d-flex align-items-center justify-content-center">
                    <div className="text-center">
                      <i className="bi bi-star-fill text-warning mb-3" style={{ fontSize: '2rem' }}></i>
                      <p className="mb-0">No rating breakdown available yet</p>
                      <small className="text-muted">Ratings will appear as customers review this product</small>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="reviews-list">
                    {product.reviews.map(review => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <div>
                            <strong className="review-user">{review.user}</strong>
                            {review.verified && (
                              <span className="badge bg-success ms-2">Verified Purchase</span>
                            )}
                          </div>
                          <small className="review-date">{new Date(review.date).toLocaleDateString()}</small>
                        </div>
                        <div className="review-rating">{renderStars(review.rating)}</div>
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-chat-square-dots display-1 mb-3"></i>
                      <p className="lead">No reviews yet</p>
                      <p>Be the first to review this product!</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <div className="tab-content">
                <h5>Shipping & Returns</h5>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <h6><i className="bi bi-truck me-2"></i>Shipping Information</h6>
                    <ul className="list-unstyled mt-3">
                      <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Free shipping on orders over ₱1,000</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Standard delivery: 3-7 business days</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Express delivery: 1-2 business days</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Nationwide coverage</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6><i className="bi bi-arrow-return-left me-2"></i>Returns & Exchanges</h6>
                    <ul className="list-unstyled mt-3">
                      <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>30-day return policy</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Free returns for defective items</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Easy exchange process</li>
                      <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Money-back guarantee</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Product Modals */}
      {product && (
        <ProductImageModal
          show={showImageModal}
          onClose={() => setShowImageModal(false)}
          images={getProductImages(product)}
          activeIndex={selectedImageIndex}
        />
      )}

      <ProductReviewModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        productName={product.name}
      />

      {product && (
        <ProductChatModal
          show={showChatModal}
          onClose={() => setShowChatModal(false)}
          sellerId={product.seller_id || product.sellerId}
          sellerName={product.seller_name || product.seller}
          productName={product.title || product.name}
          productId={product.id}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Share Product</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowShareModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Product URL:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={window.location.href}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                    >
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary">
                    <i className="bi bi-facebook me-2"></i>Facebook
                  </button>
                  <button className="btn btn-info">
                    <i className="bi bi-twitter me-2"></i>Twitter
                  </button>
                  <button className="btn btn-success">
                    <i className="bi bi-whatsapp me-2"></i>WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserFooter />
    </div>
  )
}
