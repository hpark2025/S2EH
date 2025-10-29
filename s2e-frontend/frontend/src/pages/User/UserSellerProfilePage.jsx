import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import UserFooter from '../../components/partials/UserFooter.jsx'
import { sellersAPI } from '../../services/authAPI.js'

export default function UserSellerProfilePage() {
  const { sellerId } = useParams()
  const navigate = useNavigate()
  const { state } = useAppState()
  const { isLoggedIn } = state
  
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('featured')
  const productsPerPage = 8

  // State for dynamic data
  const [sellerData, setSellerData] = useState(null)
  const [sellerProducts, setSellerProducts] = useState([])
  const [categoryCounts, setCategoryCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)

  // Load seller data
  useEffect(() => {
    const loadSellerProfile = async () => {
      try {
        setLoading(true)
        const response = await sellersAPI.getSellerProfile(sellerId)
        if (response.success) {
          setSellerData(response.data.seller)
        } else {
          setError('Seller not found')
        }
      } catch (error) {
        console.error('Error loading seller profile:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (sellerId) {
      loadSellerProfile()
    }
  }, [sellerId])

  // Load seller products
  useEffect(() => {
    const loadSellerProducts = async () => {
      if (!sellerData) return

      try {
        const params = {
          page: currentPage,
          limit: productsPerPage,
          category: activeFilter,
          sortBy: sortBy
        }

        const response = await sellersAPI.getSellerProducts(sellerId, params)
        if (response.success) {
          setSellerProducts(response.data.products || [])
          setCategoryCounts(response.data.categories || {})
          setTotalPages(response.data.pagination.totalPages || 1)
        }
      } catch (error) {
        console.error('Error loading seller products:', error)
      }
    }

    loadSellerProducts()
  }, [sellerId, sellerData, currentPage, activeFilter, sortBy])

  // Generate star rating
  const generateStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>)
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>)
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>)
    }

    return stars
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openChatWithSeller = () => {
    if (isLoggedIn && sellerData) {
      navigate(`/auth/chat?seller=${sellerData.id}`)
    } else {
      navigate('/login')
    }
  }

  const addToCart = async (product) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    try {
      const response = await cartAPI.addToCart(product.id, 1)
      if (response.success) {
        alert(`${product.name} has been added to your cart!`)
      } else {
        alert('Failed to add product to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add product to cart')
    }
  }

  const viewProductDetails = (productId) => {
    const path = isLoggedIn ? `/auth/products/${productId}` : `/user/products/${productId}`
    navigate(path)
  }

  // Loading state
  if (loading) {
    return (
      <>
        <div className="container-fluid" style={{ marginTop: '70px' }}>
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading seller profile...</p>
          </div>
        </div>
        <UserFooter />
      </>
    )
  }

  // Error state
  if (error || !sellerData) {
    return (
      <>
        <div className="container-fluid" style={{ marginTop: '70px' }}>
          <div className="text-center py-5">
            <i className="bi bi-person-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
            <h3 className="mt-3">Seller Not Available</h3>
            <p className="text-muted mb-4">
              {!sellerData ? 
                'This seller profile could not be found or may no longer be active.' :
                'Unable to load seller information at the moment.'
              }
            </p>
            <Link to="/auth/products" className="btn btn-primary me-2">
              Browse Products
            </Link>
            <Link to="/auth/home" className="btn btn-outline-secondary">
              Back to Home
            </Link>
          </div>
        </div>
        <UserFooter />
      </>
    )
  }

  return (
    <>
      <div className="container-fluid" style={{ marginTop: '70px' }}>
        {/* Seller Header */}
        <div className="seller-header bg-white border rounded p-4 mb-4">
          <div className="row align-items-center">
            <div className="col-md-3 text-center">
              <div className="bg-light border rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                   style={{ width: '120px', height: '120px' }}>
                <span className="text-muted fs-1">{sellerData.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="seller-rating">
                <div className="mb-2">
                  {generateStars(sellerData.avgRating)}
                  <span className="ms-2">{sellerData.avgRating.toFixed(1)} ({sellerData.totalReviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <h1 className="mb-2">{sellerData.name}</h1>
              <p className="text-muted mb-3">Premium agricultural products from {sellerData.location}</p>
              
              <div className="row text-center mb-3">
                <div className="col-4">
                  <h5 className="text-primary mb-0">{sellerData.totalProducts}</h5>
                  <small className="text-muted">Products</small>
                </div>
                <div className="col-4">
                  <h5 className="text-success mb-0">{sellerData.totalOrders.toLocaleString()}</h5>
                  <small className="text-muted">Orders</small>
                </div>
                <div className="col-4">
                  <h5 className="text-info mb-0">{new Date().getFullYear() - new Date(sellerData.joinedDate).getFullYear()}</h5>
                  <small className="text-muted">Years</small>
                </div>
              </div>

              {sellerData.verified && (
                <div className="seller-badges">
                  <span className="badge bg-success me-2">
                    <i className="bi bi-shield-check me-1"></i>Verified Seller
                  </span>
                </div>
              )}
            </div>
            <div className="col-md-3 text-end">
              <button 
                className="btn btn-success mb-2 d-block w-100" 
                onClick={openChatWithSeller}
              >
                <i className="bi bi-chat-dots me-2"></i>Message Seller
              </button>
            </div>
          </div>
        </div>

        {/* Store Info & Products */}
        <div className="row">
          {/* Store Information Sidebar */}
          <div className="col-lg-3">
            <div className="bg-white border rounded p-4 mb-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="mb-3">Store Information</h5>
              
              <div className="info-item mb-3">
                <h6 className="text-muted mb-1">Location</h6>
                <p className="mb-0">
                  <i className="bi bi-geo-alt text-primary me-2"></i>
                  {sellerData.location}
                </p>
              </div>

              <div className="info-item mb-3">
                <h6 className="text-muted mb-1">Joined</h6>
                <p className="mb-0">
                  <i className="bi bi-calendar text-primary me-2"></i>
                  {new Date(sellerData.joinedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>

              <div className="info-item mb-3">
                <h6 className="text-muted mb-1">Response Time</h6>
                <p className="mb-0">
                  <i className="bi bi-clock text-primary me-2"></i>
                  {sellerData.responseTime}
                </p>
              </div>

              <div className="info-item mb-4">
                <h6 className="text-muted mb-1">Delivery Options</h6>
                <div className="delivery-options">
                  <span className="badge bg-light text-dark me-1 mb-1">Local Pickup</span>
                  <span className="badge bg-light text-dark me-1 mb-1">JRS Express</span>
                  <span className="badge bg-light text-dark me-1 mb-1">LBC</span>
                </div>
              </div>

              <div className="store-policies">
                <h6 className="mb-2">Store Policies</h6>
                <ul className="list-unstyled small text-muted">
                  <li className="mb-1">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Fresh products guaranteed
                  </li>
                  <li className="mb-1">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    7-day return policy
                  </li>
                  <li className="mb-1">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Secure packaging
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="col-lg-9">
            {/* Filter and Sort Controls */}
            <div className="bg-white border rounded p-3 mb-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="filter-buttons">
                    {Object.entries(categoryCounts).map(([category, count]) => (
                      <button
                        key={category}
                        className={`btn btn-sm me-2 ${
                          activeFilter === category ? 'btn-primary' : 'btn-outline-primary'
                        }`}
                        onClick={() => handleFilterChange(category)}
                      >
                        {category === 'all' ? 'All Products' : 
                         category.charAt(0).toUpperCase() + category.slice(1)} ({count})
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-md-6 text-end">
                  <select 
                    className="form-select form-select-sm d-inline-block w-auto"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Sort by: Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="bestselling">Best Selling</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading products...</span>
                </div>
                <p className="mt-2">Loading seller products...</p>
              </div>
            ) : sellerProducts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <h4 className="mt-3">No products available</h4>
                <p className="text-muted">
                  {activeFilter === 'all' 
                    ? `${sellerData.name} hasn't listed any products yet.`
                    : `No products found in the "${activeFilter}" category.`
                  }
                </p>
                {activeFilter !== 'all' && (
                  <button 
                    className="btn btn-outline-primary mt-2" 
                    onClick={() => handleFilterChange('all')}
                  >
                    View All Products
                  </button>
                )}
              </div>
            ) : (
              <div className="row g-3 mb-4">
                {sellerProducts.map(product => (
                <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="card product-card h-100">
                    <div className="position-relative">
                      <img 
                        src={product.image} 
                        className="card-img-top" 
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      {product.isFeatured && (
                        <span className="position-absolute top-0 start-0 bg-primary text-white px-2 py-1 rounded-end">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{product.name}</h5>
                      <p className="seller-name text-muted">
                        <i className="bi bi-person-circle me-1"></i>{sellerData.name}
                      </p>
                      <div className="mb-2">
                        {generateStars(product.avgRating)}
                        <span className="ms-1 small text-muted">
                          {product.avgRating.toFixed(1)} ({product.reviewCount})
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="price fw-bold text-success">₱{product.price.toFixed(2)}</span>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted">{product.soldCount || 0} sold</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => viewProductDetails(product.id)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => addToCart(product)}
                        >
                          <i className="bi bi-cart-plus me-1"></i>Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}

            {/* Pagination */}
            {!loadingProducts && sellerProducts.length > 0 && totalPages > 1 && (
              <nav aria-label="Products pagination" className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <a 
                      href="#" 
                      className="page-link" 
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) handlePageChange(currentPage - 1)
                      }}
                    >
                      Previous
                    </a>
                  </li>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <a 
                          href="#" 
                          className="page-link" 
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(pageNum)
                          }}
                        >
                          {pageNum}
                        </a>
                      </li>
                    )
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <a 
                      href="#" 
                      className="page-link" 
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                      }}
                    >
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      <UserFooter />
    </>
  )
}
