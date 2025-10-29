import { useState } from 'react'
import PropTypes from 'prop-types'

export default function CheckoutAddAddressModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    label: '',
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    city: 'Sagnay',
    barangay: '',
    province: 'Camarines Sur',
    postalCode: '4420',
    isDefault: false
  })

  const [errors, setErrors] = useState({})

  // Official PSGC Barangays of Sagnay, Camarines Sur
  const sagnayBarangays = [
    'Atulayan',
    'Bon-ot Baybay',
    'Bon-ot Bunton',
    'Lagonoy',
    'Misisirib',
    'Nato',
    'Patitinan',
    'Poblacion',
    'Sabang',
    'San Antonio',
    'San Isidro',
    'Sugcad'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.label) newErrors.label = 'Address label is required'
    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.streetAddress) newErrors.streetAddress = 'Street address is required'
    if (!formData.city) newErrors.city = 'City is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      label: '',
      fullName: '',
      phoneNumber: '',
      streetAddress: '',
      city: 'Sagnay',
      barangay: '',
      province: 'Camarines Sur',
      postalCode: '4420',
      isDefault: false
    })
    setErrors({})
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>Add Delivery Address
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Add a new delivery address for this order. This address will be saved to your account for future use.
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Address Label *</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.label ? 'is-invalid' : ''}`}
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="e.g. Home, Office, Farm"
                  />
                  {errors.label && <div className="invalid-feedback">{errors.label}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter recipient's full name"
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Phone Number *</label>
                <div className="input-group">
                  <span className="input-group-text">+63</span>
                  <input 
                    type="tel" 
                    className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="9XX XXX XXXX"
                  />
                  {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Street Address *</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.streetAddress ? 'is-invalid' : ''}`}
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="House number, street name, subdivision"
                />
                {errors.streetAddress && <div className="invalid-feedback">{errors.streetAddress}</div>}
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Barangay</label>
                  <select 
                    className="form-select"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Barangay</option>
                    {sagnayBarangays.map(barangay => (
                      <option key={barangay} value={barangay}>{barangay}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">City/Municipality *</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Province</label>
                  <input 
                    type="text" 
                    className="form-control"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Postal Code</label>
                  <input 
                    type="text" 
                    className="form-control"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  name="isDefault"
                  id="checkoutSetAsDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="checkoutSetAsDefault">
                  Set as default address
                </label>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              <i className="bi bi-x-lg me-1"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
            >
              <i className="bi bi-check-lg me-1"></i>Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

CheckoutAddAddressModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}