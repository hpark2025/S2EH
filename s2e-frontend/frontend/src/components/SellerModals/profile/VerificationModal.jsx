import { useState } from 'react'
import PropTypes from 'prop-types'

const VerificationModal = ({ show, onClose }) => {
  const [activeStep, setActiveStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [verificationData, setVerificationData] = useState({
    identity: {
      idType: '',
      idNumber: '',
      frontImage: null,
      backImage: null,
      selfieImage: null
    },
    business: {
      businessPermit: null,
      taxCertificate: null,
      bankCertificate: null,
      additionalDocs: []
    },
    address: {
      utilityBill: null,
      bankStatement: null,
      governmentId: null
    }
  })

  const [uploadProgress, setUploadProgress] = useState({})
  const [verificationStatus, setVerificationStatus] = useState('pending') // pending, in-review, approved, rejected

  if (!show) return null

  const idTypes = [
    'Driver\'s License',
    'Passport',
    'SSS ID',
    'UMID',
    'PhilHealth ID',
    'Voter\'s ID',
    'Senior Citizen ID',
    'PWD ID'
  ]

  const handleFileUpload = (category, field, file) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPG, PNG, or PDF files')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    // Simulate upload progress
    const uploadId = `${category}-${field}`
    setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }))

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[uploadId] || 0) + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          
          // Update verification data
          setVerificationData(prevData => ({
            ...prevData,
            [category]: {
              ...prevData[category],
              [field]: file
            }
          }))

          return { ...prev, [uploadId]: 100 }
        }
        return { ...prev, [uploadId]: newProgress }
      })
    }, 200)
  }

  const handleSubmitVerification = async () => {
    // Check if all required documents are uploaded
    const { identity, business, address } = verificationData

    if (!identity.idType || !identity.idNumber || !identity.frontImage || !identity.selfieImage) {
      alert('Please complete identity verification first')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      console.log('Submitting verification:', verificationData)
      setVerificationStatus('in-review')
      
      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        onClose()
      }, 2500)
      
    } catch (error) {
      console.error('Error submitting verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const DocumentUpload = ({ label, category, field, required = false, description = '' }) => {
    const uploadId = `${category}-${field}`
    const progress = uploadProgress[uploadId]
    const file = verificationData[category][field]

    return (
      <div className="mb-3">
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        {description && <p className="text-muted small">{description}</p>}
        
        <div className="border rounded p-3">
          {!file && progress === undefined && (
            <div className="text-center">
              <i className="bi bi-cloud-upload text-muted" style={{ fontSize: '2rem' }}></i>
              <p className="text-muted mb-2">Click to upload or drag and drop</p>
              <input
                type="file"
                className="form-control"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(category, field, e.target.files[0])}
              />
            </div>
          )}

          {progress !== undefined && progress < 100 && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Uploading...</span>
                <span className="text-muted">{progress}%</span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          )}

          {file && (
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <i className="bi bi-file-earmark-check text-success me-2"></i>
                <div>
                  <div className="fw-medium">{file.name}</div>
                  <div className="text-muted small">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  setVerificationData(prev => ({
                    ...prev,
                    [category]: {
                      ...prev[category],
                      [field]: null
                    }
                  }))
                }}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-body text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>Verification Submitted Successfully!</h5>
              <p className="text-muted">Your documents have been submitted for review. We'll notify you within 2-3 business days.</p>
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
              <i className="bi bi-shield-check me-2"></i>
              Account Verification
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
              Complete the verification process to unlock all seller features. Upload clear, readable documents for faster approval.
            </div>
            
            {/* Progress Steps */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between">
                  <div className={`text-center ${activeStep >= 1 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${activeStep >= 1 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                      {activeStep > 1 ? <i className="bi bi-check"></i> : '1'}
                    </div>
                    <div className="mt-2 small">Identity</div>
                  </div>
                  <div className={`text-center ${activeStep >= 2 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${activeStep >= 2 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                      {activeStep > 2 ? <i className="bi bi-check"></i> : '2'}
                    </div>
                    <div className="mt-2 small">Business</div>
                  </div>
                  <div className={`text-center ${activeStep >= 3 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${activeStep >= 3 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                      {activeStep > 3 ? <i className="bi bi-check"></i> : '3'}
                    </div>
                    <div className="mt-2 small">Address</div>
                  </div>
                  <div className={`text-center ${activeStep >= 4 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${activeStep >= 4 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                      {activeStep > 4 ? <i className="bi bi-check"></i> : '4'}
                    </div>
                    <div className="mt-2 small">Review</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Identity Verification */}
            {activeStep === 1 && (
              <div>
                <h6 className="mb-3">Identity Verification</h6>
                <p className="text-muted mb-4">
                  Please provide a valid government-issued ID and take a selfie for identity verification.
                </p>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="idType" className="form-label">
                        ID Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="idType"
                        value={verificationData.identity.idType}
                        onChange={(e) => setVerificationData(prev => ({
                          ...prev,
                          identity: { ...prev.identity, idType: e.target.value }
                        }))}
                      >
                        <option value="">Select ID Type</option>
                        {idTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="idNumber" className="form-label">
                        ID Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="idNumber"
                        value={verificationData.identity.idNumber}
                        onChange={(e) => setVerificationData(prev => ({
                          ...prev,
                          identity: { ...prev.identity, idNumber: e.target.value }
                        }))}
                        placeholder="Enter ID number"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <DocumentUpload
                      label="ID Front Image"
                      category="identity"
                      field="frontImage"
                      required={true}
                      description="Clear photo of the front of your ID"
                    />
                  </div>
                  <div className="col-md-6">
                    <DocumentUpload
                      label="ID Back Image"
                      category="identity"
                      field="backImage"
                      description="Clear photo of the back of your ID (if applicable)"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <DocumentUpload
                      label="Selfie with ID"
                      category="identity"
                      field="selfieImage"
                      required={true}
                      description="Take a selfie holding your ID next to your face"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Documents */}
            {activeStep === 2 && (
              <div>
                <h6 className="mb-3">Business Documents</h6>
                <p className="text-muted mb-4">
                  Upload your business registration and tax documents to verify your business status.
                </p>

                <div className="row">
                  <div className="col-md-6">
                    <DocumentUpload
                      label="Business Permit"
                      category="business"
                      field="businessPermit"
                      required={true}
                      description="Valid business permit or registration certificate"
                    />
                  </div>
                  <div className="col-md-6">
                    <DocumentUpload
                      label="Tax Certificate (BIR)"
                      category="business"
                      field="taxCertificate"
                      required={true}
                      description="BIR Certificate of Registration or TIN certificate"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <DocumentUpload
                      label="Bank Certificate"
                      category="business"
                      field="bankCertificate"
                      description="Bank certificate or account verification letter"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address Verification */}
            {activeStep === 3 && (
              <div>
                <h6 className="mb-3">Address Verification</h6>
                <p className="text-muted mb-4">
                  Provide proof of address to verify your business location.
                </p>

                <div className="row">
                  <div className="col-md-6">
                    <DocumentUpload
                      label="Utility Bill"
                      category="address"
                      field="utilityBill"
                      required={true}
                      description="Recent utility bill (water, electricity, internet) within the last 3 months"
                    />
                  </div>
                  <div className="col-md-6">
                    <DocumentUpload
                      label="Bank Statement"
                      category="address"
                      field="bankStatement"
                      description="Bank statement showing your address (within the last 3 months)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {activeStep === 4 && (
              <div>
                <h6 className="mb-3">Review & Submit</h6>
                <p className="text-muted mb-4">
                  Please review all the information and documents you've provided before submitting.
                </p>

                <div className="row">
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-person-check me-2"></i>
                          Identity
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>ID Type:</strong> {verificationData.identity.idType}
                        </div>
                        <div className="mb-2">
                          <strong>ID Number:</strong> {verificationData.identity.idNumber}
                        </div>
                        <div className="mb-2">
                          <strong>Documents:</strong>
                          <ul className="list-unstyled ms-2 mb-0">
                            {verificationData.identity.frontImage && (
                              <li><i className="bi bi-check text-success"></i> Front Image</li>
                            )}
                            {verificationData.identity.backImage && (
                              <li><i className="bi bi-check text-success"></i> Back Image</li>
                            )}
                            {verificationData.identity.selfieImage && (
                              <li><i className="bi bi-check text-success"></i> Selfie</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-building me-2"></i>
                          Business
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Documents:</strong>
                          <ul className="list-unstyled ms-2 mb-0">
                            {verificationData.business.businessPermit && (
                              <li><i className="bi bi-check text-success"></i> Business Permit</li>
                            )}
                            {verificationData.business.taxCertificate && (
                              <li><i className="bi bi-check text-success"></i> Tax Certificate</li>
                            )}
                            {verificationData.business.bankCertificate && (
                              <li><i className="bi bi-check text-success"></i> Bank Certificate</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-geo-alt me-2"></i>
                          Address
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Documents:</strong>
                          <ul className="list-unstyled ms-2 mb-0">
                            {verificationData.address.utilityBill && (
                              <li><i className="bi bi-check text-success"></i> Utility Bill</li>
                            )}
                            {verificationData.address.bankStatement && (
                              <li><i className="bi bi-check text-success"></i> Bank Statement</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info mt-4">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>What happens next?</strong>
                  <ul className="mb-0 mt-2">
                    <li>Our verification team will review your documents within 2-3 business days</li>
                    <li>You'll receive an email notification once the review is complete</li>
                    <li>If additional information is needed, we'll contact you via email</li>
                    <li>Once verified, you'll have access to all seller features</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {activeStep > 1 && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setActiveStep(activeStep - 1)}
                  disabled={isLoading}
                  style={{ minWidth: '100px' }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Previous
                </button>
              )}
            </div>
            
            <div>
              {activeStep < 4 ? (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={isLoading}
                  style={{ minWidth: '100px' }}
                >
                  Next
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleSubmitVerification}
                  disabled={isLoading}
                  style={{ minWidth: '200px' }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Submit for Verification
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

VerificationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default VerificationModal