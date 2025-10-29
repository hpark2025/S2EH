import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const GCashAccountModal = ({ show, onClose, existingData = null }) => {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    mobileNumber: '',
    gcashNumber: '',
    isPrimary: false,
    isVerified: false
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form data when modal opens or existing data changes
  useEffect(() => {
    if (existingData) {
      setFormData(existingData)
    } else {
      setFormData({
        accountHolderName: '',
        mobileNumber: '',
        gcashNumber: '',
        isPrimary: false,
        isVerified: false
      })
    }
    setErrors({})
  }, [existingData, show])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required'
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^(\+63|0)?9\d{9}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid Philippine mobile number'
    }
    
    if (!formData.gcashNumber.trim()) {
      newErrors.gcashNumber = 'GCash number is required'
    } else if (!/^(\+63|0)?9\d{9}$/.test(formData.gcashNumber.replace(/\s/g, ''))) {
      newErrors.gcashNumber = 'Please enter a valid GCash number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('GCash account data:', formData)
        
        // Success feedback
        alert('GCash account saved successfully!')
        onClose()
      } catch (error) {
        console.error('Error saving GCash account:', error)
        alert('Error saving GCash account. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')
    
    // Format as +63 9XX XXX XXXX
    if (cleaned.length <= 11) {
      if (cleaned.startsWith('63')) {
        const number = cleaned.substring(2)
        if (number.length <= 10) {
          return `+63 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 10)}`
        }
      } else if (cleaned.startsWith('09')) {
        const number = cleaned.substring(1)
        if (number.length <= 10) {
          return `+63 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6, 10)}`
        }
      } else if (cleaned.startsWith('9')) {
        if (cleaned.length <= 10) {
          return `+63 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 10)}`
        }
      }
    }
    
    return value
  }

  const handlePhoneChange = (e, fieldName) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData(prev => ({
      ...prev,
      [fieldName]: formatted
    }))
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }))
    }
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-phone me-2" style={{ color: '#007bff' }}></i>
              {existingData ? 'Edit GCash Account' : 'Add GCash Account'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <form id="gcashAccountForm" onSubmit={handleSubmit}>
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>GCash Integration:</strong> Your GCash information is securely stored and used only for payment processing. Make sure your GCash account is verified and active.
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="mb-3">
                    <label htmlFor="accountHolderName" className="form-label">
                      Account Holder Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.accountHolderName ? 'is-invalid' : ''}`}
                      id="accountHolderName"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleInputChange}
                      placeholder="Full name as registered in GCash"
                    />
                    {errors.accountHolderName && (
                      <div className="invalid-feedback">{errors.accountHolderName}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="mobileNumber" className="form-label">
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.mobileNumber ? 'is-invalid' : ''}`}
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) => handlePhoneChange(e, 'mobileNumber')}
                      placeholder="+63 9XX XXX XXXX"
                    />
                    {errors.mobileNumber && (
                      <div className="invalid-feedback">{errors.mobileNumber}</div>
                    )}
                    <div className="form-text">
                      Your registered mobile number
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="gcashNumber" className="form-label">
                      GCash Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.gcashNumber ? 'is-invalid' : ''}`}
                      id="gcashNumber"
                      name="gcashNumber"
                      value={formData.gcashNumber}
                      onChange={(e) => handlePhoneChange(e, 'gcashNumber')}
                      placeholder="+63 9XX XXX XXXX"
                    />
                    {errors.gcashNumber && (
                      <div className="invalid-feedback">{errors.gcashNumber}</div>
                    )}
                    <div className="form-text">
                      Your GCash account number
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Important:</strong> Make sure your GCash account is fully verified and has sufficient daily transaction limits for business use.
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isPrimary"
                      name="isPrimary"
                      checked={formData.isPrimary}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="isPrimary">
                      Set as primary GCash account for payments
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isVerified"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="isVerified">
                      Account is fully verified
                    </label>
                  </div>
                </div>
              </div>

              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="bi bi-shield-check me-2 text-success"></i>
                    GCash Verification Tips
                  </h6>
                  <ul className="mb-0 small">
                    <li>Ensure your GCash account is fully verified with valid ID</li>
                    <li>Check that your daily transaction limit is sufficient for business needs</li>
                    <li>Keep your GCash app updated to the latest version</li>
                    <li>Enable security features like MPIN and biometric authentication</li>
                  </ul>
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
              Cancel
            </button>
            <button
              type="submit"
              form="gcashAccountForm"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className={`bi ${existingData ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}></i>
                  {existingData ? 'Update GCash Account' : 'Add GCash Account'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

GCashAccountModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    accountHolderName: PropTypes.string,
    mobileNumber: PropTypes.string,
    gcashNumber: PropTypes.string,
    isPrimary: PropTypes.bool,
    isVerified: PropTypes.bool
  })
}

export default GCashAccountModal
