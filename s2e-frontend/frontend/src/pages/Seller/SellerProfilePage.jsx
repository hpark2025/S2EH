import { useState, useEffect } from 'react'
import {
  AvatarChangeModal
} from '../../components/SellerModals'
import { sellerAPI } from '../../services/sellerAPI'
import { getLocationCoordinates } from '../../services/geocodingService'
import { psgcService } from '../../services/psgcAPI'
import api from '../../services/api'

const SellerProfilePage = () => {
  // Modal state management
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Address editing state
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addressCoordinates, setAddressCoordinates] = useState(null)
  const [loadingCoordinates, setLoadingCoordinates] = useState(false)
  const [addressFormData, setAddressFormData] = useState({
    provinceCode: '',
    province: '',
    municipalityCode: '',
    municipality: '',
    barangayCode: '',
    barangay: '',
    street: '',
    postal_code: ''
  })
  
  // PSGC dropdowns data
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  // Profile data
  const [profileData, setProfileData] = useState(null)

  // Leaflet setup
  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!window.L && !document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => {
        console.log('✅ Leaflet loaded')
      }
      document.head.appendChild(script)
    }
  }, [])

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load seller profile
  useEffect(() => {
    loadSellerProfile()
  }, [])

  // Load municipalities when province changes
  useEffect(() => {
    if (addressFormData.provinceCode && isEditingAddress) {
      loadMunicipalities(addressFormData.provinceCode)
    }
  }, [addressFormData.provinceCode])

  // Load barangays when municipality changes
  useEffect(() => {
    if (addressFormData.municipalityCode && isEditingAddress) {
      loadBarangays(addressFormData.municipalityCode)
    }
  }, [addressFormData.municipalityCode])

  // Load coordinates and postal code when location changes
  useEffect(() => {
    if (isEditingAddress && addressFormData.province && addressFormData.municipality && addressFormData.barangay) {
      loadCoordinatesAndPostalCode()
    }
  }, [addressFormData.province, addressFormData.municipality, addressFormData.barangay])

  // Load coordinates when address is loaded
  useEffect(() => {
    if (profileData?.address) {
      loadAddressCoordinates()
      // Initialize form data with existing values
      initializeAddressFormData()
    }
  }, [profileData?.address])

  // Load address coordinates
  const loadAddressCoordinates = async () => {
    if (!profileData?.address) return
    
    const { province, municipality, barangay } = profileData.address
    if (!province) return

    setLoadingCoordinates(true)
    try {
      const coords = await getLocationCoordinates(province, municipality, barangay)
      setAddressCoordinates({
        lat: coords.lat,
        lng: coords.lng,
        zoom: coords.zoom || 13
      })
    } catch (error) {
      console.error('Failed to load coordinates:', error)
    } finally {
      setLoadingCoordinates(false)
    }
  }

  // Load provinces
  const loadProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const data = await psgcService.getAllProvinces()
      setProvinces(data || [])
    } catch (error) {
      console.error('Failed to load provinces:', error)
    } finally {
      setLoadingProvinces(false)
    }
  }

  // Load municipalities
  const loadMunicipalities = async (provinceCode) => {
    if (!provinceCode) {
      setMunicipalities([])
      setBarangays([])
      return
    }
    setLoadingMunicipalities(true)
    try {
      const data = await psgcService.getMunicipalities(provinceCode)
      setMunicipalities(data || [])
      setBarangays([]) // Clear barangays when province changes
      setAddressFormData(prev => ({ ...prev, municipalityCode: '', municipality: '', barangayCode: '', barangay: '' }))
    } catch (error) {
      console.error('Failed to load municipalities:', error)
    } finally {
      setLoadingMunicipalities(false)
    }
  }

  // Load barangays
  const loadBarangays = async (municipalityCode) => {
    if (!municipalityCode) {
      setBarangays([])
      return
    }
    setLoadingBarangays(true)
    try {
      const data = await psgcService.getBarangays(municipalityCode)
      setBarangays(data || [])
      setAddressFormData(prev => ({ ...prev, barangayCode: '', barangay: '' }))
    } catch (error) {
      console.error('Failed to load barangays:', error)
    } finally {
      setLoadingBarangays(false)
    }
  }

  // Initialize address form data from profile
  const initializeAddressFormData = async () => {
    if (!profileData?.address) return
    
    const addr = profileData.address
    setAddressFormData({
      provinceCode: addr.province_code || '',
      province: addr.province || '',
      municipalityCode: addr.municipality_code || '',
      municipality: addr.municipality || '',
      barangayCode: addr.barangay_code || '',
      barangay: addr.barangay || '',
      street: addr.street || '',
      postal_code: addr.postal_code || ''
    })

    // Load municipalities and barangays if codes exist
    if (addr.province_code) {
      await loadMunicipalities(addr.province_code)
      if (addr.municipality_code) {
        await loadBarangays(addr.municipality_code)
      }
    }
  }

  // Load coordinates and postal code
  const loadCoordinatesAndPostalCode = async () => {
    if (!addressFormData.province || !addressFormData.municipality || !addressFormData.barangay) return
    
    setLoadingCoordinates(true)
    try {
      const coords = await getLocationCoordinates(
        addressFormData.province,
        addressFormData.municipality,
        addressFormData.barangay
      )
      setAddressCoordinates({
        lat: coords.lat,
        lng: coords.lng,
        zoom: coords.zoom || 13
      })
      
      // Auto-detect postal code from geocoding response
      if (coords.postal_code) {
        setAddressFormData(prev => ({ ...prev, postal_code: coords.postal_code }))
      }
    } catch (error) {
      console.error('Failed to load coordinates:', error)
    } finally {
      setLoadingCoordinates(false)
    }
  }

  // Handle address form change
  const handleAddressChange = (field, value) => {
    if (field === 'provinceCode') {
      const selectedProvince = provinces.find(p => p.code === value)
      setAddressFormData(prev => ({
        ...prev,
        provinceCode: value,
        province: selectedProvince ? selectedProvince.name : '',
        municipalityCode: '',
        municipality: '',
        barangayCode: '',
        barangay: ''
      }))
    } else if (field === 'municipalityCode') {
      const selectedMunicipality = municipalities.find(m => m.code === value)
      setAddressFormData(prev => ({
        ...prev,
        municipalityCode: value,
        municipality: selectedMunicipality ? selectedMunicipality.name : '',
        barangayCode: '',
        barangay: ''
      }))
    } else if (field === 'barangayCode') {
      const selectedBarangay = barangays.find(b => b.code === value)
      setAddressFormData(prev => ({
        ...prev,
        barangayCode: value,
        barangay: selectedBarangay ? selectedBarangay.name : ''
      }))
    } else {
      setAddressFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Handle save address
  const handleSaveAddress = async () => {
    try {
      if (!profileData?.address?.id) {
        console.error('Address ID not found')
        alert('Address ID not found. Please contact support.')
        return
      }

      // Prepare address data for API
      const addressUpdateData = {
        street: addressFormData.street || '',
        barangay: addressFormData.barangay || '',
        barangayCode: addressFormData.barangayCode || '',
        municipality: addressFormData.municipality || '',
        municipalityCode: addressFormData.municipalityCode || '',
        province: addressFormData.province || '',
        provinceCode: addressFormData.provinceCode || '',
        postalCode: addressFormData.postal_code || ''
      }

      console.log('Saving address:', addressUpdateData)
      
      // Call API to update address - use /api/addresses/{id} format
      const response = await api.put(`/api/addresses/${profileData.address.id}`, addressUpdateData)
      const result = response.data

      if (!result.success) {
        throw new Error(result.message || 'Failed to update address')
      }

      console.log('✅ Address updated successfully:', result)
      
      // Reload seller profile to get updated address
      await loadSellerProfile()
      
      setIsEditingAddress(false)
      alert('Address updated successfully!')
    } catch (error) {
      console.error('Failed to save address:', error)
      alert(`Failed to save address: ${error.message}`)
    }
  }

  // Load seller stats from database
  const loadSellerStats = async () => {
    try {
      const response = await sellerAPI.getStats()
      const stats = response.data || response
      
      return {
        products: parseInt(stats.products) || 0,
        orders: parseInt(stats.orders) || 0,
        customers: parseInt(stats.customers) || 0,
        revenue: parseFloat(stats.revenue) || 0
      }
    } catch (error) {
      console.error('Failed to load seller stats:', error)
      return {
        products: 0,
        orders: 0,
        customers: 0,
        revenue: 0
      }
    }
  }

  const loadSellerProfile = async () => {
    try {
      setLoading(true)
      
      // Load profile and stats in parallel
      const [profileResponse, stats] = await Promise.all([
        sellerAPI.getProfile(),
        loadSellerStats()
      ])
      
      console.log('📊 Seller profile:', profileResponse)
      console.log('📊 Seller stats:', stats)
      
      const seller = profileResponse.data
      
      // Format the data
      setProfileData({
        personal: {
          fullName: seller.owner_name,
          email: seller.email,
          phone: seller.phone,
          avatar: seller.avatar || null
        },
        address: {
          id: seller.address_id || null,
          province: seller.province || '',
          municipality: seller.municipality || '',
          barangay: seller.barangay || '',
          street: seller.street || seller.address_line_1 || '',
          postal_code: seller.postal_code || '',
          province_code: seller.province_code || '',
          municipality_code: seller.municipality_code || '',
          barangay_code: seller.barangay_code || ''
        },
        business: {
          businessType: seller.business_type,
          businessPermit: seller.business_permit,
          description: seller.business_description || 'No description provided'
        },
        stats: {
          products: stats.products,
          orders: stats.orders,
          customers: stats.customers,
          revenue: `₱${stats.revenue.toLocaleString()}`
        },
        verification: {
          identity: seller.verification_status === 'verified',
          email: seller.verification_status === 'verified',
          phone: seller.verification_status === 'verified',
          business: true, // Static: always verified
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

  // Address Map Component
  const AddressMapComponent = () => {
    const mapId = 'seller-address-map'

    useEffect(() => {
      if (!window.L || !addressCoordinates) return
      const mapElement = document.getElementById(mapId)
      if (!mapElement) return

      const map = window.L.map(mapId).setView(
        [addressCoordinates.lat, addressCoordinates.lng],
        addressCoordinates.zoom || 15
      )

      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      window.L.marker([addressCoordinates.lat, addressCoordinates.lng]).addTo(map)
      mapElement._leafletMap = map

      return () => {
        if (mapElement._leafletMap) mapElement._leafletMap.remove()
      }
    }, [addressCoordinates, mapId])

    return <div id={mapId} style={{ height: '100%', minHeight: '400px', width: '100%', borderRadius: '0.375rem' }}></div>
  }

  return (
    <div className="seller-content p-4">
      {/* Profile Header */}
      <div className="seller-card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-auto">
              <div className="profile-avatar-container">
                {profileData.personal.avatar ? (
                  <img
                    src={`http://localhost:8080${profileData.personal.avatar}`}
                    alt="Profile Avatar"
                    className="profile-avatar-large"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.target.style.display = 'none'
                      const fallback = e.target.nextElementSibling
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className="profile-avatar-large"
                  style={{ display: profileData.personal.avatar ? 'none' : 'flex' }}
                >
                  {getInitials(profileData.personal.fullName)}
                </div>
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
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(profileData.personal)
                  .filter(([key]) => key !== 'avatar') // Exclude avatar from Personal Information card
                  .map(([key, value]) => (
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
          
          {/* Address Information */}
          <div className="seller-card mb-4">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-geo-alt me-2"></i>
                Address Information
              </h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => {
                  setIsEditingAddress(!isEditingAddress)
                  if (!isEditingAddress) {
                    initializeAddressFormData()
                  }
                }}
              >
                <i className="bi bi-pencil me-1"></i>
                {isEditingAddress ? 'Cancel' : 'Edit Address'}
              </button>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Left Column - Address Form */}
                <div className="col-md-6">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Province</label>
                      {isEditingAddress ? (
                        <select
                          className="form-select"
                          value={addressFormData.provinceCode}
                          onChange={(e) => handleAddressChange('provinceCode', e.target.value)}
                          disabled={loadingProvinces}
                        >
                          <option value="">Select Province</option>
                          {provinces.map((prov) => (
                            <option key={prov.code} value={prov.code}>
                              {prov.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="info-value">{profileData.address.province}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Municipality/City</label>
                      {isEditingAddress ? (
                        <select
                          className="form-select"
                          value={addressFormData.municipalityCode}
                          onChange={(e) => handleAddressChange('municipalityCode', e.target.value)}
                          disabled={!addressFormData.provinceCode || loadingMunicipalities}
                        >
                          <option value="">Select Municipality</option>
                          {municipalities.map((mun) => (
                            <option key={mun.code} value={mun.code}>
                              {mun.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="info-value">{profileData.address.municipality}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Barangay</label>
                      {isEditingAddress ? (
                        <select
                          className="form-select"
                          value={addressFormData.barangayCode}
                          onChange={(e) => handleAddressChange('barangayCode', e.target.value)}
                          disabled={!addressFormData.municipalityCode || loadingBarangays}
                        >
                          <option value="">Select Barangay</option>
                          {barangays.map((brgy) => (
                            <option key={brgy.code} value={brgy.code}>
                              {brgy.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="info-value">{profileData.address.barangay}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Street</label>
                      {isEditingAddress ? (
                        <input
                          type="text"
                          className="form-control"
                          value={addressFormData.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          placeholder="Street address (optional)"
                        />
                      ) : (
                        <div className="info-value">{profileData.address.street || 'N/A'}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Postal Code</label>
                      {isEditingAddress ? (
                        <input
                          type="text"
                          className="form-control"
                          value={addressFormData.postal_code}
                          readOnly
                          disabled
                          placeholder="Auto-detected"
                          style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                        />
                      ) : (
                        <div className="info-value">{profileData.address.postal_code || 'N/A'}</div>
                      )}
                    </div>
                  </div>
                  {isEditingAddress && (
                    <div className="d-flex justify-content-end mt-3">
                      <button 
                        className="btn btn-primary" 
                        onClick={handleSaveAddress}
                      >
                        Save Address
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column - Map */}
                <div className="col-md-6">
                  <div style={{ height: '100%', minHeight: '400px' }}>
                    {loadingCoordinates ? (
                      <div className="d-flex align-items-center justify-content-center bg-light border rounded h-100">
                        <div className="text-center text-muted">
                          <div className="spinner-border spinner-border-sm mb-2" role="status"></div>
                          <div>Loading map...</div>
                        </div>
                      </div>
                    ) : addressCoordinates ? (
                      <AddressMapComponent />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center bg-light border rounded h-100">
                        <div className="text-center text-muted">
                          <i className="bi bi-geo-alt-fill mb-2" style={{ fontSize: '2rem' }}></i>
                          <div>Location not available</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                        {value ? (
                          <span className="badge bg-success text-white" style={{ backgroundColor: '#28a745', color: '#fff' }}>Verified</span>
                        ) : (
                          <span className="badge bg-secondary text-white" style={{ backgroundColor: '#6c757d', color: '#fff' }}>Not Verified</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-3">
                <div className="badge bg-success p-2 w-100 verification-status-badge text-white" style={{ backgroundColor: '#28a745', color: '#fff' }}>
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
        .verification-item .badge.bg-success {
          background-color: #28a745 !important;
          color: #ffffff !important;
        }
        .verification-status-badge.bg-success {
          background-color: #28a745 !important;
          color: #ffffff !important;
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
        
        /* Custom Modal Styles for Wider Modals */
        :global(.modal-dialog) {
          max-width: 98% !important;
          width: 98% !important;
          margin: 0.5rem auto !important;
        }
        
        @media (min-width: 992px) {
          :global(.modal-lg),
          :global(.modal-xl) {
            max-width: 98% !important;
            width: 98% !important;
          }
        }
        
        @media (min-width: 1200px) {
          :global(.modal-xl) {
            max-width: 98% !important;
            width: 98% !important;
          }
        }
        
        /* Fix modal content to take full width */
        :global(.modal-content) {
          width: 100% !important;
        }
      `}</style>

      {/* Profile Modals */}
      <AvatarChangeModal
        show={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onUploadSuccess={() => {
          // Reload profile to show updated avatar
          loadSellerProfile()
        }}
        currentAvatar={profileData?.personal?.avatar}
      />
    </div>
  )
}

export default SellerProfilePage
