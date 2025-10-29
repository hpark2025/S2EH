import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { psgcService } from '../../../services/psgcAPI.js'
import { psgcCoordinatesService } from '../../../services/psgcCoordinatesService.js'

export default function AddAddressModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    label: '',
    fullName: '',
    phoneNumber: '',
    streetAddress: '',
    municipality: '',
    barangay: '',
    province: '',
    postalCode: '',
    isDefault: false
  })

  const [errors, setErrors] = useState({})

  // PSGC data states
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)
  
  // Map preview state
  const [previewCoordinates, setPreviewCoordinates] = useState(null)
  const [showMapPreview, setShowMapPreview] = useState(false)
  const [mapLoading, setMapLoading] = useState(false)

  // Load provinces on component mount
  useEffect(() => {
    if (show) {
      loadProvinces()
      // Load Leaflet for map preview
      loadLeafletAssets()
    }
  }, [show])

  // Update map preview when address changes
  useEffect(() => {
    updateMapPreview()
  }, [formData.province, formData.municipality, formData.barangay])

  const loadLeafletAssets = () => {
    // Add Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
    }

    // Add Leaflet JS
    if (!window.L && !document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      document.head.appendChild(script)
    }
  }

  const updateMapPreview = async () => {
    if (formData.province && formData.municipality) {
      setMapLoading(true)
      try {
        // 📌 Get coordinates with metadata for enhanced map display
        const coordinates = await psgcCoordinatesService.getCoordinatesWithMetadata(
          formData.province, 
          formData.municipality, 
          formData.barangay
        )
        setPreviewCoordinates(coordinates)
        setShowMapPreview(true)
      } catch (error) {
        console.error('Error getting coordinates for preview:', error)
        setShowMapPreview(false)
        setPreviewCoordinates(null)
      } finally {
        setMapLoading(false)
      }
    } else {
      setShowMapPreview(false)
      setPreviewCoordinates(null)
      setMapLoading(false)
    }
  }

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
      
      // Clear municipality and barangay from form data
      setFormData(prev => ({
        ...prev,
        municipality: '',
        barangay: ''
      }))
    } catch (error) {
      console.error('Failed to load municipalities:', error)
    } finally {
      setLoadingMunicipalities(false)
    }
  }

  const loadBarangays = async (municipalityCode) => {
    if (!municipalityCode) {
      setBarangays([])
      return
    }

    setLoadingBarangays(true)
    try {
      const data = await psgcService.getBarangays(municipalityCode)
      setBarangays(data || [])
      
      // Clear barangay from form data
      setFormData(prev => ({
        ...prev,
        barangay: ''
      }))
    } catch (error) {
      console.error('Failed to load barangays:', error)
    } finally {
      setLoadingBarangays(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Handle address field changes
    if (name === 'province') {
      const selectedProvince = provinces.find(p => p.name === value)
      if (selectedProvince) {
        loadMunicipalities(selectedProvince.code)
      }
    } else if (name === 'municipality') {
      const selectedMunicipality = municipalities.find(m => m.name === value)
      if (selectedMunicipality) {
        loadBarangays(selectedMunicipality.code)
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.label) newErrors.label = 'Address label is required'
    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.streetAddress) newErrors.streetAddress = 'Street address is required'
    if (!formData.municipality) newErrors.municipality = 'Municipality is required'
    if (!formData.province) newErrors.province = 'Province is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      label: '',
      fullName: '',
      phoneNumber: '',
      streetAddress: '',
      municipality: '',
      barangay: '',
      province: '',
      postalCode: '',
      isDefault: false
    })
    setErrors({})
    setMunicipalities([])
    setBarangays([])
    onClose()
  }

  // Map Preview Component
  const MapPreview = () => {
    const mapId = 'add-address-map-preview'

    useEffect(() => {
      if (!window.L || !previewCoordinates || !showMapPreview) return

      const timer = setTimeout(() => {
        const mapElement = document.getElementById(mapId)
        if (!mapElement) return

        // Remove existing map if any
        if (mapElement._leafletMap) {
          mapElement._leafletMap.remove()
        }

        // 🗺️ Initialize Leaflet map with recommended zoom level
        const zoomLevel = previewCoordinates.zoom || 13
        const map = window.L.map(mapId).setView([previewCoordinates.lat, previewCoordinates.lng], zoomLevel)

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // 📍 Add marker with enhanced popup content
        const marker = window.L.marker([previewCoordinates.lat, previewCoordinates.lng]).addTo(map)
        
        // Create enhanced popup content with address details
        const addressTitle = previewCoordinates.markerTitle || `${formData.municipality}, ${formData.province}`
        const popupContent = `
          <div style="text-align: center; min-width: 180px; padding: 5px;">
            <strong style="color: #2563eb;">${formData.label || 'New Address'}</strong><br>
            <div style="margin: 8px 0; color: #374151;">
              ${addressTitle}
            </div>
            <small style="color: #6b7280;">
              ${previewCoordinates.source === 'geocoded' ? '📍 Geocoded Location' : '🗺️ Approximate Location'}
            </small>
            ${previewCoordinates.display_name ? `<br><small style="color: #9ca3af; font-size: 10px;">${previewCoordinates.display_name}</small>` : ''}
          </div>
        `
        
        marker.bindPopup(popupContent).openPopup()

        // Store map instance for cleanup
        mapElement._leafletMap = map
      }, 100)

      return () => {
        clearTimeout(timer)
        const mapElement = document.getElementById(mapId)
        if (mapElement && mapElement._leafletMap) {
          mapElement._leafletMap.remove()
        }
      }
    }, [previewCoordinates, formData.label, formData.barangay, formData.municipality, formData.province])

    if (mapLoading) {
      return (
        <div 
          className="d-flex align-items-center justify-content-center bg-light border rounded"
          style={{ height: '200px' }}
        >
          <div className="text-center text-muted">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <div>Loading location preview...</div>
          </div>
        </div>
      )
    }

    if (!showMapPreview || !previewCoordinates) {
      return (
        <div 
          className="d-flex align-items-center justify-content-center bg-light border rounded"
          style={{ height: '200px' }}
        >
          <div className="text-center text-muted">
            <i className="bi bi-geo-alt" style={{ fontSize: '24px' }}></i>
            <div className="mt-2">Select province and municipality to preview location</div>
          </div>
        </div>
      )
    }

    return (
      <div>
        <div 
          id={mapId} 
          style={{ 
            height: '200px', 
            width: '100%', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}
        ></div>
        <small className="text-muted mt-2 d-block">
          <i className="bi bi-info-circle me-1"></i>
          Preview of address location based on selected province, municipality, and barangay
        </small>
      </div>
    )
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-plus-circle me-2"></i>Add New Address
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Address Label *</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.label ? 'is-invalid' : ''}`}
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="e.g. Home, Office, Farm"
                  />
                  {errors.label && <div className="invalid-feedback">{errors.label}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter recipient's full name"
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Phone Number *</label>
                <div className="input-group">
                  <span className="input-group-text">+63</span>
                  <input 
                    type="tel" 
                    className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="9XX XXX XXXX"
                  />
                  {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Street Address *</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.streetAddress ? 'is-invalid' : ''}`}
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  placeholder="House number, street name, subdivision"
                />
                {errors.streetAddress && <div className="invalid-feedback">{errors.streetAddress}</div>}
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Province *</label>
                  <select 
                    className={`form-select ${errors.province ? 'is-invalid' : ''}`}
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    disabled={loadingProvinces}
                  >
                    <option value="">
                      {loadingProvinces ? 'Loading provinces...' : 'Select Province'}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.province && <div className="invalid-feedback">{errors.province}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Municipality/City *</label>
                  <select 
                    className={`form-select ${errors.municipality ? 'is-invalid' : ''}`}
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleInputChange}
                    disabled={loadingMunicipalities || !formData.province}
                  >
                    <option value="">
                      {loadingMunicipalities 
                        ? 'Loading municipalities...' 
                        : !formData.province 
                          ? 'Select province first'
                          : 'Select Municipality/City'
                      }
                    </option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.code} value={municipality.name}>
                        {municipality.name}
                      </option>
                    ))}
                  </select>
                  {errors.municipality && <div className="invalid-feedback">{errors.municipality}</div>}
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Barangay</label>
                  <select 
                    className="form-select"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    disabled={loadingBarangays || !formData.municipality}
                  >
                    <option value="">
                      {loadingBarangays 
                        ? 'Loading barangays...' 
                        : !formData.municipality 
                          ? 'Select municipality first'
                          : 'Select Barangay'
                      }
                    </option>
                    {barangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.name}>
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
                    onChange={handleInputChange}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  name="isDefault"
                  id="setAsDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="setAsDefault">
                  Set as default address
                </label>
              </div>

              {/* Map Preview Section */}
              <div className="mt-4">
                <h6 className="mb-2">
                  <i className="bi bi-map me-1"></i>Location Preview
                </h6>
                <MapPreview />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              <i className="bi bi-x-lg me-1"></i>Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
            >
              <i className="bi bi-check-lg me-1"></i>Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

AddAddressModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}