'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  List, 
  Typography, 
  Space, 
  Divider, 
  Alert, 
  Tooltip,
  Row,
  Col,
  message
} from 'antd'
import {
  EnvironmentOutlined,
  SearchOutlined,
  AimOutlined,
  CheckOutlined,
  LoadingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedLocationService } from '@/services/enhancedLocation'
import { LoadingButton, LoadingSpinner } from '@/components/ui'
import { useLoading } from '@/hooks/useLoading'
import type { 
  Address, 
  LocationSearchResult, 
  GeolocationCoords,
  LocationPermissionStatus 
} from '@/types/location'

const { Text, Title } = Typography
const { Search } = Input

interface AddressSelectorProps {
  value?: Address
  onChange?: (address: Address) => void
  placeholder?: string
  showCurrentLocation?: boolean
  showMap?: boolean
  className?: string
  disabled?: boolean
  required?: boolean
  label?: string
  allowManualEntry?: boolean
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  value,
  onChange,
  placeholder = "Search for an address...",
  showCurrentLocation = true,
  showMap = false,
  className,
  disabled = false,
  required = false,
  label = "Address",
  allowManualEntry = true
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(value || null)
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoords | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus | null>(null)
  const [showResults, setShowResults] = useState(false)
  
  const { loading: searching, setLoading: setSearching } = useLoading()
  const { loading: gettingLocation, setLoading: setGettingLocation } = useLoading()
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Check location permission on mount and cleanup on unmount
  useEffect(() => {
    checkLocationPermission()
    
    return () => {
      // Cleanup timeout on unmount
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Update local state when value prop changes
  useEffect(() => {
    setSelectedAddress(value || null)
    if (value) {
      setSearchQuery(value.formatted_address)
    }
  }, [value])

  const checkLocationPermission = async () => {
    try {
      const status = await EnhancedLocationService.getPermissionStatus()
      setPermissionStatus(status)
    } catch (error) {
      console.error('Error checking location permission:', error)
    }
  }

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    // Prevent concurrent searches
    if (searching) {
      return
    }

    setSearching(true)
    try {
      const results = await EnhancedLocationService.searchAddresses(
        query.trim(), 
        currentLocation || undefined
      )
      
      // Validate and filter results
      const validResults = results.filter(result => 
        result && 
        result.place_id && 
        result.description && 
        result.main_text
      )
      
      setSearchResults(validResults)
      setShowResults(validResults.length > 0)
      
      if (validResults.length === 0) {
        console.warn('No valid search results found for query:', query)
      }
    } catch (error) {
      console.error('Address search error:', error)
      message.error('Failed to search addresses. Please check your connection and try again.')
      setSearchResults([])
      setShowResults(false)
    } finally {
      setSearching(false)
    }
  }, [currentLocation, searching, setSearching])

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query)
    }, 500)
  }, [handleSearch])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }

  const handleSelectAddress = async (result: LocationSearchResult) => {
    if (!result || !result.place_id) {
      message.error('Invalid address selection')
      return
    }

    setSearching(true)
    try {
      let address: Address

      if (result.coordinates && EnhancedLocationService.isValidCoordinates(result.coordinates.lat, result.coordinates.lng)) {
        // Get full address details using reverse geocoding
        address = await EnhancedLocationService.reverseGeocode(result.coordinates)
        address.place_id = result.place_id
      } else {
        // Create address from search result and geocode for coordinates
        address = {
          formatted_address: result.description,
          place_id: result.place_id,
          city: result.secondary_text?.split(',')[0]?.trim() || 'Unknown City',
          country: result.secondary_text?.split(',').pop()?.trim() || 'Unknown Country',
          coordinates: { lat: 0, lng: 0 }
        }

        // Try to get coordinates if we don't have them
        try {
          const searchResults = await EnhancedLocationService.searchAddresses(result.description)
          if (searchResults.length > 0 && searchResults[0].coordinates) {
            address.coordinates = searchResults[0].coordinates
          }
        } catch (geocodeError) {
          console.warn('Failed to geocode address:', geocodeError)
          // Continue with 0,0 coordinates - better than failing completely
        }
      }

      // Validate the final address
      if (!address.formatted_address || !address.city || !address.country) {
        throw new Error('Incomplete address information')
      }

      setSelectedAddress(address)
      setSearchQuery(address.formatted_address)
      setShowResults(false)
      onChange?.(address)
    } catch (error) {
      console.error('Error selecting address:', error)
      message.error('Failed to select address. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleUseCurrentLocation = async () => {
    setGettingLocation(true)
    try {
      const coords = await EnhancedLocationService.requestLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        retryAttempts: 2
      })

      setCurrentLocation(coords)
      
      const address = await EnhancedLocationService.reverseGeocode(coords)
      setSelectedAddress(address)
      setSearchQuery(address.formatted_address)
      setShowResults(false)
      onChange?.(address)
      
      message.success('Current location detected successfully!')
    } catch (error) {
      console.error('Error getting current location:', error)
      message.error('Failed to get current location. Please check your location settings.')
    } finally {
      setGettingLocation(false)
    }
  }

  const handleManualEntry = () => {
    if (searchQuery.trim() && allowManualEntry) {
      const manualAddress: Address = {
        formatted_address: searchQuery.trim(),
        city: 'Manual Entry',
        country: 'Unknown',
        coordinates: { lat: 0, lng: 0 }
      }
      
      setSelectedAddress(manualAddress)
      setShowResults(false)
      onChange?.(manualAddress)
    }
  }

  const renderLocationPermissionAlert = () => {
    if (!permissionStatus || permissionStatus.granted || permissionStatus.unavailable) {
      return null
    }

    if (permissionStatus.denied) {
      return (
        <Alert
          type="warning"
          message="Location Access Blocked"
          description="Location access has been denied. To use current location, please enable location access in your browser settings."
          icon={<InfoCircleOutlined />}
          className="mb-4"
          showIcon
        />
      )
    }

    return (
      <Alert
        type="info"
        message="Location Permission Required"
        description="Click 'Use Current Location' to allow location access for faster address detection."
        icon={<InfoCircleOutlined />}
        className="mb-4"
        showIcon
      />
    )
  }

  return (
    <div className={className}>
      {label && (
        <div className="mb-2">
          <Text strong className="text-gray-700 dark:text-gray-300">
            <EnvironmentOutlined className="mr-2" />
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Text>
        </div>
      )}

      {renderLocationPermissionAlert()}

      <Card className="shadow-sm border border-gray-200 dark:border-gray-600">
        <Space direction="vertical" className="w-full">
          {/* Search Input */}
          <div className="relative">
            <Search
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchInputChange}
              disabled={disabled}
              size="large"
              className="w-full"
              suffix={
                searching ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <SearchOutlined className="text-gray-400" />
                )
              }
              onSearch={handleManualEntry}
              enterButton={allowManualEntry ? "Use This Address" : false}
            />
          </div>

          {/* Current Location Button */}
          {showCurrentLocation && !disabled && (
            <Row gutter={[8, 8]}>
              <Col flex="auto">
                <LoadingButton
                  icon={<AimOutlined />}
                  onClick={handleUseCurrentLocation}
                  loading={gettingLocation}
                  disabled={permissionStatus?.denied || permissionStatus?.unavailable}
                  block
                  size="middle"
                  loadingText="Getting location..."
                >
                  Use Current Location
                </LoadingButton>
              </Col>
              {permissionStatus?.denied && (
                <Col>
                  <Tooltip title="Location access is blocked. Please enable it in browser settings.">
                    <Button icon={<InfoCircleOutlined />} disabled />
                  </Tooltip>
                </Col>
              )}
            </Row>
          )}

          {/* Search Results */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Divider className="my-3" />
                <Text type="secondary" className="text-sm">
                  Search Results ({searchResults.length})
                </Text>
                <List
                  dataSource={searchResults.slice(0, 5)}
                  renderItem={(result, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <List.Item
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                        onClick={() => handleSelectAddress(result)}
                      >
                        <List.Item.Meta
                          avatar={<EnvironmentOutlined className="text-blue-500" />}
                          title={
                            <Text className="text-sm font-medium">
                              {result.main_text}
                            </Text>
                          }
                          description={
                            <Text type="secondary" className="text-xs">
                              {result.secondary_text}
                              {result.distance_meters && (
                                <span className="ml-2 text-blue-500">
                                  ({(result.distance_meters / 1000).toFixed(1)} km away)
                                </span>
                              )}
                            </Text>
                          }
                        />
                      </List.Item>
                    </motion.div>
                  )}
                  className="max-h-60 overflow-y-auto"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected Address Display */}
          {selectedAddress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3"
            >
              <Space align="start">
                <CheckOutlined className="text-green-500 mt-1" />
                <div>
                  <Text strong className="text-green-700 dark:text-green-400">
                    Selected Address:
                  </Text>
                  <div className="mt-1">
                    <Text className="text-sm">
                      {selectedAddress.formatted_address}
                    </Text>
                  </div>
                  {selectedAddress.coordinates && selectedAddress.coordinates.lat !== 0 && (
                    <div className="mt-2">
                      <Text type="secondary" className="text-xs">
                        Coordinates: {EnhancedLocationService.formatCoordinates(
                          selectedAddress.coordinates.lat,
                          selectedAddress.coordinates.lng
                        )}
                      </Text>
                    </div>
                  )}
                </div>
              </Space>
            </motion.div>
          )}

          {/* No Results Message */}
          {showResults && searchResults.length === 0 && searchQuery.length >= 3 && !searching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <Text type="secondary">
                No addresses found for "{searchQuery}"
              </Text>
              {allowManualEntry && (
                <div className="mt-2">
                  <Button 
                    type="link" 
                    size="small"
                    onClick={handleManualEntry}
                  >
                    Use "{searchQuery}" as manual entry
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </Space>
      </Card>
    </div>
  )
}