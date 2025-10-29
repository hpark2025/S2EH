import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../../services/sellerAPI';
import StockLocationForm from '../../components/StockLocationForm.jsx';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLocationCoordinates } from '../../services/geocodingService';
import { psgcService } from '../../services/psgcAPI';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SellerStockLocationsPage() {
  const [stockLocations, setStockLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // PSGC states
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Map state
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [loadingMap, setLoadingMap] = useState(false);

  // Form state for adding/editing stock locations
  const [formData, setFormData] = useState({
    name: '',
    address: {
      address_1: '', // Will store barangay name
      city: '', // Municipality name
      province: '', // Province name
      postal_code: '',
      country_code: 'ph' // Default to Philippines
    },
    barangayCode: '',
    municipalityCode: '',
    provinceCode: ''
  });

  useEffect(() => {
    loadStockLocations();
    loadProvinces();
  }, []);

  // Load PSGC provinces
  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const data = await psgcService.getProvinces();
      setProvinces(data);
      console.log('✅ Loaded provinces:', data.length);
    } catch (error) {
      console.error('Failed to load provinces:', error);
      toast.error('Failed to load provinces');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Load municipalities when province is selected
  const loadMunicipalities = async (provinceCode) => {
    setLoadingMunicipalities(true);
    setMunicipalities([]);
    setBarangays([]);
    try {
      const data = await psgcService.getMunicipalities(provinceCode);
      setMunicipalities(data);
      console.log('✅ Loaded municipalities:', data.length);
    } catch (error) {
      console.error('Failed to load municipalities:', error);
      toast.error('Failed to load municipalities');
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  // Load barangays when municipality is selected
  const loadBarangays = async (municipalityCode) => {
    setLoadingBarangays(true);
    setBarangays([]);
    try {
      const data = await psgcService.getBarangays(municipalityCode);
      setBarangays(data);
      console.log('✅ Loaded barangays:', data.length);
    } catch (error) {
      console.error('Failed to load barangays:', error);
      toast.error('Failed to load barangays');
    } finally {
      setLoadingBarangays(false);
    }
  };

  // Geocode location for map
  const geocodeLocation = async (province, municipality, barangay) => {
    if (!province || !municipality || !barangay) {
      setMapCoordinates(null);
      return;
    }

    setLoadingMap(true);
    try {
      const result = await getLocationCoordinates(province, municipality, barangay);
      if (result && result.lat && result.lng) {
        setMapCoordinates({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lng),
          zoom: result.zoom || 15
        });
        
        // Update postal code if available
        if (result.postal_code) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              postal_code: result.postal_code
            }
          }));
        }
      }
    } catch (error) {
      console.error('Failed to geocode location:', error);
    } finally {
      setLoadingMap(false);
    }
  };

  const loadStockLocations = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.stockLocations.getStockLocations();
      setStockLocations(response.stock_locations || []);
    } catch (error) {
      console.error('Failed to load stock locations:', error);
      toast.error('Failed to load stock locations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStockLocation = async (e) => {
    e.preventDefault();
    try {
      console.log('📤 Sending stock location data:', formData);
      
      // Validate required fields
      if (!formData.name || !formData.provinceCode || !formData.municipalityCode || !formData.barangayCode) {
        toast.error('Please fill in all required fields (Location Name, Province, Municipality, Barangay)');
        return;
      }
      
      // Simple stock location format
      const stockLocationData = {
        name: formData.name,
        address: {
          address_1: formData.address.address_1, // Barangay
          city: formData.address.city, // Municipality
          province: formData.address.province,
          postal_code: formData.address.postal_code || '',
          country_code: 'ph' // Always Philippines
        }
      };

      const cleanData = stockLocationData;

      console.log('📤 Creating stock location:', cleanData);
      
      const response = await sellerAPI.stockLocations.createStockLocation(cleanData);
      console.log('✅ Stock location created successfully:', response);
      
      toast.success('Stock location created successfully!');
      setShowAddModal(false);
      resetFormData();
      setMapCoordinates(null);
      loadStockLocations();
      
    } catch (error) {
      console.error('❌ Failed to create stock location:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create stock location';
      toast.error(`Failed to create stock location: ${errorMessage}`);
    }
  };

  const handleEditStockLocation = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.provinceCode || !formData.municipalityCode || !formData.barangayCode) {
        toast.error('Please fill in all required fields (Location Name, Province, Municipality, Barangay)');
        return;
      }

      // Prepare location data
      const stockLocationData = {
        name: formData.name,
        address: {
          address_1: formData.address.address_1, // Barangay
          city: formData.address.city, // Municipality
          province: formData.address.province,
          postal_code: formData.address.postal_code || '',
          country_code: 'ph'
        }
      };

      await sellerAPI.stockLocations.updateStockLocation(editingLocation.id, stockLocationData);
      toast.success('Stock location updated successfully!');
      setShowEditModal(false);
      setEditingLocation(null);
      resetFormData();
      setMapCoordinates(null);
      loadStockLocations();
    } catch (error) {
      console.error('Failed to update stock location:', error);
      toast.error('Failed to update stock location');
    }
  };

  const handleDeleteStockLocation = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this stock location?')) {
      try {
        await sellerAPI.stockLocations.deleteStockLocation(locationId);
        toast.success('Stock location deleted successfully!');
        loadStockLocations();
      } catch (error) {
        console.error('Failed to delete stock location:', error);
        toast.error('Failed to delete stock location');
      }
    }
  };

  const openEditModal = async (location) => {
    setEditingLocation(location);
    
    // Find province code from name
    const province = provinces.find(p => p.name === location.address?.province);
    const provinceCode = province?.code || '';
    
    setFormData({
      name: location.name || '',
      address: {
        address_1: location.address?.address_1 || '',
        city: location.address?.city || '',
        province: location.address?.province || '',
        postal_code: location.address?.postal_code || '',
        country_code: 'ph'
      },
      provinceCode: provinceCode,
      municipalityCode: '',
      barangayCode: '',
      metadata: location.metadata || {}
    });

    // Load municipalities if province is set
    if (provinceCode) {
      await loadMunicipalities(provinceCode);
      
      // After municipalities are loaded, find and set municipality code
      const munis = await psgcService.getMunicipalities(provinceCode);
      const municipality = munis.find(m => m.name === location.address?.city);
      const municipalityCode = municipality?.code || '';
      
      if (municipalityCode) {
        // Load barangays
        await loadBarangays(municipalityCode);
        
        // After barangays are loaded, find and set barangay code
        const brgy = await psgcService.getBarangays(municipalityCode);
        const barangay = brgy.find(b => b.name === location.address?.address_1);
        const barangayCode = barangay?.code || '';
        
        // Update form data with codes
        setFormData(prev => ({
          ...prev,
          municipalityCode: municipalityCode,
          barangayCode: barangayCode
        }));

        // Geocode location for map
        if (location.address?.province && location.address?.city && location.address?.address_1) {
          geocodeLocation(location.address.province, location.address.city, location.address.address_1);
        }
      }
    }

    setShowEditModal(true);
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      address: {
        address_1: '',
        city: '',
        province: '',
        postal_code: '',
        country_code: 'ph'
      },
      barangayCode: '',
      municipalityCode: '',
      provinceCode: ''
    });
    setMunicipalities([]);
    setBarangays([]);
    setMapCoordinates(null);
  };

  const filteredLocations = stockLocations.filter(location => {
    const matchesSearch = location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address?.province?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getLocationStats = () => {
    return {
      total: stockLocations.length,
      active: stockLocations.filter(l => l.metadata?.status !== 'inactive').length,
      inactive: stockLocations.filter(l => l.metadata?.status === 'inactive').length
    };
  };

  const stats = getLocationStats();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-stock-locations-page">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stock Locations</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Stock Location
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="bi bi-geo-alt display-6"></i>
              <h4 className="mt-2">{stats.total}</h4>
              <small>Total Locations</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="bi bi-check-circle display-6"></i>
              <h4 className="mt-2">{stats.active}</h4>
              <small>Active Locations</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-white">
            <div className="card-body text-center">
              <i className="bi bi-pause-circle display-6"></i>
              <h4 className="mt-2">{stats.inactive}</h4>
              <small>Inactive Locations</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="text-end">
            <span className="badge bg-info">
              {filteredLocations.length} locations
            </span>
          </div>
        </div>
      </div>

      {/* Stock Locations Table */}
      <div className="card">
        <div className="card-body">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-geo-alt display-1 text-muted"></i>
              <h4 className="mt-3">No stock locations found</h4>
              <p className="text-muted">Start by adding your first stock location</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Location
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Barangay</th>
                    <th>Municipality</th>
                    <th>Province</th>
                    <th>Zip Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((location) => (
                    <tr key={location.id}>
                      <td>
                        <div>
                          <h6 className="mb-0">{location.name}</h6>
                          <small className="text-muted">ID: {location.id}</small>
                        </div>
                      </td>
                      <td>{location.address?.address_1 || 'N/A'}</td>
                      <td>{location.address?.city || 'N/A'}</td>
                      <td>{location.address?.province || 'N/A'}</td>
                      <td>{location.address?.postal_code || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          location.metadata?.status === 'inactive' ? 'bg-secondary' : 'bg-success'
                        }`}>
                          {location.metadata?.status || 'active'}
                        </span>
                      </td>
                      <td>
                        {new Date(location.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(location)}
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteStockLocation(location.id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Location Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Stock Location</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    resetFormData();
                  }}
                ></button>
              </div>
              <form onSubmit={handleAddStockLocation}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Location Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder="e.g., Main Warehouse, Store Location"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Province *</label>
                      <select
                        className="form-select"
                        value={formData.provinceCode}
                        onChange={(e) => {
                          const selectedProvince = provinces.find(p => p.code === e.target.value);
                          setFormData({
                            ...formData,
                            provinceCode: e.target.value,
                            address: {...formData.address, province: selectedProvince?.name || ''},
                            municipalityCode: '',
                            barangayCode: ''
                          });
                          loadMunicipalities(e.target.value);
                          setMapCoordinates(null);
                        }}
                        required
                        disabled={loadingProvinces}
                      >
                        <option value="">Select Province</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Municipality *</label>
                      <select
                        className="form-select"
                        value={formData.municipalityCode}
                        onChange={(e) => {
                          const selectedMunicipality = municipalities.find(m => m.code === e.target.value);
                          setFormData({
                            ...formData,
                            municipalityCode: e.target.value,
                            address: {...formData.address, city: selectedMunicipality?.name || ''},
                            barangayCode: ''
                          });
                          loadBarangays(e.target.value);
                          setMapCoordinates(null);
                        }}
                        required
                        disabled={!formData.provinceCode || loadingMunicipalities}
                      >
                        <option value="">Select Municipality</option>
                        {municipalities.map((municipality) => (
                          <option key={municipality.code} value={municipality.code}>
                            {municipality.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Barangay *</label>
                      <select
                        className="form-select"
                        value={formData.barangayCode}
                        onChange={(e) => {
                          const selectedBarangay = barangays.find(b => b.code === e.target.value);
                          setFormData({
                            ...formData,
                            barangayCode: e.target.value,
                            address: {...formData.address, address_1: selectedBarangay?.name || ''}
                          });
                          if (formData.address.province && formData.address.city && selectedBarangay?.name) {
                            geocodeLocation(formData.address.province, formData.address.city, selectedBarangay.name);
                          }
                        }}
                        required
                        disabled={!formData.municipalityCode || loadingBarangays}
                      >
                        <option value="">Select Barangay</option>
                        {barangays.map((barangay) => (
                          <option key={barangay.code} value={barangay.code}>
                            {barangay.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.postal_code}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: {...formData.address, postal_code: e.target.value}
                        })}
                        placeholder="Zip code (auto-filled)"
                        readOnly
                      />
                      <small className="text-muted">Auto-filled when location is selected</small>
                    </div>

                    {/* Map Preview */}
                    {mapCoordinates && (
                      <div className="col-12 mb-3">
                        <label className="form-label">Location Preview</label>
                        <div style={{ height: '300px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
                          <MapContainer
                            center={[mapCoordinates.lat, mapCoordinates.lng]}
                            zoom={mapCoordinates.zoom || 15}
                            style={{ height: '100%', width: '100%' }}
                            dragging={false}
                            zoomControl={false}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            touchZoom={false}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[mapCoordinates.lat, mapCoordinates.lng]}>
                              <Popup>
                                {formData.address.address_1 && `${formData.address.address_1}, `}
                                {formData.address.city}, {formData.address.province}
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      </div>
                    )}

                    {loadingMap && (
                      <div className="col-12 mb-3 text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading map...</span>
                        </div>
                        <small className="text-muted ms-2">Loading map...</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      resetFormData();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stock Location Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Stock Location</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLocation(null);
                    resetFormData();
                  }}
                ></button>
              </div>
              <form onSubmit={handleEditStockLocation}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Location Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Province *</label>
                      <select
                        className="form-select"
                        value={formData.provinceCode}
                        onChange={(e) => {
                          const selectedProvince = provinces.find(p => p.code === e.target.value);
                          setFormData({
                            ...formData,
                            provinceCode: e.target.value,
                            address: {...formData.address, province: selectedProvince?.name || ''},
                            municipalityCode: '',
                            barangayCode: ''
                          });
                          loadMunicipalities(e.target.value);
                          setMapCoordinates(null);
                        }}
                        required
                        disabled={loadingProvinces}
                      >
                        <option value="">Select Province</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Municipality *</label>
                      <select
                        className="form-select"
                        value={formData.municipalityCode}
                        onChange={(e) => {
                          const selectedMunicipality = municipalities.find(m => m.code === e.target.value);
                          setFormData({
                            ...formData,
                            municipalityCode: e.target.value,
                            address: {...formData.address, city: selectedMunicipality?.name || ''},
                            barangayCode: ''
                          });
                          loadBarangays(e.target.value);
                          setMapCoordinates(null);
                        }}
                        required
                        disabled={!formData.provinceCode || loadingMunicipalities}
                      >
                        <option value="">Select Municipality</option>
                        {municipalities.map((municipality) => (
                          <option key={municipality.code} value={municipality.code}>
                            {municipality.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Barangay *</label>
                      <select
                        className="form-select"
                        value={formData.barangayCode}
                        onChange={(e) => {
                          const selectedBarangay = barangays.find(b => b.code === e.target.value);
                          setFormData({
                            ...formData,
                            barangayCode: e.target.value,
                            address: {...formData.address, address_1: selectedBarangay?.name || ''}
                          });
                          if (formData.address.province && formData.address.city && selectedBarangay?.name) {
                            geocodeLocation(formData.address.province, formData.address.city, selectedBarangay.name);
                          }
                        }}
                        required
                        disabled={!formData.municipalityCode || loadingBarangays}
                      >
                        <option value="">Select Barangay</option>
                        {barangays.map((barangay) => (
                          <option key={barangay.code} value={barangay.code}>
                            {barangay.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.postal_code}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: {...formData.address, postal_code: e.target.value}
                        })}
                        placeholder="Zip code (auto-filled)"
                        readOnly
                      />
                      <small className="text-muted">Auto-filled when location is selected</small>
                    </div>

                    {/* Map Preview */}
                    {mapCoordinates && (
                      <div className="col-12 mb-3">
                        <label className="form-label">Location Preview</label>
                        <div style={{ height: '300px', border: '1px solid #dee2e6', borderRadius: '4px', overflow: 'hidden' }}>
                          <MapContainer
                            center={[mapCoordinates.lat, mapCoordinates.lng]}
                            zoom={mapCoordinates.zoom || 15}
                            style={{ height: '100%', width: '100%' }}
                            dragging={false}
                            zoomControl={false}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                            touchZoom={false}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[mapCoordinates.lat, mapCoordinates.lng]}>
                              <Popup>
                                {formData.address.address_1 && `${formData.address.address_1}, `}
                                {formData.address.city}, {formData.address.province}
                              </Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      </div>
                    )}

                    {loadingMap && (
                      <div className="col-12 mb-3 text-center">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">Loading map...</span>
                        </div>
                        <small className="text-muted ms-2">Loading map...</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingLocation(null);
                      resetFormData();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
