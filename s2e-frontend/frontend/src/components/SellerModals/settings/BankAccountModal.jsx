import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const BankAccountModal = ({ show, onClose, existingData = null }) => {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'savings',
    swiftCode: '',
    branchAddress: '',
    isPrimary: false
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
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'savings',
        swiftCode: '',
        branchAddress: '',
        isPrimary: false
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
    
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required'
    }
    
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required'
    } else if (formData.accountNumber.length < 8) {
      newErrors.accountNumber = 'Account number must be at least 8 digits'
    }
    
    if (!formData.routingNumber.trim()) {
      newErrors.routingNumber = 'Routing number is required'
    } else if (formData.routingNumber.length !== 9) {
      newErrors.routingNumber = 'Routing number must be 9 digits'
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
        console.log('Bank account data:', formData)
        
        // Success feedback
        alert('Bank account saved successfully!')
        onClose()
      } catch (error) {
        console.error('Error saving bank account:', error)
        alert('Error saving bank account. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-bank me-2"></i>
              {existingData ? 'Edit Bank Account' : 'Add Bank Account'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <form id="bankAccountForm" onSubmit={handleSubmit}>
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Secure Banking:</strong> Your bank information is encrypted and stored securely. We use this information only for processing payments.
              </div>

              <div className="row">
                <div className="col-md-6">
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
                      placeholder="Full name as it appears on account"
                    />
                    {errors.accountHolderName && (
                      <div className="invalid-feedback">{errors.accountHolderName}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="bankName" className="form-label">
                      Bank Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.bankName ? 'is-invalid' : ''}`}
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="e.g., Chase Bank, Bank of America"
                    />
                    {errors.bankName && (
                      <div className="invalid-feedback">{errors.bankName}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="accountNumber" className="form-label">
                      Account Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.accountNumber ? 'is-invalid' : ''}`}
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Account number"
                    />
                    {errors.accountNumber && (
                      <div className="invalid-feedback">{errors.accountNumber}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="routingNumber" className="form-label">
                      Routing Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.routingNumber ? 'is-invalid' : ''}`}
                      id="routingNumber"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleInputChange}
                      placeholder="9-digit routing number"
                      maxLength="9"
                    />
                    {errors.routingNumber && (
                      <div className="invalid-feedback">{errors.routingNumber}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="accountType" className="form-label">
                      Account Type
                    </label>
                    <select
                      className="form-select"
                      id="accountType"
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="swiftCode" className="form-label">
                      SWIFT Code
                      <small className="text-muted"> (for international transfers)</small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="swiftCode"
                      name="swiftCode"
                      value={formData.swiftCode}
                      onChange={handleInputChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="branchAddress" className="form-label">
                  Branch Address
                </label>
                <textarea
                  className="form-control"
                  id="branchAddress"
                  name="branchAddress"
                  rows="2"
                  value={formData.branchAddress}
                  onChange={handleInputChange}
                  placeholder="Branch address (optional)"
                ></textarea>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isPrimary"
                  name="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="isPrimary">
                  Set as primary account for payments
                </label>
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
              form="bankAccountForm"
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
                  {existingData ? 'Update Account' : 'Add Account'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

BankAccountModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  existingData: PropTypes.shape({
    accountHolderName: PropTypes.string,
    bankName: PropTypes.string,
    accountNumber: PropTypes.string,
    routingNumber: PropTypes.string,
    accountType: PropTypes.string,
    swiftCode: PropTypes.string,
    branchAddress: PropTypes.string,
    isPrimary: PropTypes.bool
  })
}

export default BankAccountModal