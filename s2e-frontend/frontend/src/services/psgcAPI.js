import axios from 'axios'

// PSGC API configuration - using a more reliable endpoint
const psgcAPI = axios.create({
  baseURL: 'https://psgc.gitlab.io/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add error handling interceptor
psgcAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('PSGC API Error:', error)
    return Promise.reject(error)
  }
)

export const psgcService = {
  // Get all regions
  getRegions: async () => {
    try {
      const response = await psgcAPI.get('/regions.json')
      return response.data.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error fetching regions:', error)
      throw error
    }
  },

  // Get provinces by region code
  getProvinces: async (regionCode = null) => {
    try {
      if (regionCode) {
        const response = await psgcAPI.get(`/regions/${regionCode}/provinces.json`)
        return response.data.sort((a, b) => a.name.localeCompare(b.name))
      } else {
        const response = await psgcAPI.get('/provinces.json')
        return response.data.sort((a, b) => a.name.localeCompare(b.name))
      }
    } catch (error) {
      console.error('Error fetching provinces:', error)
      throw error
    }
  },

  // Get all provinces (without region filter)
  getAllProvinces: async () => {
    try {
      const response = await psgcAPI.get('/provinces.json')
      return response.data.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error fetching all provinces:', error)
      throw error
    }
  },

  // Get municipalities/cities by province code
  getMunicipalities: async (provinceCode) => {
    try {
      const response = await psgcAPI.get(`/provinces/${provinceCode}/cities-municipalities.json`)
      return response.data.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error fetching municipalities:', error)
      throw error
    }
  },

  // Get barangays by municipality/city code
  getBarangays: async (municipalityCode) => {
    try {
      const response = await psgcAPI.get(`/cities-municipalities/${municipalityCode}/barangays.json`)
      return response.data.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error fetching barangays:', error)
      throw error
    }
  },

  // Search locations (alternative method)
  searchLocation: async (query, type = 'all') => {
    try {
      // This might not be available in the static API, so we'll skip this for now
      console.log('Search not implemented for static API')
      return []
    } catch (error) {
      console.error('Error searching location:', error)
      throw error
    }
  }
}