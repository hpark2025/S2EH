import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { psgcService } from '../../../services/psgcAPI'
import { getLocationCoordinates } from '../../../services/geocodingService'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const AddressEditModal = ({ show, onClose, onSave, initialAddress = {} }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    province: initialAddress.province_code || '',
    municipality: initialAddress.municipality_code || '',
    barangay: initialAddress.barangay_code || '',
    street: initialAddress.street || '',
    postalCode: initialAddress.postal_code || '',
    landmark: initialAddress.landmark || ''
  })

  // PSGC data states
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  // Map state
  const [mapCoordinates, setMapCoordinates] = useState(null)
  const [loadingMap, setLoadingMap] = useState(false)
  const [provinceNames, setProvinceNames] = useState({})
  const [municipalityNames, setMunicipalityNames] = useState({})
  const [barangayNames, setBarangayNames] = useState({})

  // Load provinces on component mount
  useEffect(() => {
    if (show) {
      const loadProvinces = async () => {
        setLoadingProvinces(true)
        try {
          const data = await psgcService.getAllProvinces()
          setProvinces(data || [])
          console.log('✅ Loaded provinces:', data?.length)
        } catch (error) {
          console.error('Failed to load provinces:', error)
        } finally {
          setLoadingProvinces(false)
        }
      }

      loadProvinces()
    }
  }, [show])

  // Load municipalities when province changes
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
        if (!initialAddress.province_code) {
          setFormData(prev => ({ ...prev, municipality: '', barangay: '' }))
        }
        console.log('✅ Loaded municipalities:', data?.length)
      } catch (error) {
        console.error('Failed to load municipalities:', error)
      } finally {
        setLoadingMunicipalities(false)
      }
    }

    if (formData.province) {
      loadMunicipalities()
    }
  }, [formData.province, initialAddress.province_code])

  // Load barangays when municipality changes
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
        if (!initialAddress.municipality_code) {
          setFormData(prev => ({ ...prev, barangay: '' }))
        }
        console.log('✅ Loaded barangays:', data?.length)
      } catch (error) {
        console.error('Failed to load barangays:', error)
      } finally {
        setLoadingBarangays(false)
      }
    }

    if (formData.municipality) {
      loadBarangays()
    }
  }, [formData.municipality, initialAddress.municipality_code])

  // Load initial address data if available
  useEffect(() => {
    if (show && initialAddress.province_code && initialAddress.municipality_code && initialAddress.barangay_code) {
      setFormData({
        province: initialAddress.province_code,
        municipality: initialAddress.municipality_code,
        barangay: initialAddress.barangay_code,
        street: initialAddress.street || '',
        postalCode: initialAddress.postal_code || '',
        landmark: initialAddress.landmark || ''
      })
    }
  }, [show, initialAddress])

  const handleInputChange = async (e) => {
    const { name, value } = e.target
    
    // Update form data
    const updatedFormData = {
      ...formData,
      [name]: value
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
        
        // Geocode the complete address
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
  }

  // Geocode address for map display
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Get the actual names (not codes) for location data
      const selectedProvince = provinces.find(p => p.code === formData.province)
      const selectedMunicipality = municipalities.find(m => m.code === formData.municipality)
      const selectedBarangay = barangays.find(b => b.code === formData.barangay)

      const addressData = {
        province: selectedProvince?.name || '',
        municipality: selectedMunicipality?.name || '',
        barangay: selectedBarangay?.name || '',
        province_code: formData.province,
        municipality_code: formData.municipality,
        barangay_code: formData.barangay,
        street: formData.street,
        postal_code: formData.postalCode,
        landmark: formData.landmark,
        coordinates: mapCoordinates ? {
          lat: mapCoordinates.lat,
          lng: mapCoordinates.lng
        } : null
      }

      // Call the save function passed from parent
      await onSave(addressData)
      onClose()
    } catch (error) {
      console.error('Error saving address:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-geo-alt me-2"></i>Edit Address
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="alert alert-info mb-3" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Update your address information to ensure accurate delivery and location services.
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="province" className="form-label">Province *</label>
                  <select 
                    className="form-control" 
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

                <div className="mb-3">
                  <label htmlFor="municipality" className="form-label">Municipality/City *</label>
                  <select 
                    className="form-control" 
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

                <div className="mb-3">
                  <label htmlFor="barangay" className="form-label">Barangay *</label>
                  <select 
                    className="form-control" 
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

                <div className="mb-3">
                  <label htmlFor="street" className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="House/Lot #, Street Name"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="postalCode" className="form-label">Postal Code</label>
                    <input
                      type="text"
                      className="form-control"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 4403"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="landmark" className="form-label">Landmark</label>
                    <input
                      type="text"
                      className="form-control"
                      id="landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="e.g. Near the church"
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  <i className="bi bi-map me-2"></i>
                  Location Preview
                </label>
                <div style={{ 
                  height: '300px', 
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

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
              style={{ minWidth: '100px' }}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving || !formData.province || !formData.municipality || !formData.barangay}
              style={{ minWidth: '150px' }}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>Save Address
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

AddressEditModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialAddress: PropTypes.object
}

export default AddressEditModal
