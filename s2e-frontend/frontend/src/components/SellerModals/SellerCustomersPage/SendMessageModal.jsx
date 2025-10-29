import { useState } from 'react'
import PropTypes from 'prop-types'

export default function SendMessageModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    recipientType: 'all',
    subject: '',
    message: '',
    priority: 'normal',
    sendImmediately: true,
    scheduleDate: '',
    scheduleTime: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  if (!show) return null

  const customerSegments = [
    { id: 'all', name: 'All Customers', count: 245, description: 'All registered customers' },
    { id: 'active', name: 'Active Customers', count: 189, description: 'Customers with orders in last 30 days' },
    { id: 'vip', name: 'VIP Customers', count: 28, description: 'High-value customers' },
    { id: 'new', name: 'New Customers', count: 45, description: 'Registered in last 7 days' },
    { id: 'inactive', name: 'Inactive Customers', count: 56, description: 'No orders in last 90 days' }
  ]

  const messageTemplates = [
    {
      name: 'Welcome New Customers',
      subject: 'Welcome to Our Store!',
      message: 'Thank you for joining us! Enjoy 10% off your first order with code WELCOME10.'
    },
    {
      name: 'Special Promotion',
      subject: 'Special Offer Just for You!',
      message: 'Don\'t miss out on our limited-time offer! Get 20% off selected items.'
    },
    {
      name: 'Feedback Request',
      subject: 'How Was Your Experience?',
      message: 'We\'d love to hear about your recent purchase. Your feedback helps us serve you better!'
    }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleTemplateSelect = (template) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      message: template.message
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Sending bulk message:', formData)
      
      setIsSent(true)
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        setIsSent(false)
        setFormData({
          recipientType: 'all',
          subject: '',
          message: '',
          priority: 'normal',
          sendImmediately: true,
          scheduleDate: '',
          scheduleTime: ''
        })
      }, 2000)
      
    } catch (error) {
      console.error('Error sending bulk message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRecipientCount = () => {
    const segment = customerSegments.find(s => s.id === formData.recipientType)
    return segment ? segment.count : 0
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
              <h5>Bulk Message Sent Successfully!</h5>
              <p className="text-muted">Your message has been sent to {getRecipientCount()} customers.</p>
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
              <i className="bi bi-send me-2"></i>
              Send Bulk Message
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
              Send messages to multiple customers at once. Select your target audience and compose your message below.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="mb-3">
                <label htmlFor="recipientType" className="form-label">
                  Recipients <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="recipientType"
                  name="recipientType"
                  value={formData.recipientType}
                  onChange={handleChange}
                >
                  {customerSegments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name} ({segment.count} customers)
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  {customerSegments.find(s => s.id === formData.recipientType)?.description}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Message Templates</label>
                <div className="row">
                  {messageTemplates.map((template, index) => (
                    <div key={index} className="col-md-4 mb-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm w-100 text-start"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="fw-bold small">{template.name}</div>
                        <div className="small text-muted">{template.subject}</div>
                      </button>
                    </div>
                  ))}
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
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  required
                  maxLength={1500}
                />
                <div className="form-text text-end">
                  {formData.message.length}/1500 characters
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="sendImmediately"
                      name="sendImmediately"
                      checked={formData.sendImmediately}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="sendImmediately">
                      Send immediately
                    </label>
                  </div>
                </div>
              </div>

              {!formData.sendImmediately && (
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="scheduleDate" className="form-label">Schedule Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="scheduleDate"
                      name="scheduleDate"
                      value={formData.scheduleDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="scheduleTime" className="form-label">Schedule Time</label>
                    <input
                      type="time"
                      className="form-control"
                      id="scheduleTime"
                      name="scheduleTime"
                      value={formData.scheduleTime}
                      onChange={handleChange}
                    />
                  </div>
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
                      <strong>To:</strong> {getRecipientCount()} customers
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
                  <i className="bi bi-send me-2"></i>Send to {getRecipientCount()} Customers
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

SendMessageModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}