import { useState } from 'react'
import PropTypes from 'prop-types'

export default function QuickTemplatesModal({ show, onClose, onSelectTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('greetings')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!show) return null

  const templates = {
    greetings: [
      "Hello! Thank you for contacting us. How can I help you today?",
      "Hi there! Welcome to our store. What can I assist you with?",
      "Good day! Thank you for your interest in our products.",
      "Hello! We're here to help. What would you like to know?"
    ],
    orders: [
      "Your order has been received and is being processed.",
      "Your order is ready for pickup/delivery.",
      "We've updated your order status. Please check your account.",
      "Thank you for your order! We'll notify you when it's ready.",
      "Your order has been shipped and is on its way."
    ],
    products: [
      "All our products are fresh and locally sourced.",
      "We have new products available. Would you like to see them?",
      "This product is currently available and in stock.",
      "We offer bulk discounts for large orders.",
      "Our products are organic and pesticide-free."
    ],
    support: [
      "I understand your concern. Let me help you with that.",
      "Thank you for bringing this to our attention.",
      "We apologize for any inconvenience. How can we make this right?",
      "Let me check on that for you right away.",
      "We appreciate your patience while we resolve this."
    ],
    closing: [
      "Thank you for choosing our store! Have a great day!",
      "Is there anything else I can help you with?",
      "Feel free to contact us if you have any other questions.",
      "We appreciate your business and look forward to serving you again.",
      "Thank you for your time. Have a wonderful day!"
    ]
  }

  const categories = [
    { id: 'greetings', name: 'Greetings', icon: 'bi-hand-wave' },
    { id: 'orders', name: 'Orders', icon: 'bi-cart-check' },
    { id: 'products', name: 'Products', icon: 'bi-box-seam' },
    { id: 'support', name: 'Support', icon: 'bi-life-preserver' },
    { id: 'closing', name: 'Closing', icon: 'bi-hand-thumbs-up' }
  ]

  const handleTemplateSelect = async (template) => {
    setIsLoading(true)
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setIsSuccess(true)
      onSelectTemplate(template)
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        setIsSuccess(false)
        setIsLoading(false)
      }, 1000)
      
    } catch (error) {
      console.error('Error selecting template:', error)
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Template Selected!</h5>
              <p className="text-muted">The template has been applied to your message.</p>
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
              <i className="bi bi-lightning me-2"></i>
              Quick Templates
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
              disabled={isLoading}
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Choose from pre-written message templates to respond faster to common customer inquiries.
            </div>

            {/* Category Selection */}
            <div className="mb-3">
              <label htmlFor="categorySelect" className="form-label text-muted">Template Category</label>
              <select
                id="categorySelect"
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Template List */}
            <div className="mb-3">
              <label className="form-label text-muted">
                <i className={`${categories.find(c => c.id === selectedCategory)?.icon} me-1`}></i>
                {categories.find(c => c.id === selectedCategory)?.name} Templates
              </label>
              
              <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {templates[selectedCategory]?.map((template, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-start p-2 mb-2 rounded border-bottom cursor-pointer"
                    role="button"
                    onClick={() => !isLoading && handleTemplateSelect(template)}
                    onMouseEnter={(e) => {
                      if (!isLoading) e.currentTarget.style.backgroundColor = '#f8f9fa'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    style={{
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s ease',
                      opacity: isLoading ? 0.6 : 1
                    }}
                  >
                    <i className="bi bi-chat-quote text-muted me-2 mt-1 flex-shrink-0"></i>
                    <div className="flex-grow-1">
                      <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                        {template}
                      </p>
                    </div>
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm text-primary ms-2 flex-shrink-0" role="status"></span>
                    ) : (
                      <i className="bi bi-plus-circle text-success ms-2 flex-shrink-0"></i>
                    )}
                  </div>
                ))}
              </div>

              {templates[selectedCategory]?.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2 mb-0">No templates available for this category</p>
                </div>
              )}
            </div>

            {/* Custom Message Option */}
            <div className="mb-3">
              <label className="form-label text-muted">
                <i className="bi bi-pencil-square me-2"></i>
                Custom Message
              </label>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  onSelectTemplate('')
                  onClose()
                }}
                disabled={isLoading}
              >
                <i className="bi bi-plus me-2"></i>
                Start with blank message
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <small className="text-muted ms-auto">
              {isLoading ? 'Applying template...' : 'Click on a template to use it'}
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

QuickTemplatesModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectTemplate: PropTypes.func.isRequired
}