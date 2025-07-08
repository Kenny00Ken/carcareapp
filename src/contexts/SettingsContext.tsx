'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { UserSettings, MechanicSettings, GeolocationCoords } from '@/types'
import { SettingsService } from '@/services/settings'
import { LocationService } from '@/services/location'
import { useAuth } from './AuthContext'
import { App } from 'antd'

interface SettingsContextType {
  settings: UserSettings | null
  loading: boolean
  
  // Location functions
  requestLocationPermission: () => Promise<void>
  updateCurrentLocation: () => Promise<void>
  toggleLocationSharing: (enabled: boolean) => Promise<void>
  toggleAutoUpdateLocation: (enabled: boolean) => Promise<void>
  
  // Notification functions
  updateNotificationSettings: (notificationSettings: any) => Promise<void>
  toggleNotifications: (enabled: boolean) => Promise<void>
  
  // Mechanic functions
  updateMechanicSettings: (mechanicSettings: Partial<MechanicSettings>) => Promise<void>
  updateServiceRadius: (radius: number) => Promise<void>
  updateWorkingHours: (workingHours: MechanicSettings['working_hours']) => Promise<void>
  
  // General
  refreshSettings: () => Promise<void>
  isLocationEnabled: boolean
  hasLocationPermission: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const { message } = App.useApp()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasLocationPermission, setHasLocationPermission] = useState(false)

  // Initialize settings when user changes
  useEffect(() => {
    const initializeSettings = async () => {
      if (!user) {
        setSettings(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Ensure Firebase connection is ready
        if (!user.id) {
          throw new Error('User ID not available')
        }
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Settings initialization timeout')), 10000)
        )
        
        // Initialize settings if they don't exist with timeout
        const userSettings = await Promise.race([
          SettingsService.initializeUserSettings(user),
          timeoutPromise
        ]) as UserSettings
        
        setSettings(userSettings)
        
        // Check location permission (non-blocking)
        try {
          const permissionStatus = await LocationService.getPermissionStatus()
          setHasLocationPermission(permissionStatus.granted)
        } catch (locationError) {
          console.warn('Location permission check failed:', locationError)
          setHasLocationPermission(false)
        }
        
      } catch (error) {
        console.error('Error initializing settings:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Only show critical errors to user
        if (errorMessage.includes('timeout')) {
          console.warn('Settings initialization timed out - using defaults')
          // Set basic settings without showing error to user
          setSettings({
            id: user.id,
            user_id: user.id,
            location_enabled: false,
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
            share_location_with_customers: user.role === 'Mechanic',
            show_online_status: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        } else if (errorMessage.includes('User ID')) {
          message.error('User authentication required. Please sign in again.')
        }
      } finally {
        setLoading(false)
      }
    }

    initializeSettings()
  }, [user, message])

  // Subscribe to settings changes
  useEffect(() => {
    if (!user) return

    const unsubscribe = SettingsService.subscribeToSettings(user.id, (updatedSettings) => {
      setSettings(updatedSettings)
    })

    return unsubscribe
  }, [user])

  const requestLocationPermission = async (): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')

      const coords = await LocationService.requestPermissionAndGetLocation()
      setHasLocationPermission(true)
      
      // Update settings with location enabled and current location
      await SettingsService.updateLocationSettings(user.id, {
        location_enabled: true
      })
      
      await SettingsService.updateCurrentLocation(user.id)
      
      message.success('Location access granted successfully')
    } catch (error) {
      console.error('Error requesting location permission:', error)
      message.error('Failed to access location: ' + (error as Error).message)
      throw error
    }
  }

  const updateCurrentLocation = async (): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      await SettingsService.updateCurrentLocation(user.id)
      message.success('Location updated successfully')
    } catch (error) {
      console.error('Error updating location:', error)
      message.error('Failed to update location')
      throw error
    }
  }

  const toggleLocationSharing = async (enabled: boolean): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      if (enabled && !hasLocationPermission) {
        await requestLocationPermission()
      }
      
      await SettingsService.updateLocationSettings(user.id, {
        location_enabled: enabled,
        share_location_with_customers: enabled && user.role === 'Mechanic'
      })
      
      message.success(`Location sharing ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error toggling location sharing:', error)
      message.error('Failed to update location sharing')
      throw error
    }
  }

  const toggleAutoUpdateLocation = async (enabled: boolean): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      await SettingsService.updateLocationSettings(user.id, {
        auto_update_location: enabled
      })
      
      message.success(`Auto location update ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error toggling auto location update:', error)
      message.error('Failed to update auto location setting')
      throw error
    }
  }

  const updateNotificationSettings = async (notificationSettings: any): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      await SettingsService.updateNotificationSettings(user.id, notificationSettings)
      message.success('Notification settings updated')
    } catch (error) {
      console.error('Error updating notification settings:', error)
      message.error('Failed to update notification settings')
      throw error
    }
  }

  const toggleNotifications = async (enabled: boolean): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      await SettingsService.updateNotificationSettings(user.id, {
        notifications_enabled: enabled,
        push_notifications: enabled
      })
      
      message.success(`Notifications ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error toggling notifications:', error)
      message.error('Failed to update notifications')
      throw error
    }
  }

  const updateMechanicSettings = async (mechanicSettings: Partial<MechanicSettings>): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')
      if (user.role !== 'Mechanic') throw new Error('User is not a mechanic')
      
      await SettingsService.updateMechanicSettings(user.id, mechanicSettings)
      message.success('Mechanic settings updated')
    } catch (error) {
      console.error('Error updating mechanic settings:', error)
      message.error('Failed to update mechanic settings')
      throw error
    }
  }

  const updateServiceRadius = async (radius: number): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      await SettingsService.updateMechanicSettings(user.id, {
        service_radius: radius
      })
      
      message.success(`Service radius updated to ${radius}km`)
    } catch (error) {
      console.error('Error updating service radius:', error)
      message.error('Failed to update service radius')
      throw error
    }
  }

  const updateWorkingHours = async (workingHours: MechanicSettings['working_hours']): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      await SettingsService.updateMechanicSettings(user.id, {
        working_hours: workingHours
      })
      
      message.success('Working hours updated')
    } catch (error) {
      console.error('Error updating working hours:', error)
      message.error('Failed to update working hours')
      throw error
    }
  }

  const refreshSettings = async (): Promise<void> => {
    try {
      if (!user) return
      
      setLoading(true)
      const userSettings = await SettingsService.getUserSettings(user.id)
      setSettings(userSettings)
      
      // Check location permission
      const permissionStatus = await LocationService.getPermissionStatus()
      setHasLocationPermission(permissionStatus.granted)
      
    } catch (error) {
      console.error('Error refreshing settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Show specific error messages for better debugging
      if (errorMessage.includes('permission')) {
        message.error('Failed to check location permissions')
      } else if (errorMessage.includes('Firebase')) {
        message.error('Connection issue. Please check your internet connection.')
      } else {
        message.error('Failed to refresh settings. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isLocationEnabled = settings?.location_enabled || false

  const value: SettingsContextType = {
    settings,
    loading,
    
    // Location functions
    requestLocationPermission,
    updateCurrentLocation,
    toggleLocationSharing,
    toggleAutoUpdateLocation,
    
    // Notification functions
    updateNotificationSettings,
    toggleNotifications,
    
    // Mechanic functions
    updateMechanicSettings,
    updateServiceRadius,
    updateWorkingHours,
    
    // General
    refreshSettings,
    isLocationEnabled,
    hasLocationPermission
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}