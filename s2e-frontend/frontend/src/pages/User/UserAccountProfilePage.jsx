import { useState, useEffect } from 'react'
import { useAppState } from '../../context/AppContext.jsx'
import { psgcService } from '../../services/psgcAPI.js'
import { customerAPI } from '../../services/customerAPI.js'
import { psgcCoordinatesService } from '../../services/psgcCoordinatesService.js'
import { toast } from 'react-hot-toast'

export default function UserAccountProfilePage() {
  const { state } = useAppState()
  const { isLoggedIn } = state

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    province: '',
    municipality: '',
    barangay: '',
    address: ''
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])

  // Addresses state
  const [addresses, setAddresses] = useState([])
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [isEditingAddresses, setIsEditingAddresses] = useState(false)
  
  // PSGC data for address dropdowns
  const [addressProvinces, setAddressProvinces] = useState([])
  const [addressMunicipalities, setAddressMunicipalities] = useState({}) // keyed by address id
  const [addressBarangays, setAddressBarangays] = useState({}) // keyed by address id

  // Load profile from Medusa backend
  useEffect(() => {
    loadCustomerProfile()
    loadAddressProvinces().then(() => {
      loadAddresses()
    })
  }, [])
  
  // Load provinces for addresses
  const loadAddressProvinces = async () => {
    const data = await psgcService.getAllProvinces()
    setAddressProvinces(data)
    return data
  }

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
      document.head.appendChild(script)
    }
  }, [])

  const loadCustomerProfile = async () => {
    try {
      setLoading(true)
      console.log('🔍 Loading customer profile from Medusa backend...')
      
      const response = await customerAPI.getProfile()
      console.log('🔍 Customer profile response:', response)
      
      if (response.customer) {
        const customer = response.customer
        console.log('🔍 Customer data:', customer)
        
        // Extract address data from metadata if available
        const metadata = customer.metadata || {}
        const address = metadata.address || {}
        
        setProfile({
          first_name: customer.first_name || '',
          last_name: customer.last_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          province: address.province || '',
          municipality: address.municipality || '',
          barangay: address.barangay || '',
          address: metadata.complete_address || ''
        })
        
        console.log('🔍 Set profile data:', {
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          address: address
        })
      } else {
        console.warn('🔍 No customer data found in response')
        // Fallback to localStorage if available
        const storedProfile = localStorage.getItem('userProfile')
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile)
          setProfile({
            first_name: parsedProfile.first_name || parsedProfile.name || '',
            last_name: parsedProfile.last_name || '',
            email: parsedProfile.email || '',
            phone: parsedProfile.phone || '',
            province: parsedProfile.province || '',
            municipality: parsedProfile.municipality || '',
            barangay: parsedProfile.barangay || '',
            address: parsedProfile.address || ''
          })
        }
      }
    } catch (error) {
      console.error('🔍 Failed to load customer profile:', error)
      toast.error(`Failed to load profile: ${error.response?.data?.message || error.message}`)
      
      // Fallback to localStorage
      const storedProfile = localStorage.getItem('userProfile')
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile)
        setProfile({
          first_name: parsedProfile.first_name || parsedProfile.name || '',
          last_name: parsedProfile.last_name || '',
          email: parsedProfile.email || '',
          phone: parsedProfile.phone || '',
          province: parsedProfile.province || '',
          municipality: parsedProfile.municipality || '',
          barangay: parsedProfile.barangay || '',
          address: parsedProfile.address || ''
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // Load provinces from PSGC API
  useEffect(() => {
    async function loadProvinces() {
      const data = await psgcService.getAllProvinces()
      setProvinces(data)
    }
    loadProvinces()
  }, [])

  // Load municipalities when province changes
  useEffect(() => {
    async function loadMunicipalities() {
      if (profile.province) {
        const data = await psgcService.getMunicipalities(profile.province)
        setMunicipalities(data)
      } else {
        setMunicipalities([])
      }
    }
    loadMunicipalities()
  }, [profile.province])

  // Load barangays when municipality changes
  useEffect(() => {
    async function loadBarangays() {
      if (profile.municipality) {
        const data = await psgcService.getBarangays(profile.municipality)
        setBarangays(data)
      } else {
        setBarangays([])
      }
    }
    loadBarangays()
  }, [profile.municipality])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('💾 Saving profile to database...')
      
      // Get auth token
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      
      // Save to PHP backend
      const response = await fetch('http://localhost:8080/S2EH/s2e-backend/api/users/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          email: profile.email
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Profile saved:', data)

      // Update localStorage with new data
      localStorage.setItem('userProfile', JSON.stringify(profile))
      
      toast.success('✅ Profile updated successfully!')
      setIsEditing(false)
      
    } catch (error) {
      console.error('❌ Failed to save profile:', error)
      toast.error(`Failed to save profile: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Load addresses from database
  const loadAddresses = async () => {
    setAddressesLoading(true)
    try {
      console.log('🔍 Loading addresses from database...')
      
      // Get auth token
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      
      // Fetch addresses from API
      const response = await fetch('http://localhost:8080/S2EH/s2e-backend/api/addresses/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })

      console.log('✅ Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Addresses data:', data)

      const addressesData = data.data?.addresses || []
      
      // Map addresses to component format
      // Store both code and name for each address field
      // Note: addressProvinces should already be loaded
      const provinces = addressProvinces.length > 0 ? addressProvinces : await psgcService.getAllProvinces()
      
      const basicAddresses = addressesData.map(addr => {
        // Find province code by name
        const provinceObj = provinces.find(p => p.name === addr.province)
        const provinceCode = provinceObj ? provinceObj.code : ''
        
        return {
          id: addr.id,
          street: addr.address_line_1 || '',
          barangay: addr.barangay || '',
          barangayCode: '',
          city: addr.city || addr.municipality || '',
          municipality: addr.municipality || addr.city || '',
          municipalityCode: '',
          province: addr.province || '',
          provinceCode: provinceCode,
          postalCode: addr.postal_code || '',
          isDefault: addr.is_default === 1,
          coordinates: null,
          loadingCoordinates: true
        }
      })

      setAddresses(basicAddresses)
      setAddressesLoading(false)

      // Load PSGC data and coordinates for each address
      for (const addr of addressesData) {
        const currentAddress = basicAddresses.find(a => a.id === addr.id)
        
        // Load municipalities if province code exists
        if (currentAddress && currentAddress.provinceCode) {
          const municipalities = await psgcService.getMunicipalities(currentAddress.provinceCode)
          setAddressMunicipalities(prev => ({
            ...prev,
            [addr.id]: municipalities
          }))
          
          // Find municipality code by name
          if (addr.municipality || addr.city) {
            const municipalityObj = municipalities.find(m => m.name === (addr.municipality || addr.city))
            if (municipalityObj) {
              setAddresses(prev =>
                prev.map(a =>
                  a.id === addr.id
                    ? { ...a, municipalityCode: municipalityObj.code }
                    : a
                )
              )
              
              // Load barangays for this municipality
              const barangays = await psgcService.getBarangays(municipalityObj.code)
              setAddressBarangays(prev => ({
                ...prev,
                [addr.id]: barangays
              }))
              
              // Find barangay code by name
              if (addr.barangay) {
                const barangayObj = barangays.find(b => b.name === addr.barangay)
                if (barangayObj) {
                  setAddresses(prev =>
                    prev.map(a =>
                      a.id === addr.id
                        ? { ...a, barangayCode: barangayObj.code }
                        : a
                    )
                  )
                }
              }
            }
          }
        }
        
        // Fetch coordinates
        try {
          const coordinates = await psgcCoordinatesService.getCoordinatesWithMetadataFast(
            addr.province, 
            addr.municipality || addr.city, 
            addr.barangay
          )
          setAddresses(prev =>
            prev.map(a =>
              a.id === addr.id
                ? { ...a, coordinates, loadingCoordinates: false }
                : a
            )
          )
        } catch {
          setAddresses(prev =>
            prev.map(a =>
              a.id === addr.id
                ? { ...a, coordinates: null, loadingCoordinates: false }
                : a
            )
          )
        }
      }
    } catch (err) {
      console.error('❌ Failed to load addresses:', err)
      toast.error('Failed to load addresses')
      setAddressesLoading(false)
    }
  }

  // Address handlers
  const handleAddressChange = async (addressId, field, value) => {
    // Handle cascade updates for dropdowns (using codes)
    if (field === 'provinceCode') {
      // Find province name by code
      const provinceObj = addressProvinces.find(p => p.code === value)
      const provinceName = provinceObj ? provinceObj.name : ''
      
      // Load municipalities for this province
      const municipalities = await psgcService.getMunicipalities(value)
      setAddressMunicipalities(prev => ({
        ...prev,
        [addressId]: municipalities
      }))
      
      // Update address with province code and name, clear municipality and barangay
      setAddresses(prev =>
        prev.map(addr =>
          addr.id === addressId 
            ? { 
                ...addr, 
                provinceCode: value,
                province: provinceName,
                municipality: '', 
                municipalityCode: '',
                barangay: '', 
                barangayCode: '',
                postalCode: '',
                coordinates: null
              } 
            : addr
        )
      )
      setAddressBarangays(prev => ({
        ...prev,
        [addressId]: []
      }))
      
    } else if (field === 'municipalityCode') {
      // Find municipality name by code
      const municipalities = addressMunicipalities[addressId] || []
      const municipalityObj = municipalities.find(m => m.code === value)
      const municipalityName = municipalityObj ? municipalityObj.name : ''
      
      // Load barangays for this municipality
      const barangays = await psgcService.getBarangays(value)
      setAddressBarangays(prev => ({
        ...prev,
        [addressId]: barangays
      }))
      
      // Update address with municipality code and name, clear barangay
      setAddresses(prev =>
        prev.map(addr =>
          addr.id === addressId 
            ? { 
                ...addr, 
                municipalityCode: value,
                municipality: municipalityName,
                barangay: '', 
                barangayCode: '',
                postalCode: '',
                coordinates: null
              } 
            : addr
        )
      )
      
    } else if (field === 'barangayCode') {
      // Find barangay name by code
      const barangays = addressBarangays[addressId] || []
      const barangayObj = barangays.find(b => b.code === value)
      const barangayName = barangayObj ? barangayObj.name : ''
      
      // Auto-detect postal code and update coordinates
      const address = addresses.find(a => a.id === addressId)
      if (address && address.province && address.municipality) {
        // Update coordinates for map
        try {
          setAddresses(prev =>
            prev.map(addr =>
              addr.id === addressId ? { ...addr, loadingCoordinates: true } : addr
            )
          )
          
          const coordinates = await psgcCoordinatesService.getCoordinatesWithMetadataFast(
            address.province,
            address.municipality,
            barangayName
          )
          
          setAddresses(prev =>
            prev.map(addr =>
              addr.id === addressId 
                ? { 
                    ...addr, 
                    barangayCode: value,
                    barangay: barangayName,
                    coordinates, 
                    loadingCoordinates: false,
                    postalCode: coordinates.postalCode || addr.postalCode || ''
                  } 
                : addr
            )
          )
        } catch (error) {
          console.error('Failed to load coordinates:', error)
          setAddresses(prev =>
            prev.map(addr =>
              addr.id === addressId 
                ? { 
                    ...addr, 
                    barangayCode: value,
                    barangay: barangayName,
                    loadingCoordinates: false 
                  } 
                : addr
            )
          )
        }
      }
    } else {
      // For other fields (like street), just update normally
      setAddresses(prev =>
        prev.map(addr =>
          addr.id === addressId ? { ...addr, [field]: value } : addr
        )
      )
    }
  }

  const handleSaveAddresses = async () => {
    try {
      console.log('💾 Saving addresses to database...')
      
      // Get auth token
      const token = document.cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1]
      
      // Update each address
      for (const address of addresses) {
        const response = await fetch(`http://localhost:8080/S2EH/s2e-backend/api/addresses/${address.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            street: address.street,
            barangay: address.barangay,
            municipality: address.municipality,
            province: address.province,
            postalCode: address.postalCode
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to update address ${address.id}`)
        }

        console.log(`✅ Address ${address.id} updated`)
      }
      
      toast.success('Addresses saved successfully!')
      setIsEditingAddresses(false)
      
      // Reload addresses to get fresh data
      await loadAddresses()
      
    } catch (error) {
      console.error('❌ Failed to save addresses:', error)
      toast.error('Failed to save addresses: ' + error.message)
    }
  }

  // Leaflet Map Component
  const AddressMapComponent = ({ address }) => {
    const mapId = `address-map-${address.id}`

    useEffect(() => {
      if (!window.L || !address.coordinates) return
      const mapElement = document.getElementById(mapId)
      if (!mapElement) return

      const map = window.L.map(mapId).setView(
        [address.coordinates.lat, address.coordinates.lng],
        address.coordinates.zoom || 15
      )

      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      window.L.marker([address.coordinates.lat, address.coordinates.lng]).addTo(map)
      mapElement._leafletMap = map

      return () => {
        if (mapElement._leafletMap) mapElement._leafletMap.remove()
      }
    }, [address, mapId])

    return <div id={mapId} style={{ height: '100%', minHeight: '400px', width: '100%', borderRadius: '0.375rem' }}></div>
  }

  if (!isLoggedIn) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ minHeight: '50vh' }}
      >
        <div className="text-center">
          <h3>Please log in to access your profile</h3>
          <p className="text-muted">
            You need to be logged in to view and edit your profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="col-lg-9 col-md-8">
      <div className="profile-header bg-white border rounded p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">Profile</h2>
            <p className="text-muted mb-0">
              Manage your personal information
            </p>
          </div>
          <button
            className="btn btn-outline-primary"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="profile-details bg-white border rounded p-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading profile...</p>
          </div>
        ) : (
          <div className="row g-3">
            {/* First Name */}
            <div className="col-md-6">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Last Name */}
            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

          {/* Email */}
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {/* Phone */}
          <div className="col-md-6">
            <label className="form-label">Phone</label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
        )}

        {/* Save Button */}
        {isEditing && (
          <div className="d-flex justify-content-end mt-4">
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Addresses Section */}
      <div className="addresses-section mt-4">
        <div className="addresses-header bg-white border rounded p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Address</h2>
              <p className="text-muted mb-0">Manage your delivery addresses</p>
            </div>
            <button
              className="btn btn-outline-primary"
              onClick={() => setIsEditingAddresses((prev) => !prev)}
            >
              {isEditingAddresses ? 'Cancel' : 'Edit Addresses'}
            </button>
          </div>
        </div>

        <div className="addresses-details bg-white border rounded p-4">
          {addressesLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-geo-alt" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
              <h5 className="mt-3">No addresses found</h5>
              <p>Your delivery addresses will appear here</p>
            </div>
          ) : (
            addresses.map((address, index) => (
              <div key={address.id} className={`address-item ${index > 0 ? 'mt-4 pt-4 border-top' : ''}`}>
                <div className="row g-3">
                  {/* Left Column - Address Details */}
                  <div className="col-md-6">
                    <div className="row g-3">
                      {/* Street Address */}
                      <div className="col-12">
                        <label className="form-label">Street Address</label>
                        <input
                          type="text"
                          className="form-control"
                          value={address.street}
                          onChange={(e) => handleAddressChange(address.id, 'street', e.target.value)}
                          disabled={!isEditingAddresses}
                        />
                      </div>

                      {/* Province */}
                      <div className="col-md-6">
                        <label className="form-label">Province</label>
                        {isEditingAddresses ? (
                          <select
                            className="form-select"
                            value={address.provinceCode}
                            onChange={(e) => handleAddressChange(address.id, 'provinceCode', e.target.value)}
                          >
                            <option value="">Select Province</option>
                            {addressProvinces.map((prov) => (
                              <option key={prov.code} value={prov.code}>
                                {prov.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={address.province || ''}
                            readOnly
                            disabled
                          />
                        )}
                      </div>

                      {/* Municipality */}
                      <div className="col-md-6">
                        <label className="form-label">Municipality</label>
                        {isEditingAddresses ? (
                          <select
                            className="form-select"
                            value={address.municipalityCode}
                            onChange={(e) => handleAddressChange(address.id, 'municipalityCode', e.target.value)}
                            disabled={!address.provinceCode}
                          >
                            <option value="">Select Municipality</option>
                            {(addressMunicipalities[address.id] || []).map((mun) => (
                              <option key={mun.code} value={mun.code}>
                                {mun.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={address.municipality || ''}
                            readOnly
                            disabled
                          />
                        )}
                      </div>

                      {/* Barangay */}
                      <div className="col-md-6">
                        <label className="form-label">Barangay</label>
                        {isEditingAddresses ? (
                          <select
                            className="form-select"
                            value={address.barangayCode}
                            onChange={(e) => handleAddressChange(address.id, 'barangayCode', e.target.value)}
                            disabled={!address.municipalityCode}
                          >
                            <option value="">Select Barangay</option>
                            {(addressBarangays[address.id] || []).map((brgy) => (
                              <option key={brgy.code} value={brgy.code}>
                                {brgy.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="form-control"
                            value={address.barangay || ''}
                            readOnly
                            disabled
                          />
                        )}
                      </div>

                      {/* Postal Code - Auto-detected */}
                      <div className="col-md-6">
                        <label className="form-label">Postal Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={address.postalCode}
                          readOnly
                          disabled
                          placeholder="Auto-detected"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Map */}
                  <div className="col-md-6">
                    <div style={{ height: '100%', minHeight: '400px' }}>
                      {address.loadingCoordinates ? (
                        <div className="d-flex align-items-center justify-content-center bg-light border rounded h-100">
                          <div className="text-center text-muted">
                            <div className="spinner-border spinner-border-sm mb-2" role="status"></div>
                            <div>Loading map...</div>
                          </div>
                        </div>
                      ) : address.coordinates ? (
                        <AddressMapComponent address={address} />
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
            ))
          )}

          {/* Save Button */}
          {isEditingAddresses && addresses.length > 0 && (
            <div className="d-flex justify-content-end mt-4">
              <button 
                className="btn btn-primary" 
                onClick={handleSaveAddresses}
              >
                Save Addresses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}