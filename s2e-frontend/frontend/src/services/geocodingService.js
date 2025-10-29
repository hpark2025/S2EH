/**
 * Geocoding Service using Backend Proxy
 * Provides real-time coordinates for Philippine locations
 */

// Use our backend proxy to avoid CORS issues
const GEOCODING_API = '/api/geocoding/coordinates'

// Cache for coordinates to avoid repeated API calls
const coordinatesCache = {}

/**
 * Get coordinates for a location using our backend proxy
 * @param {string} locationName - Full location name (e.g., "Lagonoy, Camarines Sur, Philippines")
 * @returns {Promise<{lat: number, lng: number, name: string}>}
 */
const fetchCoordinatesFromAPI = async (locationName) => {
  // Check cache first
  if (coordinatesCache[locationName]) {
    console.log('🗺️ Using cached coordinates for:', locationName)
    return coordinatesCache[locationName]
  }

  try {
    console.log('🌍 Fetching coordinates for:', locationName)
    
    const url = `${GEOCODING_API}?location=${encodeURIComponent(locationName)}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates')
    }
    
    const result = await response.json()
    
    if (result.success && result.data) {
      const coords = {
        lat: result.data.lat,
        lng: result.data.lng,
        name: result.data.name,
        postal_code: result.data.postal_code || null
      }
      
      // Cache the result
      coordinatesCache[locationName] = coords
      
      console.log('✅ Coordinates fetched:', coords)
      return coords
    }
    
    // Fallback to Philippines center if not found
    console.warn('⚠️ Location not found, using Philippines center')
    return {
      lat: 12.8797,
      lng: 121.7740,
      name: 'Philippines'
    }
    
  } catch (error) {
    console.error('❌ Error fetching coordinates:', error)
    // Fallback to Philippines center
    return {
      lat: 12.8797,
      lng: 121.7740,
      name: 'Philippines'
    }
  }
}

/**
 * Get coordinates for a location based on PSGC names
 * @param {string} province - Province name
 * @param {string} municipality - Municipality name (optional)
 * @param {string} barangay - Barangay name (optional)
 * @returns {Promise<{lat: number, lng: number, name: string}>}
 */
export const getLocationCoordinates = async (province = null, municipality = null, barangay = null) => {
  // Build location string from most specific to least specific
  let locationParts = []
  
  if (barangay) locationParts.push(barangay)
  if (municipality) locationParts.push(municipality)
  if (province) locationParts.push(province)
  locationParts.push('Philippines')
  
  const locationName = locationParts.join(', ')
  
  // If no location provided, return Philippines center
  if (!province) {
    return {
      lat: 12.8797,
      lng: 121.7740,
      name: 'Philippines',
      zoom: 6
    }
  }
  
  // Fetch coordinates from API
  const coords = await fetchCoordinatesFromAPI(locationName)
  
  // Add zoom level
  return {
    ...coords,
    zoom: getZoomLevel(province, municipality, barangay)
  }
}

/**
 * Get zoom level based on location specificity
 */
export const getZoomLevel = (province = null, municipality = null, barangay = null) => {
  if (barangay) return 15 // Barangay level - most zoomed in
  if (municipality) return 13 // Municipality level
  if (province) return 10 // Province level
  return 6 // Country level
}

/**
 * Clear coordinates cache
 */
export const clearCache = () => {
  Object.keys(coordinatesCache).forEach(key => delete coordinatesCache[key])
  console.log('🗑️ Coordinates cache cleared')
}

/**
 * Preload coordinates for a location (optional optimization)
 */
export const preloadCoordinates = async (province, municipality = null, barangay = null) => {
  return await getLocationCoordinates(province, municipality, barangay)
}

export default {
  getLocationCoordinates,
  getZoomLevel,
  clearCache,
  preloadCoordinates
}
