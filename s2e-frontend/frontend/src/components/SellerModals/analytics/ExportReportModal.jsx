import { useState } from 'react'
import PropTypes from 'prop-types'

const ExportReportModal = ({ show, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [exported, setExported] = useState(false)
  const [reportType, setReportType] = useState('complete')
  const [dateRange, setDateRange] = useState('30')
  const [format, setFormat] = useState('pdf')

  if (!show) return null

  const handleExportReport = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500))
      setExported(true)
      setTimeout(() => {
        setExported(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error exporting report:', error)
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
              <h5>Report Exported Successfully!</h5>
              <p className="text-muted">Your analytics report has been generated and downloaded.</p>
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
              <i className="bi bi-download me-2"></i>
              Export Analytics Report
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
              Generate and download comprehensive analytics reports in your preferred format.
            </div>
            
            <form onSubmit={handleExportReport}>
              <div className="mb-3">
                <label className="form-label">Report Type</label>
                <select 
                  className="form-select" 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="complete">Complete Analytics Report</option>
                  <option value="sales">Sales Summary</option>
                  <option value="customers">Customer Analytics</option>
                  <option value="products">Product Performance</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Date Range</label>
                <select 
                  className="form-select" 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 6 months</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Format</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="format" 
                      id="pdf" 
                      value="pdf"
                      checked={format === 'pdf'}
                      onChange={(e) => setFormat(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="pdf">PDF</label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="format" 
                      id="excel" 
                      value="excel"
                      checked={format === 'excel'}
                      onChange={(e) => setFormat(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="excel">Excel</label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="format" 
                      id="csv" 
                      value="csv"
                      checked={format === 'csv'}
                      onChange={(e) => setFormat(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="csv">CSV</label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              onClick={handleExportReport}
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
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ExportReportModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ExportReportModal