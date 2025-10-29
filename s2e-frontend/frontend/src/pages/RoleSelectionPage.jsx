import { useNavigate } from 'react-router-dom'
import './RoleSelectionPage.css'

const RoleSelectionPage = () => {
  const navigate = useNavigate()

  const handleRoleSelection = (role) => {
    switch (role) {
      case 'customer':
        navigate('/user/home')
        break
      case 'seller':
        navigate('/seller/login')
        break
      case 'admin':
        navigate('/admin/login')
        break
      default:
        navigate('/user/home')
    }
  }

  return (
    <div className="role-selection-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            <div className="role-selection-card">
              <div className="text-center mb-4">
                <img 
                  src="/logos/s2eh.png" 
                  alt="S2EH Logo" 
                  className="logo mb-3"
                  style={{ width: '200px', height: 'auto' }}
                />
                <h1 className="display-5 fw-bold text-primary mb-3">
                  Welcome to S2EH
                </h1>
                <p className="lead text-muted">
                  Sagnay to Everyone's Home - Your Local Marketplace
                </p>
                <p className="text-secondary">
                  Please select your role to continue
                </p>
              </div>

              <div className="role-buttons-container">
                <div className="row g-4">
                  <div className="col-12">
                    <button
                      className="role-button customer-btn"
                      onClick={() => handleRoleSelection('customer')}
                    >
                      <div className="role-icon">
                        <i className="bi bi-person-check-fill"></i>
                      </div>
                      <div className="role-content">
                        <h4 className="role-title">Customer</h4>
                        <p className="role-description">
                          Browse and purchase fresh local products from Sagnay
                        </p>
                      </div>
                      <div className="role-arrow">
                        <i className="bi bi-arrow-right"></i>
                      </div>
                    </button>
                  </div>

                  <div className="col-12">
                    <button
                      className="role-button seller-btn"
                      onClick={() => handleRoleSelection('seller')}
                    >
                      <div className="role-icon">
                        <i className="bi bi-shop"></i>
                      </div>
                      <div className="role-content">
                        <h4 className="role-title">Seller</h4>
                        <p className="role-description">
                          Sell your products and manage your business
                        </p>
                      </div>
                      <div className="role-arrow">
                        <i className="bi bi-arrow-right"></i>
                      </div>
                    </button>
                  </div>

                  <div className="col-12">
                    <button
                      className="role-button admin-btn"
                      onClick={() => handleRoleSelection('admin')}
                    >
                      <div className="role-icon">
                        <i className="bi bi-gear-fill"></i>
                      </div>
                      <div className="role-content">
                        <h4 className="role-title">Administrator</h4>
                        <p className="role-description">
                          Manage the platform, users, and system settings
                        </p>
                      </div>
                      <div className="role-arrow">
                        <i className="bi bi-arrow-right"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="small text-muted">
                  Supporting local farmers and businesses in Sagnay, Camarines Sur
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelectionPage