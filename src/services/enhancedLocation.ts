'use client'

import { 
  GeolocationCoords, 
  LocationPermissionStatus, 
  Address, 
  LocationSearchResult, 
  MapConfig, 
  LocationServiceConfig,
  RouteInfo,
  ProximitySearch,
  ProximityResult,
  LocationError,
  LocationTrackingSession,
  LocationHistory
} from '@/types/location'

export class EnhancedLocationService {
  private static readonly DEFAULT_CONFIG: LocationServiceConfig = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 1000
  }

  private static readonly GEOCODING_APIS = {
    google: 'https://maps.googleapis.com/maps/api/geocode/json',
    nominatim: 'https://nominatim.openstreetmap.org/reverse',
    bigdatacloud: 'https://api.bigdatacloud.net/data/reverse-geocode-client'
  }

  private static trackingSessions = new Map<string, LocationTrackingSession>()

  /**
   * Check if we're running on the client side
   */
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined'
  }

  /**
   * Check if geolocation is supported
   */
  static isSupported(): boolean {
    return this.isClient() && 'geolocation' in navigator
  }

  /**
   * Get current permission status with enhanced detection
   */
  static async getPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!this.isSupported()) {
      return {
        granted: false,
        denied: false,
        prompt: false,
        unavailable: true
      }
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        return {
          granted: permission.state === 'granted',
          denied: permission.state === 'denied',
          prompt: permission.state === 'prompt',
          unavailable: false
        }
      }
    } catch (error) {
      console.warn('Permission API not supported, falling back to legacy detection')
    }

    return this.legacyPermissionCheck()
  }

  /**
   * Legacy permission check for older browsers
   */
  private static legacyPermissionCheck(): Promise<LocationPermissionStatus> {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve({
          granted: true,
          denied: false,
          prompt: false,
          unavailable: false
        }),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve({
              granted: false,
              denied: true,
              prompt: false,
              unavailable: false
            })
          } else {
            resolve({
              granted: false,
              denied: false,
              prompt: true,
              unavailable: false
            })
          }
        },
        { timeout: 1000 }
      )
    })
  }

  /**
   * Request location with enhanced error handling and retry logic
   */
  static async requestLocation(config: Partial<LocationServiceConfig> = {}): Promise<GeolocationCoords> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }

    if (!this.isSupported()) {
      throw this.createLocationError('SERVICE_UNAVAILABLE', 'Geolocation is not supported by this browser')
    }

    let lastError: LocationError | null = null

    for (let attempt = 1; attempt <= finalConfig.retryAttempts; attempt++) {
      try {
        const coords = await this.getCurrentPositionPromise(finalConfig)
        
        // Validate coordinates
        if (!this.isValidCoordinates(coords.lat, coords.lng)) {
          throw this.createLocationError('INVALID_COORDINATES', 'Invalid coordinates received')
        }

        return coords
      } catch (error) {
        lastError = error as LocationError
        console.warn(`Location attempt ${attempt} failed:`, error)
        
        if (attempt < finalConfig.retryAttempts) {
          await this.delay(finalConfig.retryDelay * attempt)
        }
      }
    }

    throw lastError || this.createLocationError('POSITION_UNAVAILABLE', 'Failed to get location after retries')
  }

  /**
   * Wrap getCurrentPosition in a Promise with timeout
   */
  private static getCurrentPositionPromise(config: LocationServiceConfig): Promise<GeolocationCoords> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(this.createLocationError('TIMEOUT', 'Location request timed out'))
      }, config.timeout)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId)
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          })
        },
        (error) => {
          clearTimeout(timeoutId)
          reject(this.mapGeolocationError(error))
        },
        {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: config.timeout,
          maximumAge: config.maximumAge
        }
      )
    })
  }

  /**
   * Enhanced reverse geocoding with multiple providers
   */
  static async reverseGeocode(coords: GeolocationCoords, provider: 'google' | 'nominatim' | 'bigdatacloud' = 'bigdatacloud'): Promise<Address> {
    try {
      switch (provider) {
        case 'google':
          return await this.reverseGeocodeGoogle(coords)
        case 'nominatim':
          return await this.reverseGeocodeNominatim(coords)
        case 'bigdatacloud':
        default:
          return await this.reverseGeocodeBigDataCloud(coords)
      }
    } catch (error) {
      console.warn(`Reverse geocoding failed with ${provider}, trying fallback`)
      // Fallback to coordinate-based address
      return {
        city: 'Unknown City',
        country: 'Unknown Country',
        formatted_address: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
        coordinates: coords
      }
    }
  }

  /**
   * Google Maps reverse geocoding
   */
  private static async reverseGeocodeGoogle(coords: GeolocationCoords): Promise<Address> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    const response = await fetch(
      `${this.GEOCODING_APIS.google}?latlng=${coords.lat},${coords.lng}&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error('Google geocoding request failed')
    }

    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results.length) {
      throw new Error('No results from Google geocoding')
    }

    const result = data.results[0]
    return this.parseGoogleGeocodingResult(result, coords)
  }

  /**
   * OpenStreetMap Nominatim reverse geocoding
   */
  private static async reverseGeocodeNominatim(coords: GeolocationCoords): Promise<Address> {
    const response = await fetch(
      `${this.GEOCODING_APIS.nominatim}?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`
    )

    if (!response.ok) {
      throw new Error('Nominatim geocoding request failed')
    }

    const data = await response.json()
    return this.parseNominatimResult(data, coords)
  }

  /**
   * BigDataCloud reverse geocoding (free tier)
   */
  private static async reverseGeocodeBigDataCloud(coords: GeolocationCoords): Promise<Address> {
    const response = await fetch(
      `${this.GEOCODING_APIS.bigdatacloud}?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`
    )

    if (!response.ok) {
      throw new Error('BigDataCloud geocoding request failed')
    }

    const data = await response.json()
    return this.parseBigDataCloudResult(data, coords)
  }

  /**
   * Forward geocoding - search for addresses
   */
  static async searchAddresses(query: string, bias?: GeolocationCoords): Promise<LocationSearchResult[]> {
    try {
      // Use Google Places Autocomplete API if available
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (apiKey) {
        return await this.searchAddressesGoogle(query, bias)
      }
      
      // Fallback to Nominatim
      return await this.searchAddressesNominatim(query, bias)
    } catch (error) {
      console.error('Address search failed:', error)
      return []
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadian(lat2 - lat1)
    const dLng = this.toRadian(lng2 - lng1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadian(lat1)) * Math.cos(this.toRadian(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Check if coordinates are within a radius
   */
  static isWithinRadius(
    centerLat: number,
    centerLng: number,
    targetLat: number,
    targetLng: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLng, targetLat, targetLng)
    return distance <= radiusKm
  }

  /**
   * Find nearby mechanics using proximity-based algorithm
   */
  static async findNearbyMechanics(
    searchParams: ProximitySearch
  ): Promise<ProximityResult[]> {
    // This would integrate with your mechanic database
    // Implementation would query mechanics within radius and sort by distance/availability
    try {
      // Placeholder for actual implementation
      console.log('Finding nearby mechanics for:', searchParams)
      return []
    } catch (error) {
      console.error('Error finding nearby mechanics:', error)
      return []
    }
  }

  /**
   * Start location tracking session
   */
  static startLocationTracking(
    userId: string,
    requestId?: string,
    updateInterval: number = 30000 // 30 seconds
  ): string {
    const sessionId = `tracking_${userId}_${Date.now()}`
    
    const session: LocationTrackingSession = {
      id: sessionId,
      user_id: userId,
      request_id: requestId,
      started_at: new Date().toISOString(),
      status: 'active',
      locations: []
    }

    this.trackingSessions.set(sessionId, session)

    // Start position watching
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationHistory = {
          id: `loc_${Date.now()}`,
          user_id: userId,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy
        }

        const currentSession = this.trackingSessions.get(sessionId)
        if (currentSession) {
          currentSession.locations.push(location)
          this.trackingSessions.set(sessionId, currentSession)
        }
      },
      (error) => {
        console.error('Location tracking error:', error)
        this.stopLocationTracking(sessionId)
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000
      }
    )

    // Store watch ID in session metadata
    const sessionData = this.trackingSessions.get(sessionId)!
    sessionData.watchId = watchId
    this.trackingSessions.set(sessionId, sessionData)

    return sessionId
  }

  /**
   * Stop location tracking session
   */
  static stopLocationTracking(sessionId: string): void {
    const session = this.trackingSessions.get(sessionId)
    if (session) {
      session.status = 'completed'
      session.ended_at = new Date().toISOString()
      
      // Clear geolocation watch if it exists
      if (session.watchId && this.isSupported()) {
        navigator.geolocation.clearWatch(session.watchId)
        delete session.watchId
      }
      
      this.trackingSessions.set(sessionId, session)
    }
  }

  /**
   * Get tracking session data
   */
  static getTrackingSession(sessionId: string): LocationTrackingSession | null {
    return this.trackingSessions.get(sessionId) || null
  }

  /**
   * Validate coordinates
   */
  static isValidCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    )
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(lat: number, lng: number, precision: number = 4): string {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
  }

  // Helper methods

  private static toRadian(degree: number): number {
    return degree * (Math.PI / 180)
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private static createLocationError(code: LocationError['code'], message: string): LocationError {
    return { code, message }
  }

  private static mapGeolocationError(error: GeolocationPositionError): LocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return this.createLocationError('PERMISSION_DENIED', 'Location access denied by user')
      case error.POSITION_UNAVAILABLE:
        return this.createLocationError('POSITION_UNAVAILABLE', 'Location information unavailable')
      case error.TIMEOUT:
        return this.createLocationError('TIMEOUT', 'Location request timed out')
      default:
        return this.createLocationError('POSITION_UNAVAILABLE', 'Unknown error occurred while retrieving location')
    }
  }

  // Parsing methods for different geocoding providers

  private static parseGoogleGeocodingResult(result: any, coords: GeolocationCoords): Address {
    const components = result.address_components || []
    
    return {
      formatted_address: result.formatted_address,
      coordinates: coords,
      place_id: result.place_id,
      street_number: this.getAddressComponent(components, 'street_number'),
      street_name: this.getAddressComponent(components, 'route'),
      neighborhood: this.getAddressComponent(components, 'neighborhood'),
      city: this.getAddressComponent(components, 'locality') || 
            this.getAddressComponent(components, 'administrative_area_level_2'),
      state: this.getAddressComponent(components, 'administrative_area_level_1'),
      country: this.getAddressComponent(components, 'country'),
      postal_code: this.getAddressComponent(components, 'postal_code'),
      address_components: components
    }
  }

  private static parseNominatimResult(data: any, coords: GeolocationCoords): Address {
    const address = data.address || {}
    
    return {
      formatted_address: data.display_name,
      coordinates: coords,
      street_number: address.house_number,
      street_name: address.road,
      neighborhood: address.neighbourhood || address.suburb,
      city: address.city || address.town || address.village,
      state: address.state,
      country: address.country,
      postal_code: address.postcode
    }
  }

  private static parseBigDataCloudResult(data: any, coords: GeolocationCoords): Address {
    return {
      formatted_address: data.locality ? 
        `${data.locality}, ${data.countryName}` : 
        `${data.countryName}`,
      coordinates: coords,
      city: data.locality || data.city,
      state: data.principalSubdivision,
      country: data.countryName,
      postal_code: data.postcode
    }
  }

  private static getAddressComponent(components: any[], type: string): string {
    const component = components.find(comp => comp.types.includes(type))
    return component ? component.long_name : ''
  }

  private static async searchAddressesGoogle(query: string, bias?: GeolocationCoords): Promise<LocationSearchResult[]> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`
      
      if (bias) {
        url += `&location=${bias.lat},${bias.lng}&radius=50000`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Google Places request failed')
      }

      const data = await response.json()
      
      return data.predictions?.map((prediction: any) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        main_text: prediction.structured_formatting?.main_text || prediction.description,
        secondary_text: prediction.structured_formatting?.secondary_text || '',
        types: prediction.types || [],
        distance_meters: prediction.distance_meters
      })) || []
    } catch (error) {
      console.error('Google Places search error:', error)
      return []
    }
  }

  private static async searchAddressesNominatim(query: string, bias?: GeolocationCoords): Promise<LocationSearchResult[]> {
    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
      
      if (bias) {
        url += `&lat=${bias.lat}&lon=${bias.lng}&bounded=1&viewbox=${bias.lng-0.1},${bias.lat+0.1},${bias.lng+0.1},${bias.lat-0.1}`
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CarCareApp/1.0'
        }
      })

      if (!response.ok) {
        throw new Error('Nominatim search request failed')
      }

      const data = await response.json()
      
      return data.map((result: any) => ({
        place_id: result.place_id,
        description: result.display_name,
        main_text: result.name || result.display_name.split(',')[0],
        secondary_text: result.display_name.split(',').slice(1).join(',').trim(),
        types: result.type ? [result.type] : [],
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        }
      }))
    } catch (error) {
      console.error('Nominatim search error:', error)
      return []
    }
  }
}