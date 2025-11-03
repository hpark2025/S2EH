import { useState } from 'react'
import PropTypes from 'prop-types'

const EditProfileModal = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState('personal')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [formData, setFormData] = useState({
    personal: {
      firstName: 'Juan',
      lastName: 'Cruz',
      email: 'juan.cruz@email.com',
      phone: '+63 912 345 6789',
      address: '123 Farm Road, Sagnay, Camarines Sur'
    },
    business: {
      businessName: 'Cruz Family Farm',
      businessType: 'Farm',
      registrationNumber: 'BIR-123456789',
      taxId: 'TIN-987654321',
      businessAddress: '123 Farm Road, Sagnay, Camarines Sur'
    },
    banking: {
      bankName: 'BPI Family Savings Bank',
      accountNumber: '****1234',
      accountHolder: 'Juan Cruz',
      swiftCode: 'BOPIPHMM'
    },
    password: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  if (!show) return null

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Saving profile data:', formData)
      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSaved) {
    return (
      <div
        className="modal fade show d-block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Profile Updated Successfully!</h5>
              <p className="text-muted">Your profile information has been saved.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-gear me-2"></i>Edit Profile
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
              Update your personal information, business details, and banking information.
            </div>

            {/* Tab Grid */}
            <div className="tab-grid mb-4">
              <button
                type="button"
                className={`tab-card ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <i className="bi bi-person-fill"></i>
                <span>Personal Info</span>
              </button>
              <button
                type="button"
                className={`tab-card ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <i className="bi bi-lock-fill"></i>
                <span>Password</span>
              </button>
              <button
                type="button"
                className={`tab-card ${activeTab === 'business' ? 'active' : ''}`}
                onClick={() => setActiveTab('business')}
              >
                <i className="bi bi-briefcase-fill"></i>
                <span>Business Info</span>
              </button>
              <button
                type="button"
                className={`tab-card ${activeTab === 'banking' ? 'active' : ''}`}
                onClick={() => setActiveTab('banking')}
              >
                <i className="bi bi-bank"></i>
                <span>Banking</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'personal' && (
                <div className="tab-pane active">
                  <h6 className="mb-3">
                    <i className="bi bi-person-fill me-2"></i>Personal Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.personal.firstName}
                        onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.personal.lastName}
                        onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.personal.email}
                        onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.personal.phone}
                        onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Home Address</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.personal.address}
                        onChange={(e) => handleInputChange('personal', 'address', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'business' && (
                <div className="tab-pane active">
                  <h6 className="mb-3">
                    <i className="bi bi-briefcase-fill me-2"></i>Business Information
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Business Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.business.businessName}
                        onChange={(e) => handleInputChange('business', 'businessName', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Business Type</label>
                      <select
                        className="form-select"
                        value={formData.business.businessType}
                        onChange={(e) => handleInputChange('business', 'businessType', e.target.value)}
                      >
                        <option value="Farm">Farm</option>
                        <option value="Cooperative">Cooperative</option>
                        <option value="Small Business">Small Business</option>
                        <option value="Corporation">Corporation</option>
                        <option value="Partnership">Partnership</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Business Registration Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.business.registrationNumber}
                        onChange={(e) => handleInputChange('business', 'registrationNumber', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tax Identification Number (TIN)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.business.taxId}
                        onChange={(e) => handleInputChange('business', 'taxId', e.target.value)}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Business Address</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.business.businessAddress}
                        onChange={(e) => handleInputChange('business', 'businessAddress', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'banking' && (
                <div className="tab-pane active">
                  <h6 className="mb-3">
                    <i className="bi bi-bank2 me-2"></i>Banking Information
                  </h6>
                  <div className="alert alert-warning mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Banking information is used for payment processing. Ensure all details are accurate.
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Bank Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.banking.bankName}
                        onChange={(e) => handleInputChange('banking', 'bankName', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.banking.accountNumber}
                        onChange={(e) => handleInputChange('banking', 'accountNumber', e.target.value)}
                        placeholder="Enter full account number"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Holder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.banking.accountHolder}
                        onChange={(e) => handleInputChange('banking', 'accountHolder', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">SWIFT/BIC Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.banking.swiftCode}
                        onChange={(e) => handleInputChange('banking', 'swiftCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="tab-pane active">
                  <h6 className="mb-3">
                    <i className="bi bi-lock-fill me-2"></i>Change Password
                  </h6>
                  <div className="alert alert-info mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Choose a strong password to keep your account secure. Your password should be at least 8 characters long.
                  </div>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password.currentPassword}
                        onChange={(e) => handleInputChange('password', 'currentPassword', e.target.value)}
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password.newPassword}
                        onChange={(e) => handleInputChange('password', 'newPassword', e.target.value)}
                        placeholder="Enter new password"
                      />
                      <div className="form-text">
                        Password must be at least 8 characters long
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password.confirmPassword}
                        onChange={(e) => handleInputChange('password', 'confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                      />
                      {formData.password.newPassword && formData.password.confirmPassword && 
                       formData.password.newPassword !== formData.password.confirmPassword && (
                        <div className="form-text text-danger">
                          Passwords do not match
                        </div>
                      )}
                      {formData.password.newPassword && formData.password.confirmPassword && 
                       formData.password.newPassword === formData.password.confirmPassword && (
                        <div className="form-text text-success">
                          Passwords match
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="password-requirements mt-3">
                    <h6 className="small fw-semibold mb-2">Password Requirements:</h6>
                    <ul className="small text-muted mb-0">
                      <li>At least 8 characters long</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character (!@#$%^&*)</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
              style={{ minWidth: '100px' }}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading}
              style={{ minWidth: '150px' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .tab-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .tab-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          background-color: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          opacity: 0.6;
          font-weight: 500;
          text-align: center;
          min-height: 120px;
        }
        
        .tab-card:hover {
          background-color: #e9ecef;
          border-color: #adb5bd;
          opacity: 0.8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .tab-card.active {
          background-color: #fff;
          border-color: #0d6efd;
          border-width: 3px;
          opacity: 1;
          font-weight: 600;
          color: #0d6efd;
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(13, 110, 253, 0.15);
        }
        
        .tab-card i {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease-in-out;
        }
        
        .tab-card.active i {
          color: #0d6efd;
          transform: scale(1.1);
        }
        
        .tab-card span {
          font-size: 0.9rem;
          line-height: 1.2;
        }
        
        .tab-content {
          padding-top: 1rem;
        }
        
        @media (max-width: 576px) {
          .tab-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .tab-card {
            min-height: 80px;
            padding: 1rem;
          }
          
          .tab-card i {
            font-size: 1.25rem;
          }
          
          .tab-card span {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  )
}

EditProfileModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default EditProfileModal
