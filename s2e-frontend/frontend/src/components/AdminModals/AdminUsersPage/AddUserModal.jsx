import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { psgcService } from '../../../services/psgcAPI.js'

const AddUserModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    province: '',
    municipality: '',
    barangay: '',
    role: 'customer' // Fixed to customer since this is for adding customers only
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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Combine location fields for API compatibility
    const locationData = {
      ...formData,
      location: `${formData.barangay}, ${formData.municipality}, ${formData.province}`.replace(/^, |, $/g, '')
    }
    onAdd(locationData)
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      phone: '',
      province: '',
      municipality: '',
      barangay: '',
      role: 'customer' // Always customer for this modal
    })
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

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

  if (!show) return null

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Customer</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="userFirstName" className="form-label">First Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="userFirstName"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="userMiddleName" className="form-label">Middle Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="userMiddleName"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="userLastName" className="form-label">Last Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="userLastName"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="userPhone" className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  id="userPhone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="userProvince" className="form-label">Province</label>
                <select 
                  className="form-select" 
                  id="userProvince" 
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
                <label htmlFor="userMunicipality" className="form-label">Municipality/City</label>
                <select 
                  className="form-select" 
                  id="userMunicipality" 
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
                <label htmlFor="userBarangay" className="form-label">Barangay</label>
                <select 
                  className="form-select" 
                  id="userBarangay" 
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
              Add Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

AddUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired
}

export default AddUserModal