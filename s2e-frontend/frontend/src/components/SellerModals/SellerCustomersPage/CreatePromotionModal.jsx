import { useState } from 'react'
import PropTypes from 'prop-types'

export default function CreatePromotionModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'discount',
    discountType: 'percentage',
    discountValue: '',
    minimumAmount: '',
    customerSegment: 'all',
    startDate: '',
    endDate: '',
    totalUsageLimit: '',
    isActive: true,
    requiresCode: false,
    promoCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCreated, setIsCreated] = useState(false)

  if (!show) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Creating promotion:', formData)
      
      setIsCreated(true)
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        setIsCreated(false)
        resetForm()
      }, 2000)
      
    } catch (error) {
      console.error('Error creating promotion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'discount',
      discountType: 'percentage',
      discountValue: '',
      minimumAmount: '',
      customerSegment: 'all',
      startDate: '',
      endDate: '',
      totalUsageLimit: '',
      isActive: true,
      requiresCode: false,
      promoCode: ''
    })
  }

  const generatePromoCode = () => {
    const codes = ['SAVE20', 'FRESH10', 'HARVEST25', 'LOCAL15', 'SPECIAL30']
    const randomCode = codes[Math.floor(Math.random() * codes.length)]
    setFormData(prev => ({ ...prev, promoCode: randomCode }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const customerSegments = [
    { id: 'all', name: 'All Customers', count: 245 },
    { id: 'active', name: 'Active Customers', count: 189 },
    { id: 'vip', name: 'VIP Customers', count: 28 },
    { id: 'new', name: 'New Customers', count: 45 },
    { id: 'inactive', name: 'Inactive Customers', count: 56 }
  ]

  if (isCreated) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Promotion Created Successfully!</h5>
              <p className="text-muted">Your promotion "{formData.name}" has been created and is now active.</p>
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
              <i className="bi bi-tag me-2"></i>
              Create Promotion
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
              Create promotional campaigns to attract customers and boost sales. Configure discount types, target audiences, and duration.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Basic Information */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Promotion Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Fresh Harvest Sale"
                  required
                  maxLength={50}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your promotion..."
                  maxLength={200}
                />
              </div>

              {/* Promotion Type */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="type" className="form-label">
                    Promotion Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="discount">Discount</option>
                    <option value="buy-one-get-one">Buy One Get One</option>
                    <option value="free-shipping">Free Shipping</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="customerSegment" className="form-label">Target Audience</label>
                  <select
                    className="form-select"
                    id="customerSegment"
                    name="customerSegment"
                    value={formData.customerSegment}
                    onChange={handleChange}
                  >
                    {customerSegments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name} ({segment.count} customers)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Discount Configuration */}
              {formData.type === 'discount' && (
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label htmlFor="discountType" className="form-label">Discount Type</label>
                    <select
                      className="form-select"
                      id="discountType"
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₱)</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="discountValue" className="form-label">
                      Discount Value <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      {formData.discountType === 'fixed' && <span className="input-group-text">₱</span>}
                      <input
                        type="number"
                        className="form-control"
                        id="discountValue"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleChange}
                        min="1"
                        max={formData.discountType === 'percentage' ? 100 : undefined}
                        required={formData.type === 'discount'}
                      />
                      {formData.discountType === 'percentage' && <span className="input-group-text">%</span>}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label htmlFor="minimumAmount" className="form-label">Minimum Purchase</label>
                    <div className="input-group">
                      <span className="input-group-text">₱</span>
                      <input
                        type="number"
                        className="form-control"
                        id="minimumAmount"
                        name="minimumAmount"
                        value={formData.minimumAmount}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Promotion Period */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="startDate" className="form-label">
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="endDate" className="form-label">
                    End Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="totalUsageLimit" className="form-label">Usage Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    id="totalUsageLimit"
                    name="totalUsageLimit"
                    value={formData.totalUsageLimit}
                    onChange={handleChange}
                    min="1"
                    placeholder="Unlimited"
                  />
                  <small className="form-text text-muted">Leave empty for unlimited usage</small>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Activate immediately
                    </label>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="requiresCode"
                    name="requiresCode"
                    checked={formData.requiresCode}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="requiresCode">
                    Require promo code
                  </label>
                </div>
                
                {formData.requiresCode && (
                  <div className="mt-2">
                    <label htmlFor="promoCode" className="form-label">Promo Code</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        id="promoCode"
                        name="promoCode"
                        value={formData.promoCode}
                        onChange={handleChange}
                        placeholder="PROMO20"
                        style={{ textTransform: 'uppercase' }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={generatePromoCode}
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Promotion Preview */}
              <div className="bg-light p-3 rounded">
                <h6 className="fw-bold mb-2">
                  <i className="bi bi-eye me-2"></i>Promotion Preview
                </h6>
                <div className="border bg-white p-3 rounded">
                  <div className="fw-bold text-primary">{formData.name || 'Promotion Name'}</div>
                  <div className="text-muted small mb-2">{formData.description || 'No description'}</div>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Offer:</strong> {
                        formData.type === 'discount' && formData.discountValue
                          ? `${formData.discountValue}${formData.discountType === 'percentage' ? '%' : '₱'} off`
                          : formData.type === 'free-shipping'
                          ? 'Free shipping'
                          : 'Buy one get one'
                      }
                    </div>
                    <div className="col-md-6">
                      <strong>Target:</strong> {customerSegments.find(s => s.id === formData.customerSegment)?.name}
                    </div>
                  </div>
                  {formData.minimumAmount && (
                    <div className="small text-muted mt-1">
                      Minimum purchase: {formatCurrency(parseFloat(formData.minimumAmount))}
                    </div>
                  )}
                  {formData.requiresCode && formData.promoCode && (
                    <div className="small text-success mt-1">
                      Use code: <strong>{formData.promoCode}</strong>
                    </div>
                  )}
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
              onClick={resetForm}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Reset
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading || !formData.name || !formData.startDate || !formData.endDate}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-plus me-2"></i>Create Promotion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

CreatePromotionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}