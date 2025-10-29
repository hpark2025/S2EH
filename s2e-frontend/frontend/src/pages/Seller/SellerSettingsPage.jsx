import { useState } from 'react'
import { BankAccountModal, GCashAccountModal } from '../../components/SellerModals'

function SellerSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showBankModal, setShowBankModal] = useState(false)
  const [showGCashModal, setShowGCashModal] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      storeName: 'Juan\'s Fresh Farm Products',
      storeDescription: 'Premium quality agricultural products from Sagnay, Camarines Sur',
      phoneNumber: '+63 917 123 4567',
      email: 'juan.santos@email.com'
    },
    payment: {
      acceptCOD: true,
      acceptGCash: true,
      acceptBankTransfer: true,
      minimumOrder: 100
    },
    bankAccount: {
      accountHolderName: 'Juan Dela Cruz Santos',
      bankName: 'BPI Family Savings Bank',
      accountNumber: '****1234',
      isVerified: true
    },
    gcashAccount: {
      accountHolderName: 'Juan Dela Cruz Santos',
      mobileNumber: '+63 917 123 4567',
      gcashNumber: '+63 917 123 4567',
      isVerified: true,
      isPrimary: true
    }
  })

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = (section) => {
    console.log(`Saving ${section}:`, settings[section])
    alert(`${section} settings saved successfully!`)
  }

  const tabs = [
    { key: 'general', label: 'General', icon: 'bi-gear' },
    { key: 'payment', label: 'Payment', icon: 'bi-credit-card' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">General Settings</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.general.storeName}
                    onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={settings.general.phoneNumber}
                    onChange={(e) => handleInputChange('general', 'phoneNumber', e.target.value)}
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={settings.general.email}
                    onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Store Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={settings.general.storeDescription}
                    onChange={(e) => handleInputChange('general', 'storeDescription', e.target.value)}
                  ></textarea>
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => handleSave('general')}
              >
                Save General Settings
              </button>
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Payment Settings</h5>
            </div>
            <div className="card-body">
              <h6 className="mb-3">Accepted Payment Methods</h6>
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="acceptCOD"
                      checked={settings.payment.acceptCOD}
                      onChange={(e) => handleInputChange('payment', 'acceptCOD', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="acceptCOD">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="acceptGCash"
                      checked={settings.payment.acceptGCash}
                      onChange={(e) => handleInputChange('payment', 'acceptGCash', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="acceptGCash">
                      GCash
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="acceptBankTransfer"
                      checked={settings.payment.acceptBankTransfer}
                      onChange={(e) => handleInputChange('payment', 'acceptBankTransfer', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="acceptBankTransfer">
                      Bank Transfer
                    </label>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Minimum Order Amount</label>
                  <div className="input-group">
                    <span className="input-group-text">₱</span>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.payment.minimumOrder}
                      onChange={(e) => handleInputChange('payment', 'minimumOrder', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="mb-3">Bank Account</h6>
                <div className="p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{settings.bankAccount.bankName}</div>
                      <div className="text-muted">Account: {settings.bankAccount.accountNumber}</div>
                      <div className="text-muted small">{settings.bankAccount.accountHolderName}</div>
                      <div className="mt-1">
                        <span className={`badge ${settings.bankAccount.isVerified ? 'bg-success' : 'bg-warning'}`}>
                          <i className={`bi ${settings.bankAccount.isVerified ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                          {settings.bankAccount.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowBankModal(true)}
                    >
                      Edit Bank Account
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="mb-3">GCash Account</h6>
                <div className="p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold d-flex align-items-center">
                        <i className="bi bi-phone me-2 text-primary"></i>
                        GCash Account
                        {settings.gcashAccount.isPrimary && (
                          <span className="badge bg-primary ms-2">Primary</span>
                        )}
                      </div>
                      <div className="text-muted">Number: {settings.gcashAccount.gcashNumber}</div>
                      <div className="text-muted small">{settings.gcashAccount.accountHolderName}</div>
                      <div className="mt-1">
                        <span className={`badge ${settings.gcashAccount.isVerified ? 'bg-success' : 'bg-warning'}`}>
                          <i className={`bi ${settings.gcashAccount.isVerified ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                          {settings.gcashAccount.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowGCashModal(true)}
                    >
                      Edit GCash Account
                    </button>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => handleSave('payment')}
              >
                Save Payment Settings
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="card">
            <div className="card-body text-center">
              <h5>Select a settings category</h5>
              <p className="text-muted">Choose from the navigation to configure your settings.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="container-fluid p-4">
      <div className="row">
        {/* Navigation */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-3">Settings</h6>
              <div className="nav flex-column nav-pills">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    className={`nav-link text-start ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      backgroundColor: activeTab === tab.key ? 'var(--primary-color, #2E7D32)' : 'transparent',
                      color: activeTab === tab.key ? 'white' : '#6c757d',
                      border: 'none',
                      marginBottom: '4px',
                      borderRadius: '6px',
                      padding: '12px 16px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.key) {
                        e.target.style.backgroundColor = '#f8f9fa'
                        e.target.style.color = '#2E7D32'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.key) {
                        e.target.style.backgroundColor = 'transparent'
                        e.target.style.color = '#6c757d'
                      }
                    }}
                  >
                    <i className={`${tab.icon} me-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-md-9">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      <BankAccountModal 
        show={showBankModal}
        onClose={() => setShowBankModal(false)}
        existingData={settings.bankAccount}
      />
      
      <GCashAccountModal 
        show={showGCashModal}
        onClose={() => setShowGCashModal(false)}
        existingData={settings.gcashAccount}
      />
    </div>
  )
}

export default SellerSettingsPage