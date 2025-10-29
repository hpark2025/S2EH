import { useState } from 'react'
import PropTypes from 'prop-types'

export default function StockAlertModal({ show, onClose, onSave, currentSettings }) {
  const [alertSettings, setAlertSettings] = useState({
    enableAlerts: currentSettings?.enableAlerts || true,
    emailNotifications: currentSettings?.emailNotifications || true,
    smsNotifications: currentSettings?.smsNotifications || false,
    dashboardNotifications: currentSettings?.dashboardNotifications || true,
    lowStockThreshold: currentSettings?.lowStockThreshold || 10,
    criticalStockThreshold: currentSettings?.criticalStockThreshold || 5,
    expiryAlertDays: currentSettings?.expiryAlertDays || 7,
    autoReorder: currentSettings?.autoReorder || false,
    alertFrequency: currentSettings?.alertFrequency || 'daily',
    recipients: currentSettings?.recipients || ['admin@example.com']
  })

  const [newRecipient, setNewRecipient] = useState('')
  const [errors, setErrors] = useState({})

  if (!show) return null

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setAlertSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const addRecipient = () => {
    if (newRecipient && newRecipient.includes('@')) {
      setAlertSettings(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient]
      }))
      setNewRecipient('')
    }
  }

  const removeRecipient = (email) => {
    setAlertSettings(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (alertSettings.lowStockThreshold <= 0 || alertSettings.lowStockThreshold > 100) {
      newErrors.lowStockThreshold = 'Must be between 1-100%'
    }

    if (alertSettings.criticalStockThreshold <= 0 || alertSettings.criticalStockThreshold > 100) {
      newErrors.criticalStockThreshold = 'Must be between 1-100%'
    }

    if (alertSettings.criticalStockThreshold >= alertSettings.lowStockThreshold) {
      newErrors.criticalStockThreshold = 'Must be lower than low stock threshold'
    }

    if (alertSettings.expiryAlertDays <= 0) {
      newErrors.expiryAlertDays = 'Must be greater than 0'
    }

    if (alertSettings.recipients.length === 0) {
      newErrors.recipients = 'At least one email recipient is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(alertSettings)
    }
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-bell me-2"></i>
              Stock Alert Settings
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
              Configure stock alert notifications to stay informed about inventory levels and prevent stockouts.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="enableAlerts"
                    id="enableAlerts"
                    checked={alertSettings.enableAlerts}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="enableAlerts">
                    <strong>Enable Stock Alerts</strong>
                  </label>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="lowStockThreshold" className="form-label">
                    Low Stock Threshold (%)
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.lowStockThreshold ? 'is-invalid' : ''}`}
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    value={alertSettings.lowStockThreshold}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    disabled={!alertSettings.enableAlerts}
                  />
                  {errors.lowStockThreshold && <div className="invalid-feedback">{errors.lowStockThreshold}</div>}
                  <small className="form-text text-muted">Alert when stock falls below this percentage</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="criticalStockThreshold" className="form-label">
                    Critical Stock Threshold (%)
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.criticalStockThreshold ? 'is-invalid' : ''}`}
                    id="criticalStockThreshold"
                    name="criticalStockThreshold"
                    value={alertSettings.criticalStockThreshold}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    disabled={!alertSettings.enableAlerts}
                  />
                  {errors.criticalStockThreshold && <div className="invalid-feedback">{errors.criticalStockThreshold}</div>}
                  <small className="form-text text-muted">Urgent alert threshold</small>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="expiryAlertDays" className="form-label">
                    Expiry Alert (Days Before)
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.expiryAlertDays ? 'is-invalid' : ''}`}
                    id="expiryAlertDays"
                    name="expiryAlertDays"
                    value={alertSettings.expiryAlertDays}
                    onChange={handleInputChange}
                    min="1"
                    disabled={!alertSettings.enableAlerts}
                  />
                  {errors.expiryAlertDays && <div className="invalid-feedback">{errors.expiryAlertDays}</div>}
                  <small className="form-text text-muted">Alert for items expiring within this period</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="alertFrequency" className="form-label">
                    Alert Frequency
                  </label>
                  <select
                    className="form-select"
                    id="alertFrequency"
                    name="alertFrequency"
                    value={alertSettings.alertFrequency}
                    onChange={handleInputChange}
                    disabled={!alertSettings.enableAlerts}
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Notification Methods</label>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="emailNotifications"
                        id="emailNotifications"
                        checked={alertSettings.emailNotifications}
                        onChange={handleInputChange}
                        disabled={!alertSettings.enableAlerts}
                      />
                      <label className="form-check-label" htmlFor="emailNotifications">
                        <i className="bi bi-envelope me-2"></i>Email
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="smsNotifications"
                        id="smsNotifications"
                        checked={alertSettings.smsNotifications}
                        onChange={handleInputChange}
                        disabled={!alertSettings.enableAlerts}
                      />
                      <label className="form-check-label" htmlFor="smsNotifications">
                        <i className="bi bi-phone me-2"></i>SMS
                        <span className="badge bg-secondary ms-1">Pro</span>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="dashboardNotifications"
                        id="dashboardNotifications"
                        checked={alertSettings.dashboardNotifications}
                        onChange={handleInputChange}
                        disabled={!alertSettings.enableAlerts}
                      />
                      <label className="form-check-label" htmlFor="dashboardNotifications">
                        <i className="bi bi-speedometer2 me-2"></i>Dashboard
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Email Recipients
                  {errors.recipients && <span className="text-danger ms-2">{errors.recipients}</span>}
                </label>
                <div className="input-group mb-2">
                  <input
                    type="email"
                    className="form-control"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="Enter email address"
                    onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                    disabled={!alertSettings.enableAlerts || !alertSettings.emailNotifications}
                  />
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={addRecipient}
                    disabled={!alertSettings.enableAlerts || !alertSettings.emailNotifications}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                <div className="recipients-list">
                  {alertSettings.recipients.map((email, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-1 p-2 bg-light rounded">
                      <span>
                        <i className="bi bi-envelope me-2"></i>
                        {email}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeRecipient(email)}
                        disabled={!alertSettings.enableAlerts || alertSettings.recipients.length <= 1}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="autoReorder"
                    id="autoReorder"
                    checked={alertSettings.autoReorder}
                    onChange={handleInputChange}
                    disabled={!alertSettings.enableAlerts}
                  />
                  <label className="form-check-label" htmlFor="autoReorder">
                    Enable Auto-Reorder
                  </label>
                </div>
                <small className="form-text text-muted">
                  Automatically create purchase orders when stock is critically low
                </small>
              </div>

              {/* Alert Preview */}
              <div className="bg-light p-3 rounded">
                <h6 className="mb-2">
                  <i className="bi bi-eye me-2"></i>Alert Preview
                </h6>
                <div className="row text-center">
                  <div className="col-md-6">
                    <div className="border border-warning p-2 rounded mb-2">
                      <i className="bi bi-exclamation-triangle text-warning"></i>
                      <div><small><strong>Low Stock Alert</strong></small></div>
                      <div><small>When stock ≤ {alertSettings.lowStockThreshold}%</small></div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border border-danger p-2 rounded mb-2">
                      <i className="bi bi-exclamation-circle text-danger"></i>
                      <div><small><strong>Critical Stock Alert</strong></small></div>
                      <div><small>When stock ≤ {alertSettings.criticalStockThreshold}%</small></div>
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
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-outline-primary"
              disabled={!alertSettings.enableAlerts}
            >
              <i className="bi bi-envelope me-2"></i>Test Alert
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSave}
            >
              <i className="bi bi-check-lg me-2"></i>Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

StockAlertModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentSettings: PropTypes.shape({
    enableAlerts: PropTypes.bool,
    emailNotifications: PropTypes.bool,
    smsNotifications: PropTypes.bool,
    dashboardNotifications: PropTypes.bool,
    lowStockThreshold: PropTypes.number,
    criticalStockThreshold: PropTypes.number,
    expiryAlertDays: PropTypes.number,
    autoReorder: PropTypes.bool,
    alertFrequency: PropTypes.string,
    recipients: PropTypes.arrayOf(PropTypes.string)
  })
}