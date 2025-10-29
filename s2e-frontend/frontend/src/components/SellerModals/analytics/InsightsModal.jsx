import { useState } from 'react'
import PropTypes from 'prop-types'

const InsightsModal = ({ show, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!show) return null

  const handleSaveInsights = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('Error saving insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const insights = [
    {
      type: 'success',
      icon: 'bi-trending-up',
      title: 'Sales Growth',
      description: 'Your rice products have shown consistent growth over the past 3 months.',
      recommendation: 'Consider expanding your rice product line to capitalize on this trend.'
    },
    {
      type: 'info',
      icon: 'bi-people',
      title: 'Customer Behavior',
      description: 'Most customers prefer to order vegetables and rice together in combo packages.',
      recommendation: 'Create bundled offers to increase average order value.'
    },
    {
      type: 'warning',
      icon: 'bi-clock',
      title: 'Seasonal Trends',
      description: 'Fish sales typically increase during holiday seasons.',
      recommendation: 'Prepare inventory and promotional campaigns ahead of upcoming holidays.'
    },
    {
      type: 'primary',
      icon: 'bi-geo-alt',
      title: 'Geographic Analysis',
      description: 'Most of your customers are from nearby municipalities.',
      recommendation: 'Consider expanding delivery routes to reach more areas.'
    }
  ]

  const getIconClass = (type) => {
    return {
      success: 'bg-success',
      info: 'bg-info',
      warning: 'bg-warning',
      primary: 'bg-primary'
    }[type]
  }

  if (saved) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Insights Saved Successfully!</h5>
              <p className="text-muted">Your business insights have been saved to your dashboard.</p>
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
              <i className="bi bi-lightbulb me-2"></i>
              Business Insights & Recommendations
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
              Review AI-generated business insights based on your sales data and market trends.
            </div>
            
            <div className="insights-list">
              {insights.map((insight, index) => (
                <div key={index} className="insight-item mb-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className={`insight-icon ${getIconClass(insight.type)}`}>
                      <i className={insight.icon}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="insight-title mb-2">{insight.title}</h6>
                      <p className="insight-description mb-2">{insight.description}</p>
                      <div className="insight-recommendation">
                        <strong>Recommendation:</strong> {insight.recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              onClick={handleSaveInsights}
              disabled={loading || saved}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-bookmark me-2"></i>
                  Save Insights
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .insight-item {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .insight-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        
        .insight-title {
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }
        
        .insight-description {
          margin-bottom: 0.75rem;
          color: #666;
          line-height: 1.5;
        }
        
        .insight-recommendation {
          padding: 0.75rem;
          background: white;
          border-radius: 6px;
          border-left: 4px solid #2e7d32;
          font-size: 0.9rem;
          color: #555;
        }
      `}</style>
    </div>
  )
}

InsightsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default InsightsModal