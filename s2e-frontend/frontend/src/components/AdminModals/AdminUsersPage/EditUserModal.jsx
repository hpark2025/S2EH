import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { psgcService } from '../../../services/psgcAPI.js'

const EditUserModal = ({ show, onClose, onEdit, user }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    province: '',
    municipality: '',
    barangay: '',
    role: 'Customer'
  })

  // PSGC data states
  const [provinces, setProvinces] = useState([])
  const [municipalities, setMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  // Load provinces on component mount
  useEffect(() => {
    if (show) {
      loadProvinces()
    }
  }, [show])

  useEffect(() => {
    if (user) {
      // Parse the name if it exists and split into parts
      const fullName = user.name || ''
      const nameParts = fullName.trim().split(' ')
      
      setFormData({
        first_name: user.first_name || nameParts[0] || '',
        middle_name: user.middle_name || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''),
        last_name: user.last_name || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''),
        phone: user.phone || '',
        province: user.province || '',
        municipality: user.municipality || '',
        barangay: user.barangay || '',
        role: user.role || 'Customer'
      })
      
      // Load location data if user has location info
      if (user.province) {
        loadMunicipalities(user.province)
      }
      if (user.municipality) {
        loadBarangays(user.municipality)
      }
    }
  }, [user])

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

  const loadMunicipalities = async (provinceName) => {
    if (!provinceName) {
      setMunicipalities([])
      setBarangays([])
      return
    }

    setLoadingMunicipalities(true)
    try {
      const data = await psgcService.getMunicipalitiesByProvince(provinceName)
      setMunicipalities(data || [])
    } catch (error) {
      console.error('Failed to load municipalities:', error)
    } finally {
      setLoadingMunicipalities(false)
    }
  }

  const loadBarangays = async (municipalityName) => {
    if (!municipalityName) {
      setBarangays([])
      return
    }

    setLoadingBarangays(true)
    try {
      const data = await psgcService.getBarangaysByMunicipality(municipalityName)
      setBarangays(data || [])
    } catch (error) {
      console.error('Failed to load barangays:', error)
    } finally {
      setLoadingBarangays(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onEdit(user.id, formData)
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Handle cascading location dropdowns
    if (name === 'province') {
      setFormData(prev => ({
        ...prev,
        province: value,
        municipality: '',
        barangay: ''
      }))
      loadMunicipalities(value)
      setBarangays([])
    } else if (name === 'municipality') {
      setFormData(prev => ({
        ...prev,
        municipality: value,
        barangay: ''
      }))
      loadBarangays(value)
    }
  }

  if (!show || !user) return null

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit User</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="editUserFirstName" className="form-label">First Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="editUserFirstName"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editUserMiddleName" className="form-label">Middle Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="editUserMiddleName"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editUserLastName" className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="editUserLastName"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editUserPhone" className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  id="editUserPhone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="editUserProvince" className="form-label">Province</label>
                <select 
                  className="form-select" 
                  id="editUserProvince" 
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  disabled={loadingProvinces}
                  required
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
              </div>

              <div className="mb-3">
                <label htmlFor="editUserMunicipality" className="form-label">Municipality/City</label>
                <select 
                  className="form-select" 
                  id="editUserMunicipality" 
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  disabled={loadingMunicipalities || !formData.province}
                  required
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
              </div>

              <div className="mb-3">
                <label htmlFor="editUserBarangay" className="form-label">Barangay</label>
                <select 
                  className="form-select" 
                  id="editUserBarangay" 
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  disabled={loadingBarangays || !formData.municipality}
                  required
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
            </form>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

EditUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  user: PropTypes.object
}

export default EditUserModal