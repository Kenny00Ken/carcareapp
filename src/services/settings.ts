'use client'

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { UserSettings, MechanicSettings, User } from '@/types'
import { LocationService } from './location'

export class SettingsService {
  /**
   * Get default settings for a user based on their role
   */
  static getDefaultSettings(user: User): Omit<UserSettings, 'id'> {
    const defaultMechanicSettings: MechanicSettings = {
      service_radius: 25, // 25km default
      auto_accept_radius: 5, // 5km auto-accept
      working_hours: {
        enabled: true,
        schedule: {
          monday: { enabled: true, start: '08:00', end: '18:00' },
          tuesday: { enabled: true, start: '08:00', end: '18:00' },
          wednesday: { enabled: true, start: '08:00', end: '18:00' },
          thursday: { enabled: true, start: '08:00', end: '18:00' },
          friday: { enabled: true, start: '08:00', end: '18:00' },
          saturday: { enabled: true, start: '09:00', end: '16:00' },
          sunday: { enabled: false, start: '09:00', end: '16:00' }
        }
      },
      max_concurrent_requests: 3,
      minimum_job_value: 50, // GHS 50 minimum
      preferred_urgency_levels: ['low', 'medium', 'high'],
      emergency_services: false,
      auto_accept_requests: false,
      auto_accept_conditions: {
        within_radius: true,
        during_working_hours: true,
        below_max_concurrent: true
      }
    }

    return {
      user_id: user.id,
      
      // Location Settings
      location_enabled: false,
      auto_update_location: false,
      
      // Notification Settings
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
      
      // Privacy Settings
      share_location_with_customers: user.role === 'Mechanic',
      show_online_status: true,
      
      // Mechanic-specific Settings
      ...(user.role === 'Mechanic' && { mechanic_settings: defaultMechanicSettings }),
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Get user settings
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const docSnap = await getDoc(doc(db, 'user_settings', userId))
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserSettings
      }
      
      return null
    } catch (error) {
      console.error('Error getting user settings:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to get user settings: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Create or update user settings
   */
  static async saveUserSettings(settings: Partial<UserSettings> & { user_id: string }): Promise<void> {
    try {
      const settingsRef = doc(db, 'user_settings', settings.user_id)
      
      // Remove undefined values from settings to prevent Firestore errors
      const cleanSettings = Object.fromEntries(
        Object.entries(settings).filter(([_, value]) => value !== undefined)
      )
      
      await setDoc(settingsRef, {
        ...cleanSettings,
        updated_at: Timestamp.now().toDate().toISOString()
      }, { merge: true })
      
    } catch (error) {
      console.error('Error saving user settings:', error)
      throw error
    }
  }

  /**
   * Initialize settings for a new user
   */
  static async initializeUserSettings(user: User): Promise<UserSettings> {
    try {
      if (!user || !user.id) {
        throw new Error('User object or user ID is missing')
      }
      
      const existingSettings = await this.getUserSettings(user.id)
      
      if (existingSettings) {
        return existingSettings
      }

      const defaultSettings = this.getDefaultSettings(user)
      await this.saveUserSettings(defaultSettings)
      
      return { id: user.id, ...defaultSettings }
    } catch (error) {
      console.error('Error initializing user settings:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to initialize user settings: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Update location settings
   */
  static async updateLocationSettings(
    userId: string, 
    locationSettings: {
      location_enabled: boolean
      auto_update_location?: boolean
      share_location_with_customers?: boolean
    }
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'user_settings', userId)
      
      await updateDoc(settingsRef, {
        ...locationSettings,
        updated_at: Timestamp.now().toDate().toISOString()
      })
      
    } catch (error) {
      console.error('Error updating location settings:', error)
      throw error
    }
  }

  /**
   * Update current location
   */
  static async updateCurrentLocation(userId: string): Promise<void> {
    try {
      const coords = await LocationService.getCurrentPosition()
      const address = await LocationService.getAddressFromCoords(coords.lat, coords.lng)
      
      const settingsRef = doc(db, 'user_settings', userId)
      
      await updateDoc(settingsRef, {
        current_location: {
          lat: coords.lat,
          lng: coords.lng,
          address,
          last_updated: new Date().toISOString()
        },
        updated_at: Timestamp.now().toDate().toISOString()
      })
      
    } catch (error) {
      console.error('Error updating current location:', error)
      throw error
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    userId: string,
    notificationSettings: {
      notifications_enabled?: boolean
      push_notifications?: boolean
      email_notifications?: boolean
      sms_notifications?: boolean
      notification_types?: {
        new_requests?: boolean
        request_updates?: boolean
        messages?: boolean
        system_updates?: boolean
      }
    }
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'user_settings', userId)
      
      await updateDoc(settingsRef, {
        ...notificationSettings,
        updated_at: Timestamp.now().toDate().toISOString()
      })
      
    } catch (error) {
      console.error('Error updating notification settings:', error)
      throw error
    }
  }

  /**
   * Update mechanic-specific settings
   */
  static async updateMechanicSettings(
    userId: string,
    mechanicSettings: Partial<MechanicSettings>
  ): Promise<void> {
    try {
      const settingsRef = doc(db, 'user_settings', userId)
      const currentSettings = await this.getUserSettings(userId)
      
      if (!currentSettings) {
        throw new Error('User settings not found')
      }

      const updatedMechanicSettings = {
        ...currentSettings.mechanic_settings,
        ...mechanicSettings
      }
      
      await updateDoc(settingsRef, {
        mechanic_settings: updatedMechanicSettings,
        updated_at: Timestamp.now().toDate().toISOString()
      })
      
    } catch (error) {
      console.error('Error updating mechanic settings:', error)
      throw error
    }
  }

  /**
   * Subscribe to settings changes
   */
  static subscribeToSettings(
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
    }, (error) => {
      console.error('Error listening to settings changes:', error)
      callback(null)
    })
  }

  /**
   * Get mechanics within a specific radius of a location
   */
  static async getMechanicsInRadius(
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): Promise<UserSettings[]> {
    try {
      const q = query(
        collection(db, 'user_settings'),
        where('location_enabled', '==', true),
        where('share_location_with_customers', '==', true)
      )
      
      const querySnapshot = await getDocs(q)
      const mechanicsInRadius: UserSettings[] = []
      
      querySnapshot.docs.forEach(doc => {
        const settings = { id: doc.id, ...doc.data() } as UserSettings
        
        if (settings.current_location && settings.mechanic_settings) {
          const distance = LocationService.calculateDistance(
            centerLat,
            centerLng,
            settings.current_location.lat,
            settings.current_location.lng
          )
          
          if (distance <= radiusKm) {
            mechanicsInRadius.push(settings)
          }
        }
      })
      
      return mechanicsInRadius
    } catch (error) {
      console.error('Error getting mechanics in radius:', error)
      throw error
    }
  }

  /**
   * Check if a request location is within a mechanic's service radius
   */
  static async isRequestWithinMechanicRadius(
    mechanicUserId: string,
    requestLat: number,
    requestLng: number
  ): Promise<boolean> {
    try {
      const settings = await this.getUserSettings(mechanicUserId)
      
      if (!settings || !settings.current_location || !settings.mechanic_settings) {
        return false
      }
      
      return LocationService.isWithinRadius(
        settings.current_location.lat,
        settings.current_location.lng,
        requestLat,
        requestLng,
        settings.mechanic_settings.service_radius
      )
    } catch (error) {
      console.error('Error checking request radius:', error)
      return false
    }
  }

  /**
   * Get mechanics available for a specific request location
   */
  static async getAvailableMechanicsForLocation(
    requestLat: number,
    requestLng: number
  ): Promise<UserSettings[]> {
    try {
      const q = query(
        collection(db, 'user_settings'),
        where('location_enabled', '==', true),
        where('share_location_with_customers', '==', true)
      )
      
      const querySnapshot = await getDocs(q)
      const availableMechanics: UserSettings[] = []
      
      querySnapshot.docs.forEach(doc => {
        const settings = { id: doc.id, ...doc.data() } as UserSettings
        
        if (settings.current_location && settings.mechanic_settings) {
          const isWithinRadius = LocationService.isWithinRadius(
            settings.current_location.lat,
            settings.current_location.lng,
            requestLat,
            requestLng,
            settings.mechanic_settings.service_radius
          )
          
          if (isWithinRadius) {
            availableMechanics.push(settings)
          }
        }
      })
      
      // Sort by distance
      availableMechanics.sort((a, b) => {
        if (!a.current_location || !b.current_location) return 0
        
        const distanceA = LocationService.calculateDistance(
          requestLat, requestLng,
          a.current_location.lat, a.current_location.lng
        )
        
        const distanceB = LocationService.calculateDistance(
          requestLat, requestLng,
          b.current_location.lat, b.current_location.lng
        )
        
        return distanceA - distanceB
      })
      
      return availableMechanics
    } catch (error) {
      console.error('Error getting available mechanics for location:', error)
      throw error
    }
  }
}