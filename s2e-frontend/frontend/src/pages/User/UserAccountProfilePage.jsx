import { useState, useEffect } from 'react'
import { useAppState } from '../../context/AppContext.jsx'
import { psgcService } from '../../services/psgcAPI.js'
import { customerAPI } from '../../services/customerAPI.js'
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

  // Load profile from Medusa backend
  useEffect(() => {
    loadCustomerProfile()
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
      console.log('🔍 Saving customer profile to Medusa backend...')
      
      // Prepare data for Medusa backend
      const profileData = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        metadata: {
          address: {
            province: profile.province,
            municipality: profile.municipality,
            barangay: profile.barangay
          },
          complete_address: profile.address,
          // Keep existing metadata
          ...(profile.metadata || {})
        }
      }
      
      console.log('🔍 Profile data to save:', profileData)
      
      const response = await customerAPI.updateProfile(profileData)
      console.log('🔍 Profile update response:', response)
      
      if (response.customer) {
        // Update localStorage with new data
        localStorage.setItem('user', JSON.stringify(response.customer))
        localStorage.setItem('userProfile', JSON.stringify(profile))
        
        toast.success('✅ Profile updated successfully!')
        setIsEditing(false)
      } else {
        throw new Error('No customer data in response')
      }
    } catch (error) {
      console.error('🔍 Failed to save profile:', error)
      toast.error(`Failed to save profile: ${error.response?.data?.message || error.message}`)
    } finally {
      setSaving(false)
    }
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
            <h2 className="mb-1">My Profile</h2>
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

          {/* Province */}
          <div className="col-md-6">
            <label className="form-label">Province</label>
            <select
              className="form-select"
              name="province"
              value={profile.province}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Select Province</option>
              {provinces.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {/* Municipality */}
          <div className="col-md-6">
            <label className="form-label">Municipality</label>
            <select
              className="form-select"
              name="municipality"
              value={profile.municipality}
              onChange={handleChange}
              disabled={!isEditing || !profile.province}
            >
              <option value="">Select Municipality</option>
              {municipalities.map((mun) => (
                <option key={mun.code} value={mun.code}>
                  {mun.name}
                </option>
              ))}
            </select>
          </div>

          {/* Barangay */}
          <div className="col-md-6">
            <label className="form-label">Barangay</label>
            <select
              className="form-select"
              name="barangay"
              value={profile.barangay}
              onChange={handleChange}
              disabled={!isEditing || !profile.municipality}
            >
              <option value="">Select Barangay</option>
              {barangays.map((brgy) => (
                <option key={brgy.code} value={brgy.code}>
                  {brgy.name}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="col-12">
            <label className="form-label">Complete Address</label>
            <textarea
              className="form-control"
              name="address"
              rows="2"
              value={profile.address}
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
    </div>
  )
}