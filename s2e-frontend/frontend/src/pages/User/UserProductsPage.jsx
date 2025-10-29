import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-hot-toast'
import UserFooter from "../../components/partials/UserFooter.jsx";
import { authAPI } from '../../services/authAPI.js'
import { useCart } from '../../hooks/useCart.js'

export default function UserProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
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
      
      if (response && response.products) {
        setProducts(response.products);
      } else if (Array.isArray(response)) {
        setProducts(response);
      }
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

  const totalPages = Math.ceil(products.length / productsPerPage);
  const currentProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

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
          ) : (
            <>
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
