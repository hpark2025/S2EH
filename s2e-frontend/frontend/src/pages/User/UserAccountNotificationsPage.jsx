import { useState } from 'react'
import { useAppState } from '../../context/AppContext.jsx'

export default function UserAccountNotificationsPage() {
  const { state } = useAppState()
  const { isLoggedIn } = state

  // Notification settings state
  const [notifications, setNotifications] = useState({
    smsOrders: true,
    smsDelivery: true
  })

  // Handle notification toggle
  const handleNotificationToggle = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Save notification settings
  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    alert('Notification settings saved successfully!')
  }

  if (!isLoggedIn) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <h3>Please log in to access your notification settings</h3>
          <p className="text-muted">You need to be logged in to manage your notification preferences.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="col-lg-9 col-md-8">
          {/* Notifications Header */}
          <div className="notifications-header bg-white border rounded p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">Notification Settings</h2>
                <p className="text-muted mb-0">Manage how you receive notifications</p>
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="notification-settings bg-white border rounded p-4 mb-4">
            <h5 className="mb-4">SMS Notifications</h5>

            <div className="notification-item d-flex justify-content-between align-items-center py-3 border-bottom">
              <div>
                <h6 className="mb-1">Order Confirmations</h6>
                <p className="text-muted mb-0 small">SMS confirmation when orders are placed</p>
              </div>
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="smsOrders" 
                  checked={notifications.smsOrders}
                  onChange={() => handleNotificationToggle('smsOrders')}
                />
              </div>
            </div>

            <div className="notification-item d-flex justify-content-between align-items-center py-3">
              <div>
                <h6 className="mb-1">Delivery Updates</h6>
                <p className="text-muted mb-0 small">SMS updates about delivery status</p>
              </div>
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="smsDelivery" 
                  checked={notifications.smsDelivery}
                  onChange={() => handleNotificationToggle('smsDelivery')}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="d-flex justify-content-end">
            <button 
              className="btn btn-primary"
              onClick={handleSaveSettings}
            >
              Save Notification Settings
            </button>
          </div>
    </div>
  )
}
