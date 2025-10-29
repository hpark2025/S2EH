import { useState } from 'react'
import PropTypes from 'prop-types'

export default function LoyaltyProgramModal({ show, onClose }) {
  const [formData, setFormData] = useState({
    isEnabled: true,
    programName: 'S2EH Rewards',
    pointsPerPeso: 1,
    minimumSpend: 100,
    pointsExpiry: 365
  })
  const [isLoading, setIsLoading] = useState(false)

  if (!show) return null

  const loyaltyStats = {
    totalMembers: 245,
    activeMembers: 189,
    totalPointsIssued: 125840,
    totalPointsRedeemed: 89230,
    redemptionRate: 71,
    averagePointsPerCustomer: 514,
    topRedeemers: [
      { name: 'Juan Dela Cruz', points: 2850, tier: 'Gold', redeemed: 1200 },
      { name: 'Maria Santos', points: 3400, tier: 'Gold', redeemed: 1850 },
      { name: 'Roberto Garcia', points: 5200, tier: 'Platinum', redeemed: 2400 }
    ]
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSaveProgram = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('Saving loyalty program:', formData)
      
      // Close modal after save
      onClose()
      
    } catch (error) {
      console.error('Error saving loyalty program:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const getTierBadgeClass = (tierName) => {
    const tierClasses = {
      'Bronze': 'bg-warning text-dark',
      'Silver': 'bg-secondary',
      'Gold': 'bg-warning',
      'Platinum': 'bg-dark'
    }
    return tierClasses[tierName] || 'bg-primary'
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-award me-2"></i>
              Loyalty Program Settings
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
              Manage your customer loyalty program settings. Configure points, rewards, and member tiers to encourage repeat purchases.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveProgram(); }}>
              {/* Program Status */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isEnabled"
                    name="isEnabled"
                    checked={formData.isEnabled}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isEnabled">
                    <strong>Enable Loyalty Program</strong>
                  </label>
                </div>
              </div>

              {/* Program Statistics */}
              <div className="bg-light p-3 rounded mb-3">
                <h6 className="fw-bold mb-2">Program Statistics</h6>
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="fw-bold text-primary">{loyaltyStats.totalMembers}</div>
                    <small className="text-muted">Total Members</small>
                  </div>
                  <div className="col-md-3">
                    <div className="fw-bold text-success">{loyaltyStats.activeMembers}</div>
                    <small className="text-muted">Active Members</small>
                  </div>
                  <div className="col-md-3">
                    <div className="fw-bold text-info">{loyaltyStats.redemptionRate}%</div>
                    <small className="text-muted">Redemption Rate</small>
                  </div>
                  <div className="col-md-3">
                    <div className="fw-bold text-warning">{loyaltyStats.averagePointsPerCustomer}</div>
                    <small className="text-muted">Avg Points/Customer</small>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="programName" className="form-label">
                  Program Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="programName"
                  name="programName"
                  value={formData.programName}
                  onChange={handleChange}
                  placeholder="Enter program name"
                  required
                  disabled={!formData.isEnabled}
                />
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="pointsPerPeso" className="form-label">Points per Peso</label>
                  <input
                    type="number"
                    className="form-control"
                    id="pointsPerPeso"
                    name="pointsPerPeso"
                    value={formData.pointsPerPeso}
                    onChange={handleChange}
                    min="0.1"
                    step="0.1"
                    disabled={!formData.isEnabled}
                  />
                  <small className="form-text text-muted">Points earned per peso spent</small>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="minimumSpend" className="form-label">Minimum Spend (₱)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="minimumSpend"
                    name="minimumSpend"
                    value={formData.minimumSpend}
                    onChange={handleChange}
                    min="0"
                    disabled={!formData.isEnabled}
                  />
                  <small className="form-text text-muted">Minimum order to earn points</small>
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="pointsExpiry" className="form-label">Points Expiry (Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="pointsExpiry"
                    name="pointsExpiry"
                    value={formData.pointsExpiry}
                    onChange={handleChange}
                    min="30"
                    disabled={!formData.isEnabled}
                  />
                  <small className="form-text text-muted">Days until points expire</small>
                </div>
              </div>

              {/* Member Tiers */}
              <div className="mb-3">
                <label className="form-label fw-bold">Member Tiers</label>
                <div className="row">
                  {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier, index) => {
                    const thresholds = [0, 1000, 2500, 5000]
                    const multipliers = [1, 1.2, 1.5, 2]
                    return (
                      <div key={tier} className="col-md-3 mb-2">
                        <div className="border rounded p-2 text-center">
                          <span className={`badge ${getTierBadgeClass(tier)} mb-1`}>
                            {tier}
                          </span>
                          <div className="small">
                            <div>{thresholds[index]}+ points</div>
                            <div>{multipliers[index]}x multiplier</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top Redeemers */}
              <div className="mb-3">
                <label className="form-label fw-bold">Top Point Redeemers</label>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Customer</th>
                        <th>Points</th>
                        <th>Tier</th>
                        <th>Redeemed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loyaltyStats.topRedeemers.map((customer, index) => (
                        <tr key={index}>
                          <td>{customer.name}</td>
                          <td>{customer.points.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${getTierBadgeClass(customer.tier)} badge-sm`}>
                              {customer.tier}
                            </span>
                          </td>
                          <td>{customer.redeemed.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Rewards */}
              <div className="mb-3">
                <label className="form-label fw-bold">Available Rewards</label>
                <div className="row">
                  <div className="col-md-4">
                    <div className="border rounded p-2 text-center">
                      <div className="fw-bold text-success">₱50 Discount</div>
                      <div className="small text-muted">500 points</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-2 text-center">
                      <div className="fw-bold text-primary">Free Shipping</div>
                      <div className="small text-muted">300 points</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-2 text-center">
                      <div className="fw-bold text-warning">10% Off</div>
                      <div className="small text-muted">750 points</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points Calculation Preview */}
              <div className="bg-light p-3 rounded">
                <h6 className="fw-bold mb-2">Points Calculation Preview</h6>
                <div className="small">
                  <div>Customer spends ₱{formData.minimumSpend} = <strong>{formData.pointsPerPeso * formData.minimumSpend} points</strong></div>
                  <div>Points expire after <strong>{formData.pointsExpiry} days</strong></div>
                  <div>Program status: <span className={`badge ${formData.isEnabled ? 'bg-success' : 'bg-secondary'}`}>
                    {formData.isEnabled ? 'Active' : 'Inactive'}
                  </span></div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button 
              type="button"
              className="btn btn-outline-primary"
              disabled={isLoading || !formData.isEnabled}
            >
              <i className="bi bi-eye me-2"></i>Preview Program
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              onClick={handleSaveProgram}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>Save Program
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

LoyaltyProgramModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}