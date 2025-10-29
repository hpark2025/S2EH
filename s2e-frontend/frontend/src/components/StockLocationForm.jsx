import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { sellerAPI } from '../services/sellerAPI';

export default function StockLocationForm({ onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    address: {
      address_1: '',
      address_2: '',
      city: '',
      province: '',
      postal_code: '',
      country_code: 'us'
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }
      if (!formData.address.address_1.trim()) {
        toast.error('Address is required');
        return;
      }
      if (!formData.address.city.trim()) {
        toast.error('City is required');
        return;
      }

      // Use the correct Medusa.js format for stock locations
      const stockLocationData = {
        name: formData.name,
        address: {
          address_1: formData.address.address_1,
          address_2: formData.address.address_2 || undefined,
          city: formData.address.city,
          province: formData.address.province || undefined,
          postal_code: formData.address.postal_code || undefined,
          country_code: formData.address.country_code
        }
      };

      // Remove undefined values to keep the payload clean
      const cleanData = JSON.parse(JSON.stringify(stockLocationData, (key, value) => 
        value === undefined ? undefined : value
      ));

      try {
        const response = await sellerAPI.stockLocations.createStockLocation(cleanData);
        console.log('✅ Stock location created successfully:', response);
        toast.success('Stock location created successfully!');
        onSuccess && onSuccess(response);
        onClose && onClose();
      } catch (error) {
        console.error('❌ Failed to create stock location:', error);
        throw error;
      }

    } catch (error) {
      console.error('❌ All stock location creation attempts failed:', error);
      
      // Provide specific error guidance
      const errorMessage = error.response?.data?.message || error.message;
      let userMessage = 'Failed to create stock location';
      
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userMessage = 'Permission denied. Please check your seller permissions.';
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        userMessage = 'Validation error. Please check all required fields.';
      } else if (errorMessage.includes('database') || errorMessage.includes('connection')) {
        userMessage = 'Database error. Please try again later.';
      } else if (errorMessage.includes('unknown_error')) {
        userMessage = 'Backend error. Please check if stock locations are properly configured.';
      }
      
      toast.error(`${userMessage}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-geo-alt me-2"></i>
              Add Stock Location
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Location Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Main Warehouse, Store Location"
                    required
                  />
                </div>
                
                <div className="col-12">
                  <label className="form-label">Address Line 1 *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.address_1}
                    onChange={(e) => handleInputChange('address.address_1', e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </div>
                
                <div className="col-12">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.address_2}
                    onChange={(e) => handleInputChange('address.address_2', e.target.value)}
                    placeholder="Apartment, suite, unit, etc."
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Province</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.province}
                    onChange={(e) => handleInputChange('address.province', e.target.value)}
                    placeholder="Province"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.postal_code}
                    onChange={(e) => handleInputChange('address.postal_code', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    value={formData.address.country_code}
                    onChange={(e) => handleInputChange('address.country_code', e.target.value)}
                  >
                    <option value="us">United States</option>
                    <option value="ph">Philippines</option>
                    <option value="sg">Singapore</option>
                    <option value="ca">Canada</option>
                    <option value="gb">United Kingdom</option>
                    <option value="au">Australia</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Location
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
