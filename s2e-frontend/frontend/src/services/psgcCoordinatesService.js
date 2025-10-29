// Service for handling PSGC-based coordinates with automatic geocoding
// Dynamically geocodes complete addresses from PSGC selections

// Simple in-memory cache for geocoding results
const geocodeCache = new Map()

export const psgcCoordinatesService = {
  
  /**
   * 📍 Function 1: Build a complete address string from PSGC components
   */
  buildAddress(province, municipality, barangay) {
    const addressParts = []
    
    // Build address that's more likely to be found by geocoding services
    if (barangay) {
      // Try both with and without "Barangay" prefix for better matching
      addressParts.push(barangay)
    }
    
    if (municipality) {
      // Clean up municipality names for better geocoding
      let cleanMunicipality = municipality
      // Remove common suffixes that might interfere with geocoding
      cleanMunicipality = cleanMunicipality.replace(/\s+(Municipality|City)$/i, '').trim()
      addressParts.push(cleanMunicipality)
    }
    
    if (province) {
      // Clean up province names
      let cleanProvince = province
      cleanProvince = cleanProvince.replace(/\s+Province$/i, '').trim()
      addressParts.push(cleanProvince)
    }
    
    // Add Philippines for context
    addressParts.push('Philippines')
    
    return addressParts.join(', ')
  },

  /**
   * 🌐 Function 2: Geocode an address using OpenStreetMap Nominatim API
   */
  async geocodeAddress(address) {
    // Check cache first
    const cacheKey = address.toLowerCase().trim()
    if (geocodeCache.has(cacheKey)) {
      console.log(`💾 Using cached result for: ${address}`)
      return geocodeCache.get(cacheKey)
    }

    try {
      const encodedAddress = encodeURIComponent(address)
      
      // Try multiple search strategies for better accuracy
      const searchStrategies = [
        // Strategy 1: Exact address with Philippines, higher limit for barangays
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=8&countrycodes=ph&addressdetails=1&dedupe=1`,
        // Strategy 2: Broader search with even higher limit
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=15&countrycodes=ph&dedupe=1`
      ]
      
      for (const url of searchStrategies) {
        console.log(`🔍 Trying geocoding strategy: ${url}`)
        
        // Add timeout to prevent hanging
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'S2EH-Address-System/1.0'
            },
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            console.warn(`Geocoding request failed with status: ${response.status}`)
            continue
          }
          
          const data = await response.json()
          console.log(`📍 Geocoding returned ${data.length} results`)
          
          if (data && data.length > 0) {
            // Find the best match based on address components and importance
            const bestMatch = this.findBestMatch(data, address)
            
            if (bestMatch) {
              console.log(`✅ Best match found: ${bestMatch.display_name}`)
              const result = {
                lat: parseFloat(bestMatch.lat),
                lng: parseFloat(bestMatch.lon),
                display_name: bestMatch.display_name,
                accuracy: this.calculateAccuracy(bestMatch, address),
                place_rank: bestMatch.place_rank || 30,
                osm_type: bestMatch.osm_type
              }
              
              // Cache the result
              geocodeCache.set(cacheKey, result)
              
              return result
            }
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          if (fetchError.name === 'AbortError') {
            console.warn(`⏰ Geocoding timeout for: ${address}`)
          } else {
            console.warn(`⚠️ Fetch error for: ${address}`, fetchError.message)
          }
          continue
        }
      }
      
      console.warn(`⚠️ No suitable geocoding results found for: ${address}`)
      // Cache negative result to avoid repeated requests
      geocodeCache.set(cacheKey, null)
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      geocodeCache.set(cacheKey, null)
      return null
    }
  },

  /**
   * Find the best matching result from geocoding responses
   */
  findBestMatch(results, originalAddress) {
    if (!results || results.length === 0) return null
    
    const addressLower = originalAddress.toLowerCase()
    console.log(`🎯 Evaluating ${results.length} geocoding results for: ${originalAddress}`)
    
    // Score each result based on relevance
    const scoredResults = results.map(result => {
      let score = 0
      const displayName = result.display_name.toLowerCase()
      
      // Base score from importance (0-1 scale, multiply by 50 for significance)
      if (result.importance) {
        score += result.importance * 50
      }
      
      // Place rank scoring (lower rank = better, max 50 points)
      if (result.place_rank) {
        score += Math.max(0, 50 - result.place_rank)
      }
      
      // Check exact matches for key components (high weight)
      const addressParts = addressLower.split(',').map(part => part.trim().replace(/\s+/g, ' '))
      addressParts.forEach(part => {
        if (part && part !== 'philippines') {
          // For barangay searches, give extra weight to barangay matches
          const isBarangayPart = part.includes('barangay') || part.includes('brgy')
          const multiplier = isBarangayPart ? 2 : 1
          
          // Exact match gets high score
          if (displayName.includes(part)) {
            score += 25 * multiplier
          }
          // Partial match gets some score
          const words = part.split(' ')
          words.forEach(word => {
            if (word.length > 2 && displayName.includes(word)) {
              score += 5 * multiplier
            }
          })
        }
      })
      
      // Extra bonus for barangay-level results
      if (displayName.includes('barangay') || displayName.includes('brgy')) {
        score += 20
      }
      
      // Prefer results that are clearly in the Philippines
      if (displayName.includes('philippines') || displayName.includes('pilipinas')) {
        score += 10
      }
      
      // Prefer administrative divisions (cities, municipalities, provinces)
      if (result.class === 'place' && (result.type === 'city' || result.type === 'town' || result.type === 'municipality')) {
        score += 15
      }
      
      // Prefer results within Philippines bounds (critical)
      const lat = parseFloat(result.lat)
      const lon = parseFloat(result.lon)
      if (lat >= 4.2 && lat <= 21.2 && lon >= 116.0 && lon <= 127.0) {
        score += 30
      } else {
        score -= 50 // Heavy penalty for out of bounds
      }
      
      console.log(`📊 Result: ${result.display_name.substring(0, 50)}... | Score: ${score.toFixed(1)} | Rank: ${result.place_rank} | Importance: ${result.importance}`)
      
      return { ...result, score }
    })
    
    // Sort by score and return the best match
    scoredResults.sort((a, b) => b.score - a.score)
    
    const bestMatch = scoredResults[0]
    if (bestMatch && bestMatch.score > 20) { // Minimum threshold for acceptance
      console.log(`🏆 Selected best match: ${bestMatch.display_name} (score: ${bestMatch.score.toFixed(1)})`)
      return bestMatch
    }
    
    console.log(`❌ No suitable match found (best score: ${bestMatch?.score?.toFixed(1) || 'N/A'})`)
    return null
  },

  /**
   * Calculate accuracy score based on result quality
   */
  calculateAccuracy(result, originalAddress) {
    let accuracy = result.importance || 0.5
    
    // Adjust based on place rank
    if (result.place_rank) {
      if (result.place_rank <= 16) accuracy += 0.3  // City/town level
      else if (result.place_rank <= 20) accuracy += 0.2  // Village/barangay level
      else if (result.place_rank <= 25) accuracy += 0.1  // Suburb level
    }
    
    // Cap accuracy at 1.0
    return Math.min(accuracy, 1.0)
  },

  /**
   * 📌 Function 3: Get coordinates for a complete PSGC address
   * Automatically builds the address and geocodes it with multiple fallback strategies
   */
  async getCoordinates(province, municipality, barangay = null) {
    console.log(`🎯 Getting coordinates for: Province=${province}, Municipality=${municipality}, Barangay=${barangay}`)
    
    // If barangay is provided, try multiple barangay-specific strategies first
    if (barangay) {
      const barangayStrategies = [
        // Strategy 1: Barangay with "Barangay" prefix
        `Barangay ${barangay}, ${municipality}, ${province}, Philippines`,
        // Strategy 2: Barangay with "Brgy" prefix
        `Brgy ${barangay}, ${municipality}, ${province}, Philippines`,
        // Strategy 3: Just barangay name
        `${barangay}, ${municipality}, ${province}, Philippines`,
        // Strategy 4: Barangay with municipality only
        `Barangay ${barangay}, ${municipality}, Philippines`,
        // Strategy 5: Alternative format
        `${barangay} ${municipality} ${province} Philippines`
      ]
      
      for (let i = 0; i < barangayStrategies.length; i++) {
        const addressToTry = barangayStrategies[i]
        console.log(`� Trying barangay strategy ${i + 1}/${barangayStrategies.length}: ${addressToTry}`)
        
        const coordinates = await this.geocodeAddress(addressToTry)
        
        if (coordinates && this.isWithinPhilippines(coordinates.lat, coordinates.lng)) {
          // Extra validation for barangay-level results
          const displayName = coordinates.display_name.toLowerCase()
          const barangayLower = barangay.toLowerCase()
          
          // Check if the result actually contains the barangay name
          if (displayName.includes(barangayLower) || 
              displayName.includes(`barangay ${barangayLower}`) ||
              displayName.includes(`brgy ${barangayLower}`)) {
            console.log(`✅ Found barangay-level coordinates: ${coordinates.lat}, ${coordinates.lng}`)
            
            return {
              ...coordinates,
              address: addressToTry,
              source: 'barangay_exact',
              originalQuery: this.buildAddress(province, municipality, barangay),
              specificity: 'barangay'
            }
          } else {
            console.log(`⚠️ Result doesn't contain barangay name, continuing search...`)
          }
        }
      }
      
      console.log(`⚠️ No barangay-specific results found, trying municipality-level...`)
    }
    
    // Try municipality-level strategies
    const municipalityStrategies = [
      // Strategy 1: Clean municipality name
      `${municipality}, ${province}, Philippines`,
      // Strategy 2: With "City" if it might be a city
      municipality.toLowerCase().includes('city') ? null : `${municipality} City, ${province}, Philippines`,
      // Strategy 3: Just municipality
      `${municipality}, Philippines`
    ].filter(Boolean) // Remove null entries
    
    for (let i = 0; i < municipalityStrategies.length; i++) {
      const addressToTry = municipalityStrategies[i]
      console.log(`🔄 Trying municipality strategy ${i + 1}/${municipalityStrategies.length}: ${addressToTry}`)
      
      const coordinates = await this.geocodeAddress(addressToTry)
      
      if (coordinates && this.isWithinPhilippines(coordinates.lat, coordinates.lng)) {
        console.log(`✅ Found municipality-level coordinates: ${coordinates.lat}, ${coordinates.lng}`)
        
        return {
          ...coordinates,
          address: addressToTry,
          source: barangay ? 'municipality_fallback' : 'municipality_exact',
          originalQuery: this.buildAddress(province, municipality, barangay),
          specificity: 'municipality'
        }
      }
    }
    
    // Finally try province-level
    const provinceAddress = `${province}, Philippines`
    console.log(`🔄 Trying province-level: ${provinceAddress}`)
    
    const coordinates = await this.geocodeAddress(provinceAddress)
    
    if (coordinates && this.isWithinPhilippines(coordinates.lat, coordinates.lng)) {
      console.log(`✅ Found province-level coordinates: ${coordinates.lat}, ${coordinates.lng}`)
      
      return {
        ...coordinates,
        address: provinceAddress,
        source: 'province_fallback',
        originalQuery: this.buildAddress(province, municipality, barangay),
        specificity: 'province'
      }
    }
    
    // If all geocoding strategies fail, use intelligent fallback
    console.log(`🔄 All geocoding strategies failed, using intelligent fallback`)
    const fallbackCoords = this.getFallbackCoordinates(province, municipality)
    
    return {
      ...fallbackCoords,
      address: this.buildAddress(province, municipality, barangay),
      display_name: `${municipality || province || 'Philippines'} (approximate location)`,
      originalQuery: this.buildAddress(province, municipality, barangay),
      specificity: 'fallback'
    }
  },

  /**
   * Check if coordinates are within Philippines bounds
   */
  isWithinPhilippines(lat, lng) {
    // Philippines geographical bounds (approximate)
    return lat >= 4.2 && lat <= 21.2 && lng >= 116.0 && lng <= 127.0
  },

  /**
   * ⚡ Fast coordinate lookup - optimized for speed but comprehensive for barangays
   */
  async getCoordinatesFast(province, municipality, barangay = null) {
    console.log(`🚀 Fast lookup for: ${province}, ${municipality}, ${barangay || 'no barangay'}`)
    
    // Build cache key for this specific combination
    const cacheKey = `fast-${province}-${municipality}-${barangay || 'null'}`
    if (geocodeCache.has(cacheKey)) {
      console.log(`💾 Using cached result`)
      return geocodeCache.get(cacheKey)
    }
    
    // If barangay is provided, be more thorough in finding it
    if (barangay) {
      const barangayStrategies = [
        // Most effective barangay formats
        `${barangay}, ${municipality}, ${province}, Philippines`,
        `Barangay ${barangay}, ${municipality}, ${province}, Philippines`,
        `Brgy. ${barangay}, ${municipality}, ${province}, Philippines`,
        `${barangay}, ${municipality}, Philippines`,
        `Barangay ${barangay}, ${municipality}, Philippines`
      ]
      
      console.log(`🔍 Trying ${barangayStrategies.length} barangay strategies for: ${barangay}`)
      
      for (let i = 0; i < barangayStrategies.length; i++) {
        const addressToTry = barangayStrategies[i]
        console.log(`  Strategy ${i + 1}: ${addressToTry}`)
        
        const coordinates = await this.geocodeAddress(addressToTry)
        
        if (coordinates && this.isWithinPhilippines(coordinates.lat, coordinates.lng)) {
          // Validate that this is actually barangay-level
          const displayName = coordinates.display_name.toLowerCase()
          const barangayLower = barangay.toLowerCase()
          
          // Check if the result actually mentions the barangay
          const hasBarangayMatch = displayName.includes(barangayLower) || 
                                 displayName.includes(`barangay ${barangayLower}`) ||
                                 displayName.includes(`brgy ${barangayLower}`) ||
                                 displayName.includes(`brgy. ${barangayLower}`)
          
          if (hasBarangayMatch) {
            console.log(`✅ Found BARANGAY-level coordinates for ${barangay}!`)
            
            const result = {
              ...coordinates,
              address: addressToTry,
              source: 'barangay_exact',
              specificity: 'barangay'
            }
            
            geocodeCache.set(cacheKey, result)
            return result
          } else {
            console.log(`⚠️ Result doesn't contain barangay name, trying next strategy...`)
          }
        }
      }
      
      console.log(`⚠️ No barangay-specific coordinates found, falling back to municipality`)
    }
    
    // Try municipality level
    const municipalityStrategies = [
      `${municipality}, ${province}, Philippines`,
      `${municipality}, Philippines`
    ]
    
    for (const addressToTry of municipalityStrategies) {
      console.log(`🔄 Trying municipality: ${addressToTry}`)
      
      const coordinates = await this.geocodeAddress(addressToTry)
      
      if (coordinates && this.isWithinPhilippines(coordinates.lat, coordinates.lng)) {
        console.log(`✅ Found MUNICIPALITY-level coordinates`)
        
        const result = {
          ...coordinates,
          address: addressToTry,
          source: barangay ? 'municipality_fallback' : 'municipality_exact',
          specificity: 'municipality'
        }
        
        geocodeCache.set(cacheKey, result)
        return result
      }
    }
    
    // Final fallback
    console.log(`🔄 Using fallback coordinates`)
    const fallbackCoords = this.getFallbackCoordinates(province, municipality)
    const result = {
      ...fallbackCoords,
      specificity: 'fallback',
      source: 'fallback'
    }
    
    geocodeCache.set(cacheKey, result)
    return result
  },

  /**
   * ⚡ Get coordinates with additional metadata for map display (Fast version)
   */
  async getCoordinatesWithMetadataFast(province, municipality, barangay = null) {
    const result = await this.getCoordinatesFast(province, municipality, barangay)
    
    return {
      ...result,
      zoom: this.getRecommendedZoom(barangay, municipality, result.specificity),
      markerTitle: this.formatMarkerTitle(province, municipality, barangay, result.specificity)
    }
  },

  /**
   * Get recommended zoom level based on address specificity
   */
  getRecommendedZoom(barangay, municipality, specificity = null) {
    // Use specificity if available for more accurate zoom
    if (specificity === 'barangay') return 16  // High zoom for barangay
    if (specificity === 'municipality') return 13  // Medium zoom for municipality
    if (specificity === 'province') return 10  // Lower zoom for province
    
    // Fallback to original logic
    if (barangay) return 16  // Barangay level - high zoom
    if (municipality) return 13  // Municipality level - medium zoom
    return 10  // Province level - low zoom
  },

  /**
   * Format a nice title for map markers and popups
   */
  formatMarkerTitle(province, municipality, barangay, specificity = null) {
    const parts = []
    
    if (specificity === 'barangay' && barangay) {
      parts.push(`Barangay ${barangay}`)
      parts.push(municipality)
      parts.push(province)
    } else if (specificity === 'municipality' || (!barangay && municipality)) {
      parts.push(municipality)
      parts.push(province)
    } else if (specificity === 'province' || !municipality) {
      parts.push(province)
    } else {
      // Fallback to original logic
      if (barangay) parts.push(`Barangay ${barangay}`)
      if (municipality) parts.push(municipality)
      if (province) parts.push(province)
    }
    
    return parts.join(', ')
  },

  /**
   * Get better fallback coordinates based on known Philippine locations
   */
  getFallbackCoordinates(province, municipality) {
    // Known coordinates for major Philippine provinces/regions (more comprehensive)
    const knownLocations = {
      // Luzon - Bicol Region
      'Camarines Sur': { lat: 13.6218, lng: 123.1948 },
      'Camarines Norte': { lat: 14.1265, lng: 122.6634 },
      'Albay': { lat: 13.1391, lng: 123.7437 },
      'Sorsogon': { lat: 12.9744, lng: 124.0075 },
      'Masbate': { lat: 12.3663, lng: 123.6184 },
      'Catanduanes': { lat: 13.9615, lng: 124.2886 },
      
      // Luzon - NCR and nearby
      'Metro Manila': { lat: 14.5995, lng: 120.9842 },
      'Manila': { lat: 14.5995, lng: 120.9842 },
      'Rizal': { lat: 14.6037, lng: 121.3084 },
      'Laguna': { lat: 14.2691, lng: 121.4048 },
      'Batangas': { lat: 13.7565, lng: 121.0583 },
      'Cavite': { lat: 14.2456, lng: 120.8930 },
      'Bulacan': { lat: 14.7942, lng: 120.8794 },
      'Quezon': { lat: 14.1507, lng: 121.9110 },
      
      // Luzon - Northern
      'Pangasinan': { lat: 15.8949, lng: 120.2863 },
      'La Union': { lat: 16.6159, lng: 120.3209 },
      'Ilocos Norte': { lat: 18.1969, lng: 120.5963 },
      'Ilocos Sur': { lat: 17.5757, lng: 120.4136 },
      'Cagayan': { lat: 17.6132, lng: 121.7270 },
      'Nueva Ecija': { lat: 15.5784, lng: 121.1113 },
      
      // Visayas
      'Cebu': { lat: 10.3157, lng: 123.8854 },
      'Bohol': { lat: 9.8349, lng: 124.1436 },
      'Negros Oriental': { lat: 9.3069, lng: 123.3054 },
      'Negros Occidental': { lat: 10.6767, lng: 122.9515 },
      'Iloilo': { lat: 10.7202, lng: 122.5621 },
      'Leyte': { lat: 10.7218, lng: 124.8062 },
      'Samar': { lat: 11.2395, lng: 125.0072 },
      'Aklan': { lat: 11.5564, lng: 122.0165 },
      'Capiz': { lat: 11.4234, lng: 122.6445 },
      
      // Mindanao
      'Davao del Sur': { lat: 7.1907, lng: 125.4553 },
      'Davao': { lat: 7.1907, lng: 125.4553 },
      'Misamis Oriental': { lat: 8.4542, lng: 124.6319 },
      'Cagayan de Oro': { lat: 8.4542, lng: 124.6319 },
      'Zamboanga del Sur': { lat: 7.8403, lng: 123.2983 },
      'Zamboanga': { lat: 6.9214, lng: 122.0790 },
      'Bukidnon': { lat: 8.1267, lng: 125.1289 },
      'Lanao del Norte': { lat: 8.0103, lng: 124.2816 },
      'Surigao del Norte': { lat: 9.7867, lng: 125.4953 }
    }
    
    // Also check for municipality-specific coordinates in well-known cities
    const knownCities = {
      'Naga': { lat: 13.6218, lng: 123.1948, province: 'Camarines Sur' },
      'Legazpi': { lat: 13.1391, lng: 123.7437, province: 'Albay' },
      'Iriga': { lat: 13.4210, lng: 123.4134, province: 'Camarines Sur' },
      'Masbate City': { lat: 12.3663, lng: 123.6184, province: 'Masbate' },
      'Sorsogon City': { lat: 12.9744, lng: 124.0075, province: 'Sorsogon' },
      'Cebu City': { lat: 10.3157, lng: 123.8854, province: 'Cebu' },
      'Davao City': { lat: 7.1907, lng: 125.4553, province: 'Davao' },
      'Cagayan de Oro City': { lat: 8.4542, lng: 124.6319, province: 'Misamis Oriental' }
    }
    
    // First try to find specific municipality coordinates
    if (municipality && knownCities[municipality]) {
      console.log(`📍 Using known city coordinates for: ${municipality}`)
      return {
        ...knownCities[municipality],
        source: 'city_fallback',
        accuracy: 0.7
      }
    }
    
    // Then try to find coordinates for the province
    if (province && knownLocations[province]) {
      console.log(`📍 Using known province coordinates for: ${province}`)
      return {
        ...knownLocations[province],
        source: 'province_fallback',
        accuracy: 0.4
      }
    }
    
    // Default to center of Philippines
    console.log(`📍 Using default Philippines coordinates`)
    return {
      lat: 12.8797,
      lng: 121.7740,
      source: 'default_fallback',
      accuracy: 0.1
    }
  }
}