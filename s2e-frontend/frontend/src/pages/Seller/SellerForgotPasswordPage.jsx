import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import SellerAuthLayout from '../../layout/SellerAuthLayout.jsx'

export default function SellerForgotPasswordPage() {
  const [credentials, setCredentials] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate processing time
    setTimeout(() => {
      setIsSubmitted(true)
      setIsLoading(false)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <SellerAuthLayout title="Password Recovery Request Submitted">
        <div className="seller-forgot-success">
          <div className="text-center mb-4">
            <div className="success-icon mb-3">
              <i className="bi bi-check-circle-fill text-success"></i>
            </div>
            <h3 className="seller-success-title">Request Submitted Successfully</h3>
            <p className="seller-success-subtitle">
              Your password recovery request has been sent to our admin team
            </p>
          </div>

          <div className="seller-request-info">
            <div className="info-card">
              <h5><i className="bi bi-clock me-2 text-info"></i>What happens next?</h5>
              <ul className="info-list">
                <li>Our admin team will verify your seller account details</li>
                <li>You'll receive a secure password reset link within 24 hours</li>
                <li>Check your email and phone for recovery instructions</li>
                <li>Contact support if you don't receive a response</li>
              </ul>
            </div>

            <div className="contact-card">
              <h5><i className="bi bi-headset me-2 text-primary"></i>Need immediate help?</h5>
              <div className="contact-options">
                <div className="contact-item">
                  <i className="bi bi-envelope"></i>
                  <span>Email: seller-support@s2eh.com</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-telephone"></i>
                  <span>Phone: +63 (054) 123-4567</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-chat-dots"></i>
                  <span>Live Chat: Available 8AM - 6PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <NavLink to="/seller/login" className="btn btn-seller-login">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Login
            </NavLink>
          </div>
        </div>
      </SellerAuthLayout>
    )
  }

  return (
    <SellerAuthLayout title="Seller Password Recovery">
      <form className="seller-forgot-form auth-form" onSubmit={handleSubmit}>
        <div className="seller-forgot-header mb-4">
          <h3 className="seller-forgot-title">Reset Your Password</h3>
          <p className="seller-forgot-subtitle">
            Admin verification required for seller account recovery
          </p>
        </div>

        <div className="seller-forgot-notice mb-4">
          <div className="alert alert-info border-0 rounded-3">
            <div className="d-flex align-items-start">
              <i className="bi bi-info-circle me-2 mt-1"></i>
              <div>
                <strong>Security Notice:</strong> For security reasons, seller password resets 
                require admin verification. Please provide your account details below and our 
                admin team will assist you within 24 hours.
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="forgot-credentials" className="form-label">
            <i className="bi bi-person me-2"></i>
            Your Email or Phone Number
          </label>
          <input 
            type="text" 
            className="form-control seller-input" 
            id="forgot-credentials" 
            name="credentials" 
            placeholder="Enter your registered email or phone number" 
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            required 
          />
          <div className="form-text">
            <small className="text-muted">
              Enter the email or phone number associated with your seller account
            </small>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="business-name" className="form-label">
            <i className="bi bi-shop me-2"></i>
            Business/Store Name
          </label>
          <input 
            type="text" 
            className="form-control seller-input" 
            id="business-name" 
            name="businessName" 
            placeholder="Enter your registered business name" 
            required 
          />
          <div className="form-text">
            <small className="text-muted">
              This helps us verify your identity faster
            </small>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="additional-info" className="form-label">
            <i className="bi bi-chat-left-text me-2"></i>
            Additional Information (Optional)
          </label>
          <textarea 
            className="form-control seller-input" 
            id="additional-info" 
            name="additionalInfo" 
            rows="3"
            placeholder="Any additional information that can help verify your account..."
          ></textarea>
        </div>

        <div className="seller-recovery-process mb-4">
          <h6 className="process-title">
            <i className="bi bi-list-check me-2"></i>
            Recovery Process:
          </h6>
          <div className="process-steps">
            <div className="process-step">
              <span className="step-number">1</span>
              <span className="step-text">Submit this form with your details</span>
            </div>
            <div className="process-step">
              <span className="step-number">2</span>
              <span className="step-text">Admin team verifies your account</span>
            </div>
            <div className="process-step">
              <span className="step-number">3</span>
              <span className="step-text">Receive password reset instructions</span>
            </div>
            <div className="process-step">
              <span className="step-number">4</span>
              <span className="step-text">Set your new password securely</span>
            </div>
          </div>
        </div>

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-seller-login" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting Request...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                Submit Recovery Request
              </>
            )}
          </button>
        </div>

        <div className="text-center">
          <NavLink to="/seller/login" className="seller-link">
            <i className="bi bi-arrow-left me-1"></i>
            Back to Login
          </NavLink>
        </div>
      </form>
    </SellerAuthLayout>
  )
}