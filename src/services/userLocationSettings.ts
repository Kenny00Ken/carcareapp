'use client'

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { EnhancedLocationService } from './enhancedLocation'
import type { 
  UserSettings,
  GeolocationCoords,
  LocationPermissionStatus 
} from '@/types'

export interface LocationSettings {
  location_enabled: boolean
  share_location_with_customers: boolean
  auto_update_location: boolean
  current_location?: {
    lat: number
    lng: number
    address?: string
    last_updated: string
    accuracy?: number
  }
  location_history_enabled: boolean
  location_tracking_consent: boolean
}

export class UserLocationSettingsService {
  
  /**
   * Initialize user location settings for new users
   */
  static async initializeLocationSettings(userId: string): Promise<void> {
    try {
      const settingsRef = doc(db, 'user_settings', userId)
      const settingsDoc = await getDoc(settingsRef)
      
      if (!settingsDoc.exists()) {
        const defaultSettings: Partial<UserSettings> = {
          user_id: userId,
          location_enabled: false,
          share_location_with_customers: false,
          auto_update_location: false,
          notifications_enabled: true,
          push_notifications: true,
          email_notifications: true,
          sms_notifications: false,
          notification_types: {
            new_requests: true,
            request_updates: true,
            messages: true,
            system_updates: true
          },
          show_online_status: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        await setDoc(settingsRef, defaultSettings)
        console.log('✅ Initialized location settings for user:', userId)
      }
    } catch (error) {
      console.error('❌ Error initializing location settings:', error)
      throw error
    }
  }

  /**
   * Enable location services for a user
   */
  static async enableLocationServices(userId: string): Promise<LocationPermissionStatus> {
    try {
      // Check browser support and permission
      const permissionStatus = await EnhancedLocationService.getPermissionStatus()
      
      if (!permissionStatus.granted) {
        console.warn('Location permission not granted by browser')
        return permissionStatus
      }

      // Get current location
      let currentLocation: GeolocationCoords | null = null
      let address: string | undefined

      try {
        currentLocation = await EnhancedLocationService.requestLocation({
          enableHighAccuracy: true,
          timeout: 15000,
          retryAttempts: 2
        })

        // Get address from coordinates
        const locationData = await EnhancedLocationService.reverseGeocode(currentLocation)
        address = locationData.formatted_address
      } catch (locationError) {
        console.warn('Could not get current location:', locationError)
        // Continue with enabling settings even if location fetch fails
      }

      // Update user settings
      const settingsRef = doc(db, 'user_settings', userId)
      const updateData: Partial<UserSettings> = {
        location_enabled: true,
        updated_at: new Date().toISOString()
      }

      if (currentLocation) {
        updateData.current_location = {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address,
          last_updated: new Date().toISOString()
        }
      }

      await updateDoc(settingsRef, updateData)
      
      console.log('✅ Location services enabled for user:', userId)
      return permissionStatus
    } catch (error) {
      console.error('❌ Error enabling location services:', error)
      throw error
    }
  }

  /**
   * Disable location services for a user
   */
  static async disableLocationServices(userId: string): Promise<void> {
    try {
      const settingsRef = doc(db, 'user_settings', userId)
      
      await updateDoc(settingsRef, {
        location_enabled: false,
        share_location_with_customers: false,
        auto_update_location: false,
        current_location: null,
        updated_at: new Date().toISOString()
      })
      
      console.log('✅ Location services disabled for user:', userId)
    } catch (error) {
      console.error('❌ Error disabling location services:', error)
      throw error
    }
  }

  /**
   * Update user's current location
   */
  static async updateCurrentLocation(
    userId: string, 
    coords: GeolocationCoords,
    address?: string
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'user_settings', userId)
      
      const locationData = {
        lat: coords.lat,
        lng: coords.lng,
        address: address || undefined,
        last_updated: new Date().toISOString()
      }

      await updateDoc(settingsRef, {
        current_location: locationData,
        updated_at: new Date().toISOString()
      })
      
      console.log('✅ Updated location for user:', userId)
    } catch (error) {
      console.error('❌ Error updating user location:', error)
      throw error
    }
  }

  /**
   * Get user's location settings
   */
  static async getUserLocationSettings(userId: string): Promise<UserSettings | null> {
    try {
      const settingsRef = doc(db, 'user_settings', userId)
      const settingsDoc = await getDoc(settingsRef)
      
      if (settingsDoc.exists()) {
        return { id: settingsDoc.id, ...settingsDoc.data() } as UserSettings
      }
      
      return null
    } catch (error) {
      console.error('❌ Error getting user location settings:', error)
      throw error
    }
  }

  /**
   * Update location sharing preferences
   */
  static async updateLocationSharingSettings(
    userId: string,
    settings: {
      share_location_with_customers?: boolean
      auto_update_location?: boolean
      show_online_status?: boolean
    }
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'user_settings', userId)
      
      await updateDoc(settingsRef, {
        ...settings,
        updated_at: new Date().toISOString()
      })
      
      console.log('✅ Updated location sharing settings for user:', userId)
    } catch (error) {
      console.error('❌ Error updating location sharing settings:', error)
      throw error
    }
  }

  /**
   * Subscribe to location settings changes
   */
  static subscribeToLocationSettings(
    userId: string,
    callback: (settings: UserSettings | null) => void
  ): () => void {
    const settingsRef = doc(db, 'user_settings', userId)
    
    return onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as UserSettings)
      } else {
        callback(null)
      }
    })
  }

  /**
   * Start automatic location tracking for a user
   */
  static startLocationTracking(userId: string): string | null {
    try {
      const sessionId = EnhancedLocationService.startLocationTracking(userId)
      console.log('✅ Started location tracking session:', sessionId)
      return sessionId
    } catch (error) {
      console.error('❌ Error starting location tracking:', error)
      return null
    }
  }

  /**
   * Stop location tracking for a user
   */
  static stopLocationTracking(sessionId: string): void {
    try {
      EnhancedLocationService.stopLocationTracking(sessionId)
      console.log('✅ Stopped location tracking session:', sessionId)
    } catch (error) {
      console.error('❌ Error stopping location tracking:', error)
    }
  }

  /**
   * Check if user has proper location setup for mechanic services
   */
  static async validateMechanicLocationSetup(userId: string): Promise<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
  }> {
    try {
      const settings = await this.getUserLocationSettings(userId)
      const issues: string[] = []
      const suggestions: string[] = []

      if (!settings) {
        issues.push('No location settings found')
        suggestions.push('Initialize location settings')
        return { isValid: false, issues, suggestions }
      }

      if (!settings.location_enabled) {
        issues.push('Location services disabled')
        suggestions.push('Enable location services to receive nearby requests')
      }

      if (!settings.share_location_with_customers) {
        issues.push('Location sharing disabled')
        suggestions.push('Enable location sharing to allow customers to find you')
      }

      if (!settings.current_location) {
        issues.push('No current location available')
        suggestions.push('Update your current location')
      } else {
        // Check if location is recent (within last hour)
        const lastUpdate = new Date(settings.current_location.last_updated)
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
        
        if (hoursSinceUpdate > 1) {
          issues.push('Location data is outdated')
          suggestions.push('Update your current location for better service matching')
        }
      }

      // Check browser permission
      const permissionStatus = await EnhancedLocationService.getPermissionStatus()
      if (!permissionStatus.granted) {
        issues.push('Browser location permission not granted')
        suggestions.push('Grant location permission in your browser settings')
      }

      return {
        isValid: issues.length === 0,
        issues,
        suggestions
      }
    } catch (error) {
      console.error('❌ Error validating mechanic location setup:', error)
      return {
        isValid: false,
        issues: ['Error checking location setup'],
        suggestions: ['Please try again or contact support']
      }
    }
  }

  /**
   * Get nearby mechanics for location-based features
   */
  static async getNearbyMechanics(
    userLocation: GeolocationCoords,
    radiusKm: number = 25
  ): Promise<Array<{ settings: UserSettings, distance: number }>> {
    try {
      // Query for mechanics with location enabled and shared
      const settingsQuery = query(
        collection(db, 'user_settings'),
        where('location_enabled', '==', true),
        where('share_location_with_customers', '==', true)
      )

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(settingsQuery, (snapshot) => {
          const nearbyMechanics: Array<{ settings: UserSettings, distance: number }> = []
          
          snapshot.docs.forEach((doc) => {
            const settings = { id: doc.id, ...doc.data() } as UserSettings
            
            if (settings.current_location) {
              const distance = EnhancedLocationService.calculateDistance(
                userLocation.lat,
                userLocation.lng,
                settings.current_location.lat,
                settings.current_location.lng
              )
              
              if (distance <= radiusKm) {
                nearbyMechanics.push({ settings, distance })
              }
            }
          })
          
          // Sort by distance
          nearbyMechanics.sort((a, b) => a.distance - b.distance)
          resolve(nearbyMechanics)
          unsubscribe()
        }, reject)
      })
    } catch (error) {
      console.error('❌ Error getting nearby mechanics:', error)
      return []
    }
  }
}