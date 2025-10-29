import { useState, useEffect } from 'react'
import { useAppState } from '../../context/AppContext.jsx'
import { AddAddressModal, EditAddressModal, DeleteAddressModal } from '../../components/UserModals'
import { psgcCoordinatesService } from '../../services/psgcCoordinatesService.js'

export default function UserAccountSettingsPage() {
  const { state } = useAppState()
  const { isLoggedIn } = state

  // State for addresses and modals
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [deletingAddress, setDeletingAddress] = useState(null)

  // Load addresses on mount (mock data)
  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    setLoading(true)
    setError('')
    try {
      // Mock example data
      const response = {
        success: true,
        data: {
          addresses: [
            {
              id: 1,
              label: 'Home',
              recipientName: 'Juan Dela Cruz',
              phone: '09123456789',
              streetAddress: 'Purok 5, Zone 2',
              barangay: 'Tinago',
              municipality: 'Sagnay',
              province: 'Camarines Sur',
              postalCode: '4421',
              isDefault: true
            }
          ]
        }
      }

      const basicAddresses = response.data.addresses.map(addr => ({
        id: addr.id,
        label: addr.label,
        name: addr.recipientName,
        phone: addr.phone,
        street: addr.streetAddress,
        barangay: addr.barangay,
        city: addr.municipality,
        municipality: addr.municipality,
        province: addr.province,
        postalCode: addr.postalCode,
        isDefault: addr.isDefault,
        coordinates: null,
        loadingCoordinates: true
      }))

      setAddresses(basicAddresses)
      setLoading(false)

      // Fetch coordinates asynchronously
      for (const addr of response.data.addresses) {
        try {
          const coordinates = await getAddressCoordinates(addr.province, addr.municipality, addr.barangay)
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
      console.error(err)
      setError('Failed to load addresses.')
      setLoading(false)
    }
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

  // Get PSGC coordinates
  const getAddressCoordinates = async (province, municipality, barangay = null) => {
    try {
      return await psgcCoordinatesService.getCoordinatesWithMetadataFast(province, municipality, barangay)
    } catch {
      return null
    }
  }

  // Local UI handlers (no backend)
  const handleAddAddress = () => setShowAddModal(true)
  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setShowEditModal(true)
  }
  const handleSaveNewAddress = (addressData) => {
    const newAddress = {
      id: Date.now(),
      label: addressData.label,
      name: addressData.fullName,
      phone: addressData.phoneNumber,
      street: addressData.streetAddress,
      barangay: addressData.barangay,
      city: addressData.municipality,
      municipality: addressData.municipality,
      province: addressData.province,
      postalCode: addressData.postalCode,
      isDefault: addressData.isDefault,
      coordinates: null,
      loadingCoordinates: true
    }
    setAddresses(prev => [...prev, newAddress])
    setShowAddModal(false)
    alert('Address added locally!')
  }

  const handleSaveEditedAddress = (addressData) => {
    setAddresses(prev =>
      prev.map(a =>
        a.id === editingAddress.id
          ? { ...a, ...addressData, name: addressData.fullName, phone: addressData.phoneNumber }
          : a
      )
    )
    setShowEditModal(false)
    setEditingAddress(null)
    alert('Address updated locally!')
  }

  const handleSetDefault = (addressId) => {
    setAddresses(prev =>
      prev.map(a => ({ ...a, isDefault: a.id === addressId }))
    )
    alert('Default address updated locally!')
  }

  const handleDeleteAddressClick = (address) => {
    setDeletingAddress(address)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    setAddresses(prev => prev.filter(a => a.id !== deletingAddress.id))
    setShowDeleteModal(false)
    setDeletingAddress(null)
    alert('Address deleted locally!')
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

    return <div id={mapId} style={{ height: '200px', width: '100%' }}></div>
  }

  return (
    <>
      <div className="col-lg-9 col-md-8">
        <div className="addresses-header bg-white border rounded p-4 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">My Addresses</h2>
              <p className="text-muted mb-0">Manage your delivery addresses</p>
            </div>
            <button className="btn btn-primary" onClick={handleAddAddress}>
              <i className="bi bi-plus me-1"></i>Add New Address
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading addresses...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : addresses.length === 0 ? (
          <div className="text-center text-muted p-5 bg-white border rounded">
            <h5>No addresses found</h5>
            <button className="btn btn-primary mt-3" onClick={handleAddAddress}>
              <i className="bi bi-plus me-1"></i>Add Address
            </button>
          </div>
        ) : (
          addresses.map(address => (
            <div key={address.id} className="address-card bg-white border rounded p-4 mb-3">
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5>{address.label}</h5>
                      {address.isDefault && <span className="badge bg-primary">Default</span>}
                      <p className="mb-1"><strong>{address.name}</strong></p>
                      <p className="mb-1">{address.phone}</p>
                      <p className="mb-2 text-muted">
                        {address.street}<br />
                        {address.barangay && `Barangay ${address.barangay}, `}
                        {address.city}, {address.province} {address.postalCode}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-secondary w-100"
                      onClick={() => handleEditAddress(address)}
                    >
                      <i className="bi bi-pencil me-1"></i>Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        className="btn btn-sm btn-outline-primary w-100 mt-2"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <i className="bi bi-star me-1"></i>Set as Default
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-danger w-100 mt-2"
                      onClick={() => handleDeleteAddressClick(address)}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  {address.loadingCoordinates ? (
                    <div className="text-center py-5 text-muted">Loading map...</div>
                  ) : address.coordinates ? (
                    <AddressMapComponent address={address} />
                  ) : (
                    <div className="text-center py-5 text-muted">Location not available</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <AddAddressModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveNewAddress}
      />
      <EditAddressModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingAddress(null)
        }}
        address={editingAddress}
        onSave={handleSaveEditedAddress}
      />
      <DeleteAddressModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingAddress(null)
        }}
        address={deletingAddress}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
