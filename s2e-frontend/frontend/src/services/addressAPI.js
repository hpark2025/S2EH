import api from './api.js'
import { psgcCoordinatesService } from './psgcCoordinatesService.js'

// Address API endpoints - simplified for new backend
export const addressAPI = {
  // Get user addresses (stored in user profile)
  getAddresses: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userType = localStorage.getItem('userType');
      
      if (!user.id || !userType) {
        throw { status: 401, message: 'User not logged in' };
      }

      // Get user details which include address information
      let response;
      if (userType === 'seller') {
        response = await api.get(`/sellers/${user.id}`);
      } else if (userType === 'customer') {
        response = await api.get(`/customers/${user.id}`);
      } else {
        throw { status: 400, message: 'Invalid user type' };
      }

      const userData = response.data;
      
      // Format address data to match expected structure
      const addresses = [];
      if (userData.province && userData.municipality && userData.barangay) {
        addresses.push({
          id: 1,
          province: userData.province,
          municipality: userData.municipality,
          barangay: userData.barangay,
          postalCode: userData.postalCode || '',
          latitude: userData.latitude,
          longitude: userData.longitude,
          isDefault: true
        });
      }

      return addresses;
    } catch (error) {
      console.error('Get addresses error:', error)
      console.error('Error response:', error.response)
      
      // Extract the actual error data from axios error structure
      const errorData = error.response?.data || {
        status: error.response?.status || error.status || 500,
        message: error.message || 'Network error'
      }
      
      // Add status code to the error object for frontend handling
      errorData.status = error.response?.status || error.status || 500
      
      throw errorData
    }
  },

  // Add new address (update user profile)
  addAddress: async (addressData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userType = localStorage.getItem('userType');
      
      if (!user.id || !userType) {
        throw { status: 401, message: 'User not logged in' };
      }

      // Automatically geocode the address to get coordinates
      let coordinates = null
      try {
        if (addressData.province && addressData.municipality && addressData.barangay) {
          console.log('🗺️ Geocoding address update...')
          coordinates = await psgcCoordinatesService.getAddressCoordinates(
            addressData.province,
            addressData.municipality,
            addressData.barangay
          )
          
          if (coordinates && coordinates.lat && coordinates.lng) {
            console.log('✅ Coordinates obtained for address:', { lat: coordinates.lat, lng: coordinates.lng })
          } else {
            console.warn('⚠️ Could not geocode address, coordinates will be null')
          }
        }
      } catch (geocodingError) {
        console.error('❌ Geocoding failed:', geocodingError)
      }

      // Update user profile with new address and coordinates
      const updateData = {
        province: addressData.province,
        municipality: addressData.municipality,
        barangay: addressData.barangay,
        postalCode: addressData.postalCode,
        latitude: coordinates?.lat || null,
        longitude: coordinates?.lng || null
      };

      let response;
      if (userType === 'seller') {
        response = await api.put(`/sellers/${user.id}`, updateData);
      } else if (userType === 'customer') {
        response = await api.put(`/customers/${user.id}`, updateData);
      } else {
        throw { status: 400, message: 'Invalid user type' };
      }

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error('Add address error:', error)
      throw error
    }
  },

  // Update address (update user profile)
  updateAddress: async (addressId, addressData) => {
    try {
      // Since we only support one address per user, just update the user profile
      return await this.addAddress(addressData);
    } catch (error) {
      console.error('Update address error:', error)
      throw error
    }
  },

  // Delete address (clear address from user profile)
  deleteAddress: async (addressId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userType = localStorage.getItem('userType');
      
      if (!user.id || !userType) {
        throw { status: 401, message: 'User not logged in' };
      }

      // Clear address fields
      const updateData = {
        province: null,
        municipality: null,
        barangay: null,
        postalCode: null,
        latitude: null,
        longitude: null
      };

      let response;
      if (userType === 'seller') {
        response = await api.put(`/sellers/${user.id}`, updateData);
      } else if (userType === 'customer') {
        response = await api.put(`/customers/${user.id}`, updateData);
      } else {
        throw { status: 400, message: 'Invalid user type' };
      }

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data));

      return { message: 'Address deleted successfully' };
    } catch (error) {
      console.error('Delete address error:', error)
      throw error
    }
  },

  // Set address as default (no-op since we only support one address)
  setDefaultAddress: async (addressId) => {
    try {
      return { message: 'Address set as default' };
    } catch (error) {
      console.error('Set default address error:', error)
      throw error
    }
  }
}