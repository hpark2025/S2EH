import { useState } from 'react'
import { useAppState } from '../../context/AppContext.jsx'

export default function UserAccountSecurityPage() {
  const { state } = useAppState()
  const { isLoggedIn } = state

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Form validation state
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 4) {
      newErrors.newPassword = 'Password must be at least 4 characters long'
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission (frontend only, no backend)
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      // Simulate success delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      alert('Password updated successfully! (Frontend simulation)')
    } catch (error) {
      console.error('Simulated password change error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ minHeight: '50vh' }}
      >
        <div className="text-center">
          <h3>Please log in to access your security settings</h3>
          <p className="text-muted">
            You need to be logged in to manage your account security.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="col-lg-9 col-md-8">
      {/* Security Header */}
      <div className="security-header bg-white border rounded p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">Security Settings</h2>
            <p className="text-muted mb-0">
              Manage your account security and login settings
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="security-section bg-white border rounded p-4 mb-4">
        <h5 className="mb-4">Change Password</h5>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-12 mb-3">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                className={`form-control ${
                  errors.currentPassword ? 'is-invalid' : ''
                }`}
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {errors.currentPassword && (
                <div className="invalid-feedback">
                  {errors.currentPassword}
                </div>
              )}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                className={`form-control ${
                  errors.newPassword ? 'is-invalid' : ''
                }`}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handleInputChange}
                disabled={isSubmitting}
                minLength="4"
              />
              {errors.newPassword && (
                <div className="invalid-feedback">
                  {errors.newPassword}
                </div>
              )}
              <small className="form-text text-muted">
                Password must be at least 4 characters long
              </small>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className={`form-control ${
                  errors.confirmPassword ? 'is-invalid' : ''
                }`}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
