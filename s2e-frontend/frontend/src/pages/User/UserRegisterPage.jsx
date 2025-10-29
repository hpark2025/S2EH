import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import UserAuthBasicLayout from '../../layout/UserAuthBasicLayout.jsx'
import { authAPI } from '../../services/authAPI'
import { psgcService } from '../../services/psgcAPI'
import LocationMap from '../../components/LocationMap'
import { getLocationCoordinates } from '../../services/geocodingService'

export default function UserRegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    barangay: '',
    barangayCode: '',
    municipality: '',
    municipalityCode: '',
    province: '',
    provinceCode: '',
    postalCode: '',
    terms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  
  // PSGC data states
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)
  
  // Map coordinates state
  const [mapCoordinates, setMapCoordinates] = useState({
    lat: 12.8797, // Philippines center
    lng: 121.7740,
    zoom: 6,
    locationName: 'Philippines'
  })
  const [loadingMap, setLoadingMap] = useState(false)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Redirect if logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    if (isLoggedIn) navigate('/auth/home')
  }, [navigate])

  // Load provinces
  const loadProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const data = await psgcService.getProvinces()
      setProvinces(data)
      console.log('✅ Loaded provinces:', data.length)
    } catch (error) {
      console.error('Failed to load provinces:', error)
      toast.error('Failed to load provinces')
    } finally {
      setLoadingProvinces(false)
    }
  }

  // Load municipalities when province is selected
  const loadMunicipalities = async (provinceCode) => {
    setLoadingMunicipalities(true)
    setMunicipalities([])
    setBarangays([])
    try {
      const data = await psgcService.getMunicipalities(provinceCode)
      setMunicipalities(data)
      console.log('✅ Loaded municipalities:', data.length)
    } catch (error) {
      console.error('Failed to load municipalities:', error)
      toast.error('Failed to load municipalities')
    } finally {
      setLoadingMunicipalities(false)
    }
  }

  // Load barangays when municipality is selected
  const loadBarangays = async (municipalityCode) => {
    setLoadingBarangays(true)
    setBarangays([])
    try {
      const data = await psgcService.getBarangays(municipalityCode)
      setBarangays(data)
      console.log('✅ Loaded barangays:', data.length)
    } catch (error) {
      console.error('Failed to load barangays:', error)
      toast.error('Failed to load barangays')
    } finally {
      setLoadingBarangays(false)
    }
  }

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target
    
    // Handle cascading address changes
    if (name === 'province' && value) {
      const selectedProvince = provinces.find(p => p.code === value)
      if (selectedProvince) {
        setFormData(prev => ({
          ...prev,
          province: selectedProvince.name,
          provinceCode: selectedProvince.code,
          municipality: '',
          municipalityCode: '',
          barangay: '',
          barangayCode: ''
        }))
        loadMunicipalities(selectedProvince.code)
        
        // Update map to province location (async)
        setLoadingMap(true)
        try {
          const coords = await getLocationCoordinates(selectedProvince.name)
          setMapCoordinates({
            lat: coords.lat,
            lng: coords.lng,
            zoom: coords.zoom,
            locationName: selectedProvince.name
          })
        } catch (error) {
          console.error('Error loading coordinates:', error)
        } finally {
          setLoadingMap(false)
        }
      }
    } else if (name === 'municipality' && value) {
      const selectedMunicipality = municipalities.find(m => m.code === value)
      if (selectedMunicipality) {
        setFormData(prev => ({
          ...prev,
          municipality: selectedMunicipality.name,
          municipalityCode: selectedMunicipality.code,
          barangay: '',
          barangayCode: ''
        }))
        loadBarangays(selectedMunicipality.code)
        
        // Update map to municipality location (async)
        setLoadingMap(true)
        try {
          const coords = await getLocationCoordinates(formData.province, selectedMunicipality.name)
          setMapCoordinates({
            lat: coords.lat,
            lng: coords.lng,
            zoom: coords.zoom,
            locationName: `${selectedMunicipality.name}, ${formData.province}`
          })
          
          // Auto-set postal code if available
          if (coords.postal_code) {
            console.log('📮 Auto-setting postal code:', coords.postal_code)
            setFormData(prev => ({
              ...prev,
              postalCode: coords.postal_code
            }))
          }
        } catch (error) {
          console.error('Error loading coordinates:', error)
        } finally {
          setLoadingMap(false)
        }
      }
    } else if (name === 'barangay' && value) {
      const selectedBarangay = barangays.find(b => b.code === value)
      if (selectedBarangay) {
        setFormData(prev => ({
          ...prev,
          barangay: selectedBarangay.name,
          barangayCode: selectedBarangay.code
        }))
        
        // Update map to barangay location (async)
        setLoadingMap(true)
        try {
          const coords = await getLocationCoordinates(formData.province, formData.municipality, selectedBarangay.name)
          setMapCoordinates({
            lat: coords.lat,
            lng: coords.lng,
            zoom: coords.zoom,
            locationName: `${selectedBarangay.name}, ${formData.municipality}, ${formData.province}`
          })
          
          // Auto-set postal code if available (barangays inherit municipality postal code)
          if (coords.postal_code) {
            console.log('📮 Auto-setting postal code:', coords.postal_code)
            setFormData(prev => ({
              ...prev,
              postalCode: coords.postal_code
            }))
          }
        } catch (error) {
          console.error('Error loading coordinates:', error)
        } finally {
          setLoadingMap(false)
        }
      }
    } else {
      // Handle other form fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})
    const form = new FormData(e.target)
    const password = form.get('password')
    const confirmPassword = form.get('confirmPassword')

    console.log('📋 Current formData state:', formData)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.terms) {
      setError('You must agree to the terms and conditions')
      return
    }

    setLoading(true)
    try {
      let phoneNumber = formData.phone
      if (phoneNumber?.trim()) {
        phoneNumber = phoneNumber.startsWith('9') ? `+63${phoneNumber}` : phoneNumber
      }

      // Format data for PHP backend
      const registrationData = {
        email: formData.email,
        password: password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: phoneNumber || undefined,
        metadata: {
          middle_name: formData.middleName || undefined,
          gender: formData.gender || undefined,
          date_of_birth: formData.dateOfBirth || undefined,
          address: {
            province: formData.province || null,
            province_code: formData.provinceCode || null,
            municipality: formData.municipality || null,
            municipality_code: formData.municipalityCode || null,
            barangay: formData.barangay || null,
            barangay_code: formData.barangayCode || null,
            postal_code: formData.postalCode || null
          }
        }
      }

      console.log('🔍 Attempting customer registration with:', registrationData)
      console.log('📍 Address data:', registrationData.metadata.address)
      console.log('📍 Province:', formData.province, 'Code:', formData.provinceCode)
      console.log('📍 Municipality:', formData.municipality, 'Code:', formData.municipalityCode)
      console.log('📍 Barangay:', formData.barangay, 'Code:', formData.barangayCode)
      
      // Use PHP backend customer registration
      const response = await authAPI.customerSignup(registrationData)

      console.log('✅ Registration response:', response)
      
      toast.success('✅ Registration successful! Your account is pending admin approval. You will be able to log in once verified.', {
        duration: 6000,
        icon: '⏳'
      })
      
      // Navigate to login page after showing message
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)

    } catch (err) {
      console.error('Registration failed:', err)
      setError(`Registration failed: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (f) => validationErrors[f]
  const hasFieldError = (f) => !!validationErrors[f]

  return (
    <UserAuthBasicLayout title="Sign Up">
      <form className="login-form auth-form" id="registerForm" onSubmit={handleSubmit} noValidate>
        <h3>Create an Account</h3>

        {error && (
          <div className="alert alert-warning d-flex align-items-center mb-3" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Personal Information */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">First Name *</label>
            <input 
              type="text" 
              className={`form-control ${hasFieldError('firstName') ? 'is-invalid' : ''}`}
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Your first name"
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Middle Name</label>
            <input 
              type="text" 
              className="form-control"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="Your middle name"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Last Name *</label>
          <input 
            type="text" 
            className="form-control"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Your last name"
            required
          />
        </div>

        {/* Contact Info */}
        <div className="mb-3">
          <label className="form-label">Email *</label>
          <input 
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Phone</label>
            <div className="input-group">
              <span className="input-group-text">+63</span>
              <input 
                type="tel"
                className="form-control"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9XX XXX XXXX"
              />
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Gender</label>
            <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Province</label>
            <select 
              className="form-select"
              name="province"
              value={formData.provinceCode}
              onChange={handleChange}
              disabled={loadingProvinces}
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
          <div className="col-md-6 mb-3">
            <label className="form-label">Municipality/City</label>
            <select 
              className="form-select"
              name="municipality"
              value={formData.municipalityCode}
              onChange={handleChange}
              disabled={loadingMunicipalities || !formData.province}
            >
              <option value="">
                {loadingMunicipalities 
                  ? 'Loading municipalities...' 
                  : !formData.province 
                    ? 'Select province first' 
                    : 'Select Municipality'}
              </option>
              {municipalities.map((municipality) => (
                <option key={municipality.code} value={municipality.code}>
                  {municipality.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Barangay</label>
            <select 
              className="form-select"
              name="barangay"
              value={formData.barangayCode}
              onChange={handleChange}
              disabled={loadingBarangays || !formData.municipality}
            >
              <option value="">
                {loadingBarangays 
                  ? 'Loading barangays...' 
                  : !formData.municipality 
                    ? 'Select municipality first' 
                    : 'Select Barangay'}
              </option>
              {barangays.map((barangay) => (
                <option key={barangay.code} value={barangay.code}>
                  {barangay.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Postal Code</label>
            <input 
              type="text" 
              className="form-control"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="4400"
            />
          </div>
        </div>

        {/* Location Map */}
        <div className="mb-4">
          <label className="form-label">
            <i className="bi bi-geo-alt-fill me-2"></i>Location Preview
            {loadingMap && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
          </label>
          <LocationMap
            latitude={mapCoordinates.lat}
            longitude={mapCoordinates.lng}
            zoom={mapCoordinates.zoom}
            locationName={mapCoordinates.locationName}
            height="350px"
          />
          <small className="text-muted d-block mt-2">
            <i className="bi bi-info-circle me-1"></i>
            {loadingMap ? 'Loading map location...' : 'Select your province, municipality, and barangay to see the location on the map'}
          </small>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password *</label>
          <input 
            type="password"
            className="form-control"
            name="password"
            placeholder="Create password"
            required
            minLength="8"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password *</label>
          <input 
            type="password"
            className="form-control"
            name="confirmPassword"
            placeholder="Confirm password"
            required
          />
        </div>

        {/* Terms */}
        <div className="form-check mb-4">
          <input 
            type="checkbox"
            className="form-check-input"
            id="terms"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            required
          />
          <label className="form-check-label" htmlFor="terms">
            I agree to the <a href="#" className="highlight-link">Terms and Conditions</a>
          </label>
        </div>

        <div className="d-grid mb-3">
          <button type="submit" className="btn btn-login" disabled={loading}>
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </div>

        <hr />

        <div className="text-center mt-4">
          <p className="mb-0">
            Already have an account? <NavLink to="/login" className="highlight-link">Log in</NavLink>
          </p>
        </div>
      </form>
    </UserAuthBasicLayout>
  )
}
