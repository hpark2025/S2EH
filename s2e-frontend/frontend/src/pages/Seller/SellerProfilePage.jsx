import { useState, useEffect } from 'react'
import {
  AvatarChangeModal,
  EditProfileModal,
  VerificationModal
} from '../../components/SellerModals'
import { sellerAPI } from '../../services/sellerAPI'

const SellerProfilePage = () => {
  // Modal state management
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Profile data
  const [profileData, setProfileData] = useState(null)

  // Load seller profile
  useEffect(() => {
    loadSellerProfile()
  }, [])

  const loadSellerProfile = async () => {
    try {
      setLoading(true)
      const response = await sellerAPI.getProfile()
      console.log('📊 Seller profile:', response)
      
      const seller = response.data
      
      // Format the data
      setProfileData({
        personal: {
          fullName: seller.owner_name,
          email: seller.email,
          phone: seller.phone,
          businessName: seller.business_name
        },
        business: {
          businessName: seller.business_name,
          businessType: seller.business_type,
          businessPermit: seller.business_permit,
          description: seller.business_description || 'No description provided',
          taxId: seller.tax_id || 'N/A'
        },
        stats: {
          products: 0,
          orders: 0,
          customers: 0,
          revenue: '₱0'
        },
        verification: {
          identity: seller.verification_status === 'verified',
          email: seller.verification_status === 'verified',
          phone: seller.verification_status === 'verified',
          business: seller.is_lgu_verified === 1,
          isFullyVerified: seller.verification_status === 'verified' && seller.is_lgu_verified === 1
        }
      })
    } catch (error) {
      console.error('❌ Failed to load seller profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="seller-content p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="seller-content p-4">
        <div className="alert alert-danger">Failed to load profile data</div>
      </div>
    )
  }

  const getVerificationIcon = (isVerified) => {
    return isVerified ? (
      <i className="bi bi-check-circle-fill text-success"></i>
    ) : (
      <i className="bi bi-x-circle text-danger"></i>
    )
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const names = name.trim().split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <div className="seller-content p-4">
      {/* Profile Header */}
      <div className="seller-card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-auto">
              <div className="profile-avatar-container">
                <div className="profile-avatar-large">{getInitials(profileData.personal.fullName)}</div>
                <button
                  className="avatar-edit-btn"
                  onClick={() => setShowAvatarModal(true)}
                  title="Change Avatar"
                >
                  <i className="bi bi-camera"></i>
                </button>
              </div>
            </div>
            <div className="col-md">
              <h3 className="mb-1">{profileData.personal.fullName}</h3>
              <p className="text-muted mb-2">
                {profileData.business.businessType} Seller
              </p>
              <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <div className="d-flex align-items-center">
                  <i className="bi bi-envelope text-muted me-1"></i>
                  <span className="text-muted">{profileData.personal.email}</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-phone text-muted me-1"></i>
                  <span className="text-muted">{profileData.personal.phone}</span>
                </div>
                {profileData.verification.isFullyVerified && (
                  <div className="d-flex align-items-center">
                    <i className="bi bi-patch-check-fill text-success me-1"></i>
                    <span className="text-success fw-semibold">Verified Seller</span>
                  </div>
                )}
              </div>
              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-value">{profileData.stats.products}</div>
                  <div className="stat-label">Products</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{profileData.stats.orders}</div>
                  <div className="stat-label">Orders</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {profileData.stats.customers}
                  </div>
                  <div className="stat-label">Customers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{profileData.stats.revenue}</div>
                  <div className="stat-label">Revenue</div>
                </div>
              </div>
            </div>
            <div className="col-md-auto">
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn-seller"
                  onClick={() => setShowEditProfileModal(true)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit Profile
                </button>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => setShowVerificationModal(true)}
                >
                  <i className="bi bi-shield-check me-1"></i>
                  Verification Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Column */}
        <div className="col-md-8">
          {/* Personal Information */}
          <div className="seller-card mb-4">
            <div className="card-header">
              <h5 className="card-title">Personal Information</h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowEditProfileModal(true)}
              >
                <i className="bi bi-pencil me-1"></i>
                Edit
              </button>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(profileData.personal).map(([key, value]) => (
                  <div
                    className={`col-md-${
                      key === 'address' ? '12' : '6'
                    }`}
                    key={key}
                  >
                    <div className="info-group">
                      <label className="info-label">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      <div className="info-value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="seller-card mb-4">
            <div className="card-header">
              <h5 className="card-title">Business Information</h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowEditProfileModal(true)}
              >
                <i className="bi bi-pencil me-1"></i>
                Edit
              </button>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(profileData.business).map(([key, value]) => (
                  <div
                    className={`col-md-${
                      key === 'description' ? '12' : '6'
                    }`}
                    key={key}
                  >
                    <div className="info-group">
                      <label className="info-label">
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      <div className="info-value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-4">
          {/* Verification Status */}
          <div className="seller-card mb-4">
            <div className="card-header">
              <h5 className="card-title">Verification Status</h5>
            </div>
            <div className="card-body">
              <div className="verification-items">
                {Object.entries(profileData.verification)
                  .filter(([key]) => key !== 'isFullyVerified')
                  .map(([key, value]) => (
                    <div className="verification-item completed" key={key}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          {getVerificationIcon(value)}
                          <span className="ms-2">
                            {key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                        </div>
                        <span className="badge bg-success">Verified</span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-3">
                <div className="badge bg-success p-2 w-100 verification-status-badge">
                  <i className="bi bi-shield-check me-1"></i>
                  Fully Verified Seller
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline CSS */}
      <style>{`
        .profile-avatar-container {
          position: relative;
          display: inline-block;
        }
        .profile-avatar-large {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2e7d32, #1b5e20);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 2rem;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .avatar-edit-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #2e7d32;
          color: white;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .avatar-edit-btn:hover {
          background: #1b5e20;
          transform: scale(1.1);
        }
        .profile-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2e7d32;
        }
        .stat-label {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }
        .seller-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }
        .card-body {
          padding: 1.5rem;
        }
        .info-group {
          margin-bottom: 1rem;
        }
        .info-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #666;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .info-value {
          font-size: 1rem;
          color: #333;
          font-weight: 500;
        }
        .verification-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .verification-item {
          padding: 0.75rem;
          background: #f8fff9;
          border-radius: 6px;
          border: 1px solid #e8f5e8;
        }
        .verification-status-badge {
          text-align: center;
          font-weight: 600;
          border-radius: 8px;
        }
        .btn-seller {
          background-color: #2e7d32;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-seller:hover {
          background-color: #1b5e20;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
        }
      `}</style>

      {/* Profile Modals */}
      <AvatarChangeModal
        show={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
      />
      <EditProfileModal
        show={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
      <VerificationModal
        show={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />
    </div>
  )
}

export default SellerProfilePage
