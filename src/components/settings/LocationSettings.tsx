'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Switch,
  Button,
  Alert,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Tooltip,
  message,
  Divider,
  List
} from 'antd'
import {
  EnvironmentOutlined,
  UserOutlined,
  SafetyOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { UserLocationSettingsService } from '@/services/userLocationSettings'
import { EnhancedLocationService } from '@/services/enhancedLocation'
import { LoadingButton } from '@/components/ui'
import type { 
  UserSettings, 
  LocationPermissionStatus, 
  GeolocationCoords 
} from '@/types'

const { Title, Text, Paragraph } = Typography

interface LocationSettingsProps {
  className?: string
}

export const LocationSettings: React.FC<LocationSettingsProps> = ({ className }) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus | null>(null)
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoords | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [updatingLocation, setUpdatingLocation] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
  } | null>(null)

  useEffect(() => {
    if (user) {
      loadLocationSettings()
      checkPermissionStatus()
      if (user.role === 'Mechanic') {
        validateMechanicSetup()
      }
    }
  }, [user])

  const loadLocationSettings = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userSettings = await UserLocationSettingsService.getUserLocationSettings(user.id)
      
      if (!userSettings) {
        // Initialize settings for new user
        await UserLocationSettingsService.initializeLocationSettings(user.id)
        const newSettings = await UserLocationSettingsService.getUserLocationSettings(user.id)
        setSettings(newSettings)
      } else {
        setSettings(userSettings)
      }
    } catch (error) {
      console.error('Error loading location settings:', error)
      message.error('Failed to load location settings')
    } finally {
      setLoading(false)
    }
  }

  const checkPermissionStatus = async () => {
    try {
      const status = await EnhancedLocationService.getPermissionStatus()
      setPermissionStatus(status)
    } catch (error) {
      console.error('Error checking permission status:', error)
    }
  }

  const validateMechanicSetup = async () => {
    if (!user) return

    try {
      const result = await UserLocationSettingsService.validateMechanicLocationSetup(user.id)
      setValidationResult(result)
    } catch (error) {
      console.error('Error validating mechanic setup:', error)
    }
  }

  const handleEnableLocation = async () => {
    if (!user) return

    setUpdating(true)
    try {
      const status = await UserLocationSettingsService.enableLocationServices(user.id)
      setPermissionStatus(status)
      
      if (status.granted) {
        await loadLocationSettings()
        message.success('Location services enabled successfully!')
        
        if (user.role === 'Mechanic') {
          await validateMechanicSetup()
        }
      } else {
        message.warning('Location permission not granted. Please enable in browser settings.')
      }
    } catch (error) {
      console.error('Error enabling location services:', error)
      message.error('Failed to enable location services')
    } finally {
      setUpdating(false)
    }
  }

  const handleDisableLocation = async () => {
    if (!user) return

    setUpdating(true)
    try {
      await UserLocationSettingsService.disableLocationServices(user.id)
      await loadLocationSettings()
      message.success('Location services disabled')
      
      if (user.role === 'Mechanic') {
        await validateMechanicSetup()
      }
    } catch (error) {
      console.error('Error disabling location services:', error)
      message.error('Failed to disable location services')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateLocation = async () => {
    if (!user) return

    setUpdatingLocation(true)
    try {
      const coords = await EnhancedLocationService.requestLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        retryAttempts: 2
      })

      const address = await EnhancedLocationService.reverseGeocode(coords)
      await UserLocationSettingsService.updateCurrentLocation(
        user.id, 
        coords, 
        address.formatted_address
      )

      setCurrentLocation(coords)
      await loadLocationSettings()
      message.success('Location updated successfully!')
      
      if (user.role === 'Mechanic') {
        await validateMechanicSetup()
      }
    } catch (error) {
      console.error('Error updating location:', error)
      message.error('Failed to update location. Please check your location settings.')
    } finally {
      setUpdatingLocation(false)
    }
  }

  const handleSharingSettingChange = async (key: string, value: boolean) => {
    if (!user) return

    setUpdating(true)
    try {
      await UserLocationSettingsService.updateLocationSharingSettings(user.id, {
        [key]: value
      })
      
      await loadLocationSettings()
      message.success('Setting updated successfully!')
      
      if (user.role === 'Mechanic') {
        await validateMechanicSetup()
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      message.error('Failed to update setting')
    } finally {
      setUpdating(false)
    }
  }

  const renderPermissionStatus = () => {
    if (!permissionStatus) return null

    if (permissionStatus.unavailable) {
      return (
        <Alert
          type="warning"
          message="Location Not Supported"
          description="Your browser doesn't support location services."
          icon={<WarningOutlined />}
          showIcon
        />
      )
    }

    if (permissionStatus.denied) {
      return (
        <Alert
          type="error"
          message="Location Access Denied"
          description="Location access has been denied. Please enable it in your browser settings to use location features."
          icon={<WarningOutlined />}
          showIcon
          action={
            <Button size="small" onClick={checkPermissionStatus}>
              Recheck Status
            </Button>
          }
        />
      )
    }

    if (permissionStatus.granted) {
      return (
        <Alert
          type="success"
          message="Location Access Granted"
          description="Your browser has granted location access."
          icon={<CheckCircleOutlined />}
          showIcon
        />
      )
    }

    return (
      <Alert
        type="info"
        message="Location Permission Required"
        description="Click 'Enable Location Services' to grant location access."
        icon={<InfoCircleOutlined />}
        showIcon
      />
    )
  }

  const renderMechanicValidation = () => {
    if (!validationResult || user?.role !== 'Mechanic') return null

    return (
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <Title level={5} className="!mb-0">
            Mechanic Location Setup
          </Title>
          <Tag color={validationResult.isValid ? 'green' : 'orange'}>
            {validationResult.isValid ? 'Complete' : 'Needs Attention'}
          </Tag>
        </div>

        {!validationResult.isValid && (
          <div className="space-y-3">
            {validationResult.issues.length > 0 && (
              <div>
                <Text strong className="text-red-600">Issues:</Text>
                <List
                  size="small"
                  dataSource={validationResult.issues}
                  renderItem={issue => (
                    <List.Item className="!px-0 !py-1">
                      <Text type="danger">• {issue}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {validationResult.suggestions.length > 0 && (
              <div>
                <Text strong className="text-blue-600">Suggestions:</Text>
                <List
                  size="small"
                  dataSource={validationResult.suggestions}
                  renderItem={suggestion => (
                    <List.Item className="!px-0 !py-1">
                      <Text>• {suggestion}</Text>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center py-8">
          <SyncOutlined spin className="text-2xl text-blue-500" />
          <Text className="ml-3">Loading location settings...</Text>
        </div>
      </Card>
    )
  }

  return (
    <div className={className}>
      {renderMechanicValidation()}
      
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Title level={4} className="!mb-2 flex items-center gap-2">
                <EnvironmentOutlined className="text-blue-500" />
                Location Services
              </Title>
              <Text type="secondary">
                Manage your location settings and privacy preferences
              </Text>
            </div>
          </div>

          {renderPermissionStatus()}

          <Divider />

          {/* Main Location Toggle */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <Row justify="space-between" align="middle">
              <Col>
                <div>
                  <Text strong className="flex items-center gap-2">
                    <EnvironmentOutlined />
                    Enable Location Services
                  </Text>
                  <div className="mt-1">
                    <Text type="secondary" className="text-sm">
                      Allow the app to access your location for better service matching
                    </Text>
                  </div>
                </div>
              </Col>
              <Col>
                <Switch
                  checked={settings?.location_enabled || false}
                  loading={updating}
                  onChange={(checked) => {
                    if (checked) {
                      handleEnableLocation()
                    } else {
                      handleDisableLocation()
                    }
                  }}
                />
              </Col>
            </Row>
          </div>

          <AnimatePresence>
            {settings?.location_enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Current Location */}
                <Card size="small" className="bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Text strong>Current Location</Text>
                      <div className="mt-1">
                        {settings.current_location ? (
                          <div>
                            <Text className="text-sm">
                              {settings.current_location.address || 
                               `${settings.current_location.lat.toFixed(4)}, ${settings.current_location.lng.toFixed(4)}`}
                            </Text>
                            <div className="mt-1">
                              <Text type="secondary" className="text-xs">
                                Updated: {new Date(settings.current_location.last_updated).toLocaleString()}
                              </Text>
                            </div>
                          </div>
                        ) : (
                          <Text type="secondary" className="text-sm">
                            No location available
                          </Text>
                        )}
                      </div>
                    </div>
                    <LoadingButton
                      icon={<SyncOutlined />}
                      onClick={handleUpdateLocation}
                      loading={updatingLocation}
                      size="small"
                      type="primary"
                    >
                      Update
                    </LoadingButton>
                  </div>
                </Card>

                {/* Location Sharing Settings */}
                <div className="space-y-3">
                  <Title level={5}>Privacy & Sharing</Title>
                  
                  {user?.role === 'Mechanic' && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <Row justify="space-between" align="middle">
                        <Col>
                          <div>
                            <Text strong className="flex items-center gap-2">
                              <UserOutlined />
                              Share Location with Customers
                            </Text>
                            <div className="mt-1">
                              <Text type="secondary" className="text-sm">
                                Allow customers to see your location for service requests
                              </Text>
                            </div>
                          </div>
                        </Col>
                        <Col>
                          <Switch
                            checked={settings?.share_location_with_customers || false}
                            loading={updating}
                            onChange={(checked) => 
                              handleSharingSettingChange('share_location_with_customers', checked)
                            }
                          />
                        </Col>
                      </Row>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <div>
                          <Text strong className="flex items-center gap-2">
                            <SyncOutlined />
                            Auto-Update Location
                          </Text>
                          <div className="mt-1">
                            <Text type="secondary" className="text-sm">
                              Automatically update your location when it changes
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col>
                        <Switch
                          checked={settings?.auto_update_location || false}
                          loading={updating}
                          onChange={(checked) => 
                            handleSharingSettingChange('auto_update_location', checked)
                          }
                        />
                      </Col>
                    </Row>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <Row justify="space-between" align="middle">
                      <Col>
                        <div>
                          <Text strong className="flex items-center gap-2">
                            {settings?.show_online_status ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            Show Online Status
                          </Text>
                          <div className="mt-1">
                            <Text type="secondary" className="text-sm">
                              Display your online/offline status to other users
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col>
                        <Switch
                          checked={settings?.show_online_status || false}
                          loading={updating}
                          onChange={(checked) => 
                            handleSharingSettingChange('show_online_status', checked)
                          }
                        />
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Information Section */}
                <Alert
                  type="info"
                  message="Location Privacy"
                  description="Your location data is encrypted and only shared according to your preferences. You can disable location services at any time."
                  icon={<SafetyOutlined />}
                  showIcon
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}