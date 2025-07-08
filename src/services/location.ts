'use client'

import { GeolocationCoords, LocationPermissionStatus } from '@/types'

export class LocationService {
  /**
   * Check if we're running on the client side
   */
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined'
  }
  private static readonly DEFAULT_TIMEOUT = 10000 // 10 seconds
  private static readonly MAXIMUM_AGE = 300000 // 5 minutes
  private static readonly HIGH_ACCURACY = true

  /**
   * Check if geolocation is supported by the browser
   */
  static isSupported(): boolean {
    return this.isClient() && 'geolocation' in navigator
  }

  /**
   * Check current permission status for geolocation
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

    // Legacy fallback - try to get position to determine permission
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
   * Request location permission and get current position
   */
  static async requestPermissionAndGetLocation(): Promise<GeolocationCoords> {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser')
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
          let errorMessage = 'Failed to get location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
            default:
              errorMessage = 'Unknown error occurred while retrieving location'
              break
          }
          
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: this.HIGH_ACCURACY,
          timeout: this.DEFAULT_TIMEOUT,
          maximumAge: this.MAXIMUM_AGE
        }
      )
    })
  }

  /**
   * Get current position without requesting permission (assumes permission already granted)
   */
  static async getCurrentPosition(): Promise<GeolocationCoords> {
    const permissionStatus = await this.getPermissionStatus()
    
    if (!permissionStatus.granted) {
      throw new Error('Location permission not granted')
    }

    return this.requestPermissionAndGetLocation()
  }

  /**
   * Watch position changes
   */
  static watchPosition(
    onSuccess: (coords: GeolocationCoords) => void,
    onError?: (error: string) => void
  ): number {
    if (!this.isSupported()) {
      onError?.('Geolocation is not supported by this browser')
      return -1
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
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
        let errorMessage = 'Failed to watch location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        
        onError?.(errorMessage)
      },
      {
        enableHighAccuracy: this.HIGH_ACCURACY,
        timeout: this.DEFAULT_TIMEOUT,
        maximumAge: this.MAXIMUM_AGE
      }
    )
  }

  /**
   * Clear position watch
   */
  static clearWatch(watchId: number): void {
    if (this.isSupported()) {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
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
   * Check if a coordinate is within a given radius of another coordinate
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
   * Reverse geocoding - get address from coordinates (using browser's geocoding or fallback)
   */
  static async getAddressFromCoords(lat: number, lng: number): Promise<string> {
    try {
      // Using a simple geocoding service (you might want to use Google Maps API or similar)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      )
      
      if (response.ok) {
        const data = await response.json()
        return data.locality ? 
          `${data.locality}, ${data.countryName}` : 
          `${data.countryName}`
      }
    } catch (error) {
      console.warn('Geocoding failed:', error)
    }
    
    // Fallback to coordinates
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  /**
   * Get formatted coordinates string
   */
  static formatCoordinates(lat: number, lng: number, precision: number = 4): string {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
  }

  /**
   * Validate coordinates
   */
  static isValidCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }

  /**
   * Convert degrees to radians
   */
  private static toRadian(degree: number): number {
    return degree * (Math.PI / 180)
  }

  /**
   * Get location with timeout and retry logic
   */
  static async getLocationWithRetry(
    maxRetries: number = 3,
    timeoutMs: number = 5000
  ): Promise<GeolocationCoords> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const coords = await Promise.race([
          this.requestPermissionAndGetLocation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Location request timed out')), timeoutMs)
          )
        ])
        
        return coords
      } catch (error) {
        lastError = error as Error
        console.warn(`Location attempt ${attempt} failed:`, error)
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error('Failed to get location after retries')
  }
}