import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import UserFooter from '../../components/partials/UserFooter.jsx'

export default function UserCategoriesPage() {
  const { state } = useAppState()
  const { isLoggedIn } = state
  const { categoryId } = useParams()

  // Mock data for demonstration (frontend only)
  const mockCategories = [
    {
      id: '1',
      name: 'Fruits & Vegetables',
      description: 'Fresh and locally grown produce for your kitchen.'
    },
    {
      id: '2',
      name: 'Meat & Seafood',
      description: 'High-quality meat and seafood products from local producers.'
    },
    {
      id: '3',
      name: 'Baked Goods',
      description: 'Freshly baked bread, pastries, and more.'
    }
  ]

  const mockProducts = [
    {
      id: 1,
      name: 'Fresh Mangoes',
      seller: 'Sagnay Farmer Cooperative',
      price: 120,
      image: '/images/products/mango.jpg',
      isFeatured: true,
      avgRating: 4.7,
      reviewCount: 82
    },
    {
      id: 2,
      name: 'Organic Tomatoes',
      seller: 'Green Fields Farm',
      price: 60,
      image: '/images/products/tomato.jpg',
      isFeatured: false,
      avgRating: 4.3,
      reviewCount: 41
    },
    {
      id: 3,
      name: 'Tilapia Fish',
      seller: 'Sagnay Aquafarmers',
      price: 150,
      image: '/images/products/tilapia.jpg',
      isFeatured: true,
      avgRating: 4.8,
      reviewCount: 60
    },
    {
      id: 4,
      name: 'Pandesal Pack',
      seller: 'Pan de Sagnay',
      price: 50,
      image: '/images/products/pandesal.jpg',
      isFeatured: false,
      avgRating: 4.5,
      reviewCount: 23
    }
  ]

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Simulate data load
  useEffect(() => {
    setLoading(true)

    // Simulate category lookup
    const foundCategory = mockCategories.find(cat => cat.id === categoryId)
    if (!foundCategory) {
      setError('Category not found')
      setLoading(false)
      return
    }

    // Set mock data
    setCategory(foundCategory)
    setProducts(mockProducts)
    setTotalPages(1)
    setLoading(false)
  }, [categoryId])

  const addToCart = (productId) => {
    if (!isLoggedIn) {
      alert('Please log in to add items to your cart.')
      return
    }
    const product = products.find(p => p.id === productId)
    alert(`"${product.name}" added to cart! (frontend only)`)
  }

  if (loading) {
    return (
      <>
        <div style={{ height: '72px' }}></div>
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading category...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div style={{ height: '72px' }}></div>
        <div className="container py-5">
          <div className="text-center py-5">
            <i className="bi bi-grid-3x3-gap" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
            <h3 className="mt-3">Category Not Available</h3>
            <p className="text-muted mb-4">
              This category could not be found or may no longer be available.
            </p>
            <Link to="/products" className="btn btn-primary me-2">
              Browse All Products
            </Link>
            <Link to="/home" className="btn btn-outline-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Category Header */}
      <section className="category-header bg-success text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold mb-3">{category?.name}</h1>
          <p className="lead mb-0">{category?.description}</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="bg-light py-3">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/home">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/products">Products</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {category?.name}
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-4 text-center">
            <div className="col-12">
              <h2>{category?.name}</h2>
              <p className="text-muted">
                <span className="fw-bold">{products.length}</span> products found
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box-seam" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
              <h4 className="mt-3">No products found</h4>
              <p className="text-muted">There are no products in this category yet.</p>
              <Link to="/products" className="btn btn-primary">
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {products.map((product) => (
                <div className="col-lg-3 col-md-4 col-sm-6" key={product.id}>
                  <div className="card product-card h-100 position-relative">
                    {product.isFeatured && (
                      <span className="badge bg-primary position-absolute top-0 end-0 m-2">
                        Featured
                      </span>
                    )}

                    <div className="product-image-container position-relative">
                      <img
                        src={product.image}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate">{product.name}</h5>
                      <p className="text-muted small mb-2">
                        <i className="bi bi-shop me-1"></i>{product.seller}
                      </p>

                      <div className="price-section mb-3">
                        <span className="fw-bold text-success fs-5">₱{product.price.toFixed(2)}</span>
                      </div>

                      {product.avgRating > 0 && (
                        <div className="mb-2">
                          <small className="text-muted">
                            ⭐ {product.avgRating.toFixed(1)} ({product.reviewCount} reviews)
                          </small>
                        </div>
                      )}

                      <div className="mt-auto">
                        <div className="d-flex gap-2">
                          {isLoggedIn ? (
                            <>
                              <button
                                className="btn btn-success btn-sm flex-fill"
                                onClick={() => addToCart(product.id)}
                              >
                                Add to Cart
                              </button>
                              <Link to={`/auth/products/${product.id}`} className="btn btn-outline-primary btn-sm">
                                View Details
                              </Link>
                            </>
                          ) : (
                            <Link to="/login" className="btn btn-success btn-sm w-100">
                              Login to Add to Cart
                            </Link>
                          )}
                        </div>

                        <div className="mt-2">
                          <span className="badge bg-success small">
                            <i className="bi bi-shield-check me-1"></i>LGU Validated
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <UserFooter />
    </>
  )
}
