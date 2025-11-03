import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-hot-toast'
import UserFooter from "../../components/partials/UserFooter.jsx";
import { authAPI } from '../../services/authAPI.js'
import { useCart } from '../../hooks/useCart.js'
import { useAppState } from '../../context/AppContext.jsx'

export default function UserProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { state } = useAppState();
  const productsPerPage = 8;

  // Load products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProducts();
      console.log('📦 Products loaded:', response);
      
      let productsArray = [];
      if (response && response.products) {
        productsArray = response.products;
      } else if (Array.isArray(response)) {
        productsArray = response;
      }
      
      // Debug: Check rating data
      console.log('📦 Products with ratings:', productsArray.map(p => ({
        id: p.id,
        title: p.title,
        average_rating: p.average_rating,
        review_count: p.review_count,
        average_rating_type: typeof p.average_rating,
        average_rating_value: p.average_rating
      })));
      
      // Ensure rating values are properly parsed
      const productsWithRatings = productsArray.map(p => ({
        ...p,
        average_rating: p.average_rating ? parseFloat(p.average_rating) : 0,
        review_count: p.review_count ? parseInt(p.review_count) : 0
      }));
      
      console.log('📦 Products after parsing:', productsWithRatings.map(p => ({
        id: p.id,
        title: p.title,
        average_rating: p.average_rating,
        review_count: p.review_count
      })));
      
      setProducts(productsWithRatings);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const success = addToCart(product, 1);
    if (success) {
      toast.success(`${product.title} added to basket!`, {
        duration: 2000,
        icon: '🛒'
      });
    } else {
      toast.error('Failed to add to basket');
    }
  };

  const getProductImage = (product) => {
    if (product.thumbnail) {
      return product.thumbnail.startsWith('http') 
        ? product.thumbnail 
        : `http://localhost:8080/S2EH/s2e-backend${product.thumbnail}`;
    }
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      return typeof image === 'string' 
        ? (image.startsWith('http') ? image : `http://localhost:8080/S2EH/s2e-backend${image}`)
        : image;
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
  };

  // Filter products based on search term (real-time filtering)
  const filteredProducts = useMemo(() => {
    if (!state.searchTerm || state.searchTerm.trim() === '') {
      return products;
    }
    
    const searchLower = state.searchTerm.toLowerCase().trim();
    return products.filter(product => {
      const title = (product.title || product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const sellerName = (product.seller_name || '').toLowerCase();
      
      return title.includes(searchLower) || 
             description.includes(searchLower) || 
             sellerName.includes(searchLower);
    });
  }, [products, state.searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [state.searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  useEffect(() => {
    document.title = "Products | From Sagnay to Every Home";
  }, []);

  if (loading) {
    return (
      <>
        <section className="py-5 bg-light" style={{ marginTop: "100px" }}>
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading products...</p>
            </div>
          </div>
        </section>
        <UserFooter />
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="py-5 bg-light" style={{ marginTop: "100px" }}>
          <div className="container">
            <div className="text-center py-5">
              <i className="fas fa-exclamation-circle fa-4x text-danger mb-3"></i>
              <h3>{error}</h3>
              <button 
                className="btn btn-primary mt-3"
                onClick={loadProducts}
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
        <UserFooter />
      </>
    );
  }

  return (
    <>
      <section className="py-5 bg-light" style={{ marginTop: "100px" }}>
        <div className="container">
          <h1 className="mb-4 text-center">
            <i className="bi bi-basket-fill me-2 text-success"></i>Our Products
          </h1>

          {products.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-box-open fa-4x text-muted mb-3"></i>
              <h3>No products available</h3>
              <p className="text-muted">Check back later for new products!</p>
            </div>
          ) : filteredProducts.length === 0 && state.searchTerm ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h3 className="mt-3 text-muted">No products found</h3>
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
              {/* Product Grid */}
              <div className="row g-4">
                {currentProducts.map((product) => (
                  <div className="col-md-3 col-sm-6" key={product.id}>
                    <div className="card product-card h-100 shadow-sm border-0">
                      <img 
                        src={getProductImage(product)} 
                        className="card-img-top" 
                        alt={product.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{product.title}</h5>
                        <p className="text-muted mb-1 small">
                          <i className="bi bi-person-circle me-1"></i>
                          {product.seller_name || 'Unknown Seller'}
                        </p>
                        {/* Rating Display */}
                        {(() => {
                          // Debug: log raw values for first product
                          if (currentProducts.indexOf(product) === 0) {
                            console.log('🔍 First product rating debug:', {
                              id: product.id,
                              title: product.title,
                              average_rating: product.average_rating,
                              average_rating_type: typeof product.average_rating,
                              review_count: product.review_count,
                              review_count_type: typeof product.review_count,
                              raw_product: product
                            });
                          }
                          
                          const rating = parseFloat(product.average_rating) || 0;
                          const count = parseInt(product.review_count) || 0;
                          const hasRating = rating > 0 && count > 0;
                          
                          return hasRating ? (
                            <div className="mb-2">
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                      key={star}
                                      className={`bi ${star <= Math.round(rating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                                      style={{ fontSize: '0.85rem' }}
                                    />
                                  ))}
                                </div>
                                <small className="text-muted">
                                  {rating.toFixed(1)}
                                  {count > 0 && (
                                    <span className="ms-1">({count})</span>
                                  )}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-2">
                              <small className="text-muted">
                                <i className="bi bi-star text-muted me-1"></i>
                                No ratings yet
                                {/* Temporary debug - remove after testing */}
                                {process.env.NODE_ENV === 'development' && (
                                  <span className="ms-2 text-danger" style={{ fontSize: '0.7rem' }}>
                                    (r:{rating} c:{count})
                                  </span>
                                )}
                              </small>
                            </div>
                          );
                        })()}
                        <p className="fw-bold text-success mb-3">
                          ₱{parseFloat(product.price).toFixed(2)}
                        </p>
                        <div className="mt-auto d-flex justify-content-between gap-2">
                          <Link 
                            to={`/user/products/${product.id}`} 
                            className="btn btn-outline-success btn-sm flex-grow-1"
                          >
                            View Details
                          </Link>
                          <button 
                            className="btn btn-success btn-sm flex-grow-1"
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Basket
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Product pagination" className="mt-5">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <UserFooter />
    </>
  );
}
