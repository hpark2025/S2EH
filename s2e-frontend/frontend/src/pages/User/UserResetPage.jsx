import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import UserAuthBasicLayout from '../../layout/UserAuthBasicLayout.jsx'

export default function UserResetPage() {
  const navigate = useNavigate()

  // Redirect to home if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (isLoggedIn) {
      navigate('/home')
    }
  }, [])
  return (
    <UserAuthBasicLayout title="Reset Password">
      <form className="login-form auth-form" id="resetForm" noValidate>
        <h3>Reset Your Password</h3>

        <div className="reset-steps">
          <div className="reset-step active" id="step1">
            <p className="text-muted mb-4">Enter your phone number and we&apos;ll send you a verification code to reset your password.</p>

            <div className="mb-3">
              <label htmlFor="reset-phone" className="form-label">
                Phone Number
              </label>
              <div className="input-group">
                <span className="input-group-text">+63</span>
                <input type="tel" className="form-control" id="reset-phone" name="phone" placeholder="9XX XXX XXXX" required pattern="^9[0-9]{9}$" />
                <div className="invalid-feedback">Please enter a valid phone number starting with 9 (11 digits).</div>
              </div>
            </div>

            <div className="d-grid mb-3">
              <button type="button" className="btn btn-login" id="sendCodeBtn">
                SEND VERIFICATION CODE
              </button>
            </div>
          </div>

          <div className="reset-step" id="step2" style={{ display: 'none' }}>
            <p className="text-muted mb-4">Enter the verification code sent to your phone.</p>

            <div className="mb-3">
              <label htmlFor="verification-code" className="form-label">
                Verification Code
              </label>
              <input type="text" className="form-control" id="verification-code" name="code" placeholder="Enter 6-digit code" required pattern="[0-9]{6}" />
              <div className="invalid-feedback">Please enter the 6-digit verification code.</div>
            </div>

            <div className="d-grid mb-3">
              <button type="button" className="btn btn-login" id="verifyCodeBtn">
                VERIFY CODE
              </button>
            </div>

            <div className="text-center mb-3">
              <a href="#" className="highlight-link" id="resendCodeBtn">
                Resend code
              </a>
            </div>
          </div>

          <div className="reset-step" id="step3" style={{ display: 'none' }}>
            <p className="text-muted mb-4">Create a new password for your account.</p>

            <div className="mb-3">
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
              <input type="password" className="form-control" id="new-password" name="new-password" placeholder="Enter new password" required minLength="8" />
              <div className="invalid-feedback">Password must be at least 8 characters.</div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirm-new-password" className="form-label">
                Confirm New Password
              </label>
              <input type="password" className="form-control" id="confirm-new-password" name="confirm-new-password" placeholder="Confirm new password" required />
              <div className="invalid-feedback">Passwords do not match.</div>
            </div>

            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-login">
                RESET PASSWORD
              </button>
            </div>
          </div>
        </div>

        <hr />

        <div className="text-center mt-4">
          <p className="mb-0">
            Remember your password? <NavLink to="/login" className="highlight-link">Back to Login</NavLink>
          </p>
        </div>
      </form>
    </UserAuthBasicLayout>
  )
}
