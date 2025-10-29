import { useState } from 'react'
import PropTypes from 'prop-types'

export default function MessageCustomerModal({ show, onClose, customer }) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    requestReadReceipt: false,
    saveAsTemplate: false,
    templateName: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  if (!show || !customer) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Sending message to:', customer.email)
      console.log('Message data:', formData)
      
      setIsSent(true)
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        setIsSent(false)
        setFormData({
          subject: '',
          message: '',
          priority: 'normal',
          requestReadReceipt: false,
          saveAsTemplate: false,
          templateName: ''
        })
      }, 2000)
      
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      normal: 'primary',
      high: 'warning',
      urgent: 'danger'
    }
    return colors[priority] || 'primary'
  }

  if (isSent) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Message Sent Successfully!</h5>
              <p className="text-muted">Your message has been sent to {customer.name}.</p>
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
              <i className="bi bi-envelope me-2"></i>
              Send Message
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Sending a message to <strong>{customer.name}</strong> ({customer.email}). The message will be delivered via email.
            </div>

            <form onSubmit={handleSubmit}>
              {/* Customer Info Summary */}
              <div className="bg-light p-3 rounded mb-3">
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">Customer:</small>
                    <div className="fw-bold">{customer.name}</div>
                    <div className="small text-muted">{customer.email}</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Orders:</small>
                    <div>{customer.totalOrders || 0} orders</div>
                    <div className="small text-muted">Total: {formatCurrency(customer.totalSpent || 0)}</div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-8 mb-3">
                  <label htmlFor="subject" className="form-label">
                    Subject <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter message subject"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="priority" className="form-label">Priority</label>
                  <select
                    className="form-select"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="message" className="form-label">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  rows="8"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  required
                  maxLength={2000}
                />
                <div className="form-text text-end">
                  {formData.message.length}/2000 characters
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="requestReadReceipt"
                      name="requestReadReceipt"
                      checked={formData.requestReadReceipt}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="requestReadReceipt">
                      Request read receipt
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="saveAsTemplate"
                      name="saveAsTemplate"
                      checked={formData.saveAsTemplate}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="saveAsTemplate">
                      Save as template
                    </label>
                  </div>
                </div>
              </div>

              {formData.saveAsTemplate && (
                <div className="mb-3">
                  <label htmlFor="templateName" className="form-label">
                    Template Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="templateName"
                    name="templateName"
                    value={formData.templateName}
                    onChange={handleChange}
                    placeholder="Enter template name"
                    required={formData.saveAsTemplate}
                    maxLength={50}
                  />
                </div>
              )}

              {/* Message Preview */}
              <div className="bg-light p-3 rounded">
                <h6 className="mb-2">
                  <i className="bi bi-eye me-2"></i>Message Preview
                </h6>
                <div className="border bg-white p-3 rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <div>
                      <strong>To:</strong> {customer.name} &lt;{customer.email}&gt;
                    </div>
                    <span className={`badge bg-${getPriorityColor(formData.priority)}`}>
                      {formData.priority}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Subject:</strong> {formData.subject || 'No subject'}
                  </div>
                  <div className="border-top pt-2">
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {formData.message || 'No message content'}
                    </div>
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
              disabled={isLoading}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="button"
              className="btn btn-outline-primary"
              disabled={isLoading || !formData.subject || !formData.message}
            >
              <i className="bi bi-file-earmark me-2"></i>Save Draft
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading || !formData.subject || !formData.message}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

MessageCustomerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string,
    status: PropTypes.string,
    totalOrders: PropTypes.number,
    totalSpent: PropTypes.number,
    lastOrderDate: PropTypes.string,
    joinDate: PropTypes.string,
    loyaltyPoints: PropTypes.number
  })
}