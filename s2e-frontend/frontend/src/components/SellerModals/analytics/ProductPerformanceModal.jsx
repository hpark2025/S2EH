import { useState } from 'react'
import PropTypes from 'prop-types'

const ProductPerformanceModal = ({ show, onClose, products = [] }) => {
  const [loading, setLoading] = useState(false)
  const [exported, setExported] = useState(false)

  if (!show) return null

  const handleExportData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setExported(true)
      setTimeout(() => {
        setExported(false)
      }, 2000)
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (exported) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Data Exported Successfully!</h5>
              <p className="text-muted">Your product performance data has been downloaded.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-graph-up me-2"></i>
              Product Performance Details
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="alert alert-info mb-3" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Detailed performance metrics for all your products including sales, revenue, and inventory status.
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>Change</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-semibold">{product.name}</div>
                      </td>
                      <td>{product.sales} units</td>
                      <td>{product.revenue}</td>
                      <td>
                        <span className={`badge ${product.change >= 0 ? 'bg-success' : 'bg-danger'}`}>
                          {product.change >= 0 ? '+' : ''}{product.change}%
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-info">In Stock</span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary" title="View Details">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-success" title="Restock">
                            <i className="bi bi-plus-circle"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg me-2"></i>Close
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleExportData}
              disabled={loading || exported}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ProductPerformanceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  products: PropTypes.array
}

export default ProductPerformanceModal