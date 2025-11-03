import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import SellerAuthLayout from '../../layout/SellerAuthLayout'
import { authAPI } from '../../services/authAPI'
import { psgcService } from '../../services/psgcAPI'
import { getLocationCoordinates } from '../../services/geocodingService'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import '../../styles/seller-auth.css'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function SellerRegisterPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    businessLicense: '',
    businessDescription: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    province: '',
    municipality: '',
    barangay: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  // Password visibility toggle function
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // PSGC data states
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  // Map state for business address
  const [mapCoordinates, setMapCoordinates] = useState(null)
  const [loadingMap, setLoadingMap] = useState(false)
  const [provinceNames, setProvinceNames] = useState({}) // Store province codes to names
  const [municipalityNames, setMunicipalityNames] = useState({}) // Store municipality codes to names
  const [barangayNames, setBarangayNames] = useState({}) // Store barangay codes to names

  // Load provinces on component mount (Real Philippine data)
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const data = await psgcService.getAllProvinces()
        setProvinces(data || [])
        console.log('✅ Loaded provinces:', data?.length)
      } catch (error) {
        console.error('Failed to load provinces:', error)
        setError('Failed to load provinces. Please refresh the page.')
      } finally {
        setLoadingProvinces(false)
      }
    }

    loadProvinces()
  }, [])

  // Load municipalities when province changes (Real Philippine data)
  useEffect(() => {
    const loadMunicipalities = async () => {
      if (!formData.province) {
        setMunicipalities([])
        setBarangays([])
        return
      }

      setLoadingMunicipalities(true)
      try {
        const data = await psgcService.getMunicipalities(formData.province)
        setMunicipalities(data || [])
        setBarangays([]) // Clear barangays when province changes
        setFormData(prev => ({ ...prev, municipality: '', barangay: '' }))
        console.log('✅ Loaded municipalities:', data?.length)
      } catch (error) {
        console.error('Failed to load municipalities:', error)
        setError('Failed to load municipalities. Please try again.')
      } finally {
        setLoadingMunicipalities(false)
      }
    }

    loadMunicipalities()
  }, [formData.province])

  // Load barangays when municipality changes (Real Philippine data)
  useEffect(() => {
    const loadBarangays = async () => {
      if (!formData.municipality) {
        setBarangays([])
        return
      }

      setLoadingBarangays(true)
      try {
        const data = await psgcService.getBarangays(formData.municipality)
        setBarangays(data || [])
        setFormData(prev => ({ ...prev, barangay: '' }))
        console.log('✅ Loaded barangays:', data?.length)
      } catch (error) {
        console.error('Failed to load barangays:', error)
        setError('Failed to load barangays. Please try again.')
      } finally {
        setLoadingBarangays(false)
      }
    }

    loadBarangays()
  }, [formData.municipality])

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target
    
    // Update form data first
    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    }
    
    setFormData(updatedFormData)
    
    // Store names for geocoding and trigger map update
    if (name === 'province' && value) {
      const selectedProvince = provinces.find(p => p.code === value)
      if (selectedProvince) {
        setProvinceNames(prev => ({ ...prev, [value]: selectedProvince.name }))
      }
    } else if (name === 'municipality' && value) {
      const selectedMunicipality = municipalities.find(m => m.code === value)
      if (selectedMunicipality) {
        setMunicipalityNames(prev => ({ ...prev, [value]: selectedMunicipality.name }))
      }
    } else if (name === 'barangay' && value) {
      const selectedBarangay = barangays.find(b => b.code === value)
      const selectedMunicipality = municipalities.find(m => m.code === updatedFormData.municipality)
      const selectedProvince = provinces.find(p => p.code === updatedFormData.province)
      
      if (selectedBarangay && selectedMunicipality && selectedProvince) {
        setBarangayNames(prev => ({ ...prev, [value]: selectedBarangay.name }))
        
        // Geocode the complete address using the currently selected items
        console.log('🗺️ Geocoding:', {
          barangay: selectedBarangay.name,
          municipality: selectedMunicipality.name,
          province: selectedProvince.name
        })
        
        await geocodeAddress(
          selectedBarangay.name,
          selectedMunicipality.name,
          selectedProvince.name
        )
      }
    }
    
    // Clear error when user starts typing
    if (error) setError('')
  }

  // Geocode business address for map display
  const geocodeAddress = async (barangay, municipality, province) => {
    if (!barangay || !municipality || !province) return
    
    setLoadingMap(true)
    try {
      // getLocationCoordinates expects (province, municipality, barangay)
      const coordinates = await getLocationCoordinates(province, municipality, barangay)
      if (coordinates) {
        setMapCoordinates({
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: coordinates.zoom || 15,
          name: `${barangay}, ${municipality}, ${province}`
        })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    } finally {
      setLoadingMap(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Enhanced validation with specific error messages
    const validations = [
      {
        condition: !formData.businessName || formData.businessName.trim().length < 2,
        message: 'Business name must be at least 2 characters long'
      },
      {
        condition: !formData.businessType,
        message: 'Please select a valid business type'
      },
      {
        condition: !formData.firstName || 
                   formData.firstName.trim().length < 2 || 
                   !/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-'.]+$/.test(formData.firstName),
        message: 'First name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes'
      },
      {
        condition: !formData.lastName || 
                   formData.lastName.trim().length < 2 || 
                   !/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-'.]+$/.test(formData.lastName),
        message: 'Last name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes'
      },
      {
        condition: !formData.email || 
                   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
        message: 'Please provide a valid email address'
      },
      {
        condition: !formData.phone || 
                   !/^\+639\d{9}$/.test(formData.phone),
        message: 'Phone number must be in format +639XXXXXXXXX (e.g., +639123456789)'
      },
      {
        condition: !formData.password || formData.password.length < 4,
        message: 'Password must be at least 4 characters long'
      },
      {
        condition: formData.password !== formData.confirmPassword,
        message: 'Passwords do not match'
      },
      {
        condition: !formData.province,
        message: 'Please select a province'
      },
      {
        condition: !formData.municipality,
        message: 'Please select a municipality'
      },
      {
        condition: !formData.barangay,
        message: 'Please select a barangay'
      },
      {
        condition: !formData.agreeToTerms,
        message: 'You must agree to the Terms and Conditions'
      }
    ]

    // Check validations
    for (const validation of validations) {
      if (validation.condition) {
        setError(validation.message)
        return
      }
    }

    setIsLoading(true)

    try {
      // Get the actual names (not codes) for location data
      const selectedProvince = provinces.find(p => p.code === formData.province)
      const selectedMunicipality = municipalities.find(m => m.code === formData.municipality)
      const selectedBarangay = barangays.find(b => b.code === formData.barangay)

      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessLicense: formData.businessLicense,
        businessDescription: formData.businessDescription,
        province: selectedProvince?.name || formData.province,
        municipality: selectedMunicipality?.name || formData.municipality,
        barangay: selectedBarangay?.name || formData.barangay,
        province_code: formData.province,
        municipality_code: formData.municipality,
        barangay_code: formData.barangay
      }

      console.log('📍 Sending registration with location:', {
        province: registrationData.province,
        municipality: registrationData.municipality,
        barangay: registrationData.barangay,
        province_code: registrationData.province_code,
        municipality_code: registrationData.municipality_code,
        barangay_code: registrationData.barangay_code
      })

      const response = await authAPI.sellerRegister(registrationData)

      if (response && response.seller) {
        setSuccess(true)
      } else {
        throw new Error('Registration failed - no seller data received')
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      // Extract error message from different error formats
      const errorMessage = error?.message || 
                          error?.response?.data?.message || 
                          error?.data?.message || 
                          error?.error?.message ||
                          'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <SellerAuthLayout title="Registration Successful">
        <div className="seller-register-success">
          <div className="text-center mb-4">
            <div className="success-icon mb-3">
              <i className="bi bi-check-circle-fill text-success"></i>
            </div>
            <h3 className="seller-success-title">Application Submitted!</h3>
            <p className="seller-success-subtitle">
              Your seller account application has been submitted for review
            </p>
          </div>

          <div className="seller-approval-info">
            <div className="info-card">
              <h5><i className="bi bi-clock me-2 text-info"></i>What's Next?</h5>
              <ul className="info-list">
                <li>Our team will review your application within 2-3 business days</li>
                <li>We may contact you for additional verification documents</li>
                <li>You'll receive an email notification once approved</li>
                <li>After approval, you can start listing your products</li>
              </ul>
            </div>

            <div className="requirements-card">
              <h5><i className="bi bi-file-text me-2 text-warning"></i>Required Documents</h5>
              <p className="small text-muted mb-2">
                Please prepare these documents for faster approval:
              </p>
              <ul className="requirements-list">
                <li>Valid government-issued ID</li>
                <li>Business permit or registration</li>
                <li>Tax identification number (TIN)</li>
                <li>Bank account information</li>
                <li>Product samples or photos</li>
              </ul>
            </div>

            <div className="contact-card">
              <h5><i className="bi bi-headset me-2 text-primary"></i>Need Help?</h5>
              <div className="contact-options">
                <div className="contact-item">
                  <i className="bi bi-envelope"></i>
                  <span>sellers@s2eh.com</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-telephone"></i>
                  <span>+63 912 345 6789</span>
                </div>
                <div className="contact-item">
                  <i className="bi bi-chat-dots"></i>
                  <span>Live Chat Support (9AM-5PM)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <NavLink to="/seller/login" className="btn btn-outline-seller me-3">
              Login to Existing Account
            </NavLink>
            <NavLink to="/" className="btn btn-seller-login">
              Back to Home
            </NavLink>
          </div>
        </div>
      </SellerAuthLayout>
    )
  }

  return (
    <SellerAuthLayout title="Become a Seller">
      <form className="seller-register-form auth-form" onSubmit={handleSubmit}>
        <div className="seller-register-header text-center mb-4">
          <h2 className="seller-register-title">Join Our Marketplace</h2>
          <p className="seller-register-subtitle">
            Start selling your products to customers across Camarines Sur
          </p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 rounded-3 mb-3" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Main Form Sections in 3 Columns */}
        <div className="row">
          {/* Business Information Column */}
          <div className="col-lg-4 col-md-12 mb-4">
            <div className="form-section h-100">
              <h5 className="section-title">
                <i className="bi bi-shop me-2"></i>
                Business Information
              </h5>
              
              <div className="mb-3">
                <label htmlFor="businessName" className="form-label">
                  Business/Store Name *
                </label>
                <input 
                  type="text" 
                  className="form-control seller-input" 
                  id="businessName" 
                  name="businessName" 
                  placeholder="Enter your business name" 
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="mb-3">
                <label htmlFor="businessType" className="form-label">
                  Business Type *
                </label>
                <select 
                  className="form-control seller-input" 
                  id="businessType" 
                  name="businessType" 
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select business type</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="fishery">Fishery & Aquaculture</option>
                  <option value="food">Food & Beverages</option>
                  <option value="handicrafts">Handicrafts & Souvenirs</option>
                  <option value="livestock">Livestock & Poultry</option>
                  <option value="retail">Retail & General Merchandise</option>
                  <option value="services">Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="businessLicense" className="form-label">
                  Business License/Permit Number
                </label>
                <input 
                  type="text" 
                  className="form-control seller-input" 
                  id="businessLicense" 
                  name="businessLicense" 
                  placeholder="Enter license number (optional)" 
                  value={formData.businessLicense}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="businessDescription" className="form-label">
                  Business Description
                </label>
                <textarea 
                  className="form-control seller-input" 
                  id="businessDescription" 
                  name="businessDescription" 
                  rows="3"
                  placeholder="Describe your business and products"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Personal Information Column */}
          <div className="col-lg-4 col-md-12 mb-4">
            <div className="form-section h-100">
              <h5 className="section-title">
                <i className="bi bi-person me-2"></i>
                Personal Information
              </h5>
              
              <div className="mb-3">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input 
                  type="text" 
                  className="form-control seller-input" 
                  id="firstName" 
                  name="firstName" 
                  placeholder="Enter your first name" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="mb-3">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input 
                  type="text" 
                  className="form-control seller-input" 
                  id="lastName" 
                  name="lastName" 
                  placeholder="Enter your last name" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input 
                  type="email" 
                  className="form-control seller-input" 
                  id="email" 
                  name="email" 
                  placeholder="seller@example.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <input 
                  type="tel" 
                  className="form-control seller-input" 
                  id="phone" 
                  name="phone" 
                  placeholder="+639123456789" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  required 
                />
                <div className="form-text">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Phone number must start with +639 followed by 9 digits
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Column */}
          <div className="col-lg-4 col-md-12 mb-4">
            <div className="form-section h-100">
              <h5 className="section-title">
                <i className="bi bi-shield-lock me-2"></i>
                Account Security
              </h5>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="form-control seller-input" 
                    id="password" 
                    name="password" 
                    placeholder="Create a strong password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                    minLength="8"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility('password')}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                  </button>
                </div>
                <div className="form-text">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Minimum 8 characters with at least one letter and one number
                  </small>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control seller-input" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder="Confirm your password" 
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required 
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="form-text">
                    <small className="text-danger">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Passwords do not match
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Address Section - Full Width */}
        <div className="form-section mb-4">
          <h5 className="section-title">
            <i className="bi bi-geo-alt me-2"></i>
            Business Address
          </h5>
          
          <div className="row">
            <div className="col-12 mb-3">
              <label htmlFor="province" className="form-label">
                Province *
              </label>
              <select 
                className="form-control seller-input" 
                id="province" 
                name="province" 
                value={formData.province}
                onChange={handleInputChange}
                disabled={loadingProvinces}
                required
              >
                <option value="">
                  {loadingProvinces ? 'Loading provinces...' : 'Select Province'}
                </option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 mb-3">
              <label htmlFor="municipality" className="form-label">
                Municipality/City *
              </label>
              <select 
                className="form-control seller-input" 
                id="municipality" 
                name="municipality" 
                value={formData.municipality}
                onChange={handleInputChange}
                disabled={!formData.province || loadingMunicipalities}
                required
              >
                <option value="">
                  {loadingMunicipalities ? 'Loading municipalities...' : 'Select Municipality/City'}
                </option>
                {municipalities.map((municipality) => (
                  <option key={municipality.code} value={municipality.code}>
                    {municipality.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 mb-3">
              <label htmlFor="barangay" className="form-label">
                Barangay *
              </label>
              <select 
                className="form-control seller-input" 
                id="barangay" 
                name="barangay" 
                value={formData.barangay}
                onChange={handleInputChange}
                disabled={!formData.municipality || loadingBarangays}
                required
              >
                <option value="">
                  {loadingBarangays ? 'Loading barangays...' : 'Select Barangay'}
                </option>
                {barangays.map((barangay) => (
                  <option key={barangay.code} value={barangay.code}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Map Preview */}
            <div className="col-12 mb-3">
              <label className="form-label">
                <i className="bi bi-map me-2"></i>
                Location Preview
              </label>
              <div style={{ 
                height: '400px', 
                borderRadius: '8px', 
                overflow: 'hidden',
                border: '1px solid #dee2e6',
                position: 'relative'
              }}>
                {loadingMap ? (
                  <div className="d-flex justify-content-center align-items-center h-100 bg-light">
                    <div className="text-center">
                      <div className="spinner-border text-success mb-2" role="status">
                        <span className="visually-hidden">Loading map...</span>
                      </div>
                      <p className="text-muted mb-0">Loading map...</p>
                    </div>
                  </div>
                ) : mapCoordinates ? (
                  <MapContainer
                    key={`${mapCoordinates.lat}-${mapCoordinates.lng}`}
                    center={[mapCoordinates.lat, mapCoordinates.lng]}
                    zoom={mapCoordinates.zoom}
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    dragging={true}
                    scrollWheelZoom={true}
                    doubleClickZoom={true}
                    touchZoom={true}
                    zoomControl={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                    />
                    <Marker position={[mapCoordinates.lat, mapCoordinates.lng]}>
                      <Popup>
                        <strong>Business Address</strong><br />
                        {mapCoordinates.name}
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 bg-light">
                    <div className="text-center text-muted">
                      <i className="bi bi-geo-alt fs-1 mb-2"></i>
                      <p className="mb-0">Select complete address to view map</p>
                    </div>
                  </div>
                )}
              </div>
              {mapCoordinates && (
                <small className="text-muted mt-2 d-block">
                  <i className="bi bi-info-circle me-1"></i>
                  This is a preview of your business location based on the selected address
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="form-check mb-4">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            required
          />
          <label className="form-check-label" htmlFor="agreeToTerms">
            I agree to the{' '}
            <NavLink to="/seller/terms" className="seller-link" target="_blank">
              Terms and Conditions
            </NavLink>{' '}
            and{' '}
            <NavLink to="/seller/privacy" className="seller-link" target="_blank">
              Privacy Policy
            </NavLink>
          </label>
        </div>

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-seller-login" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="mb-0">
            Already have a seller account?{' '}
            <NavLink to="/seller/login" className="seller-link">
              Sign in here
            </NavLink>
          </p>
        </div>
      </form>
    </SellerAuthLayout>
  )
}