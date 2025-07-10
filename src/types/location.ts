// Enhanced Location Types for Professional GPS/Mapping System

export interface LocationPermissionStatus {
  granted: boolean
  denied: boolean
  prompt: boolean
  unavailable: boolean
}

export interface GeolocationCoords {
  lat: number
  lng: number
  accuracy?: number
  altitude?: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
}

export interface Address {
  id?: string
  street_number?: string
  street_name?: string
  neighborhood?: string
  city: string
  state?: string
  country: string
  postal_code?: string
  formatted_address: string
  place_id?: string // For Google Places API
  coordinates: GeolocationCoords
  address_components?: AddressComponent[]
}

export interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface LocationSearchResult {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
  coordinates?: GeolocationCoords
  types: string[]
  distance_meters?: number
}

export interface MapBounds {
  northeast: GeolocationCoords
  southwest: GeolocationCoords
}

export interface MapConfig {
  center: GeolocationCoords
  zoom: number
  bounds?: MapBounds
  markers?: MapMarker[]
  showUserLocation?: boolean
  enableLocationTracking?: boolean
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  gestureHandling?: 'auto' | 'cooperative' | 'greedy' | 'none'
}

export interface MapMarker {
  id: string
  position: GeolocationCoords
  title?: string
  description?: string
  icon?: string | MarkerIcon
  draggable?: boolean
  visible?: boolean
  zIndex?: number
  type?: 'user' | 'mechanic' | 'request' | 'service_area' | 'custom'
}

export interface MarkerIcon {
  url: string
  scaledSize?: { width: number; height: number }
  anchor?: { x: number; y: number }
}

export interface LocationServiceConfig {
  enableHighAccuracy: boolean
  timeout: number
  maximumAge: number
  retryAttempts: number
  retryDelay: number
}

export interface GeofenceRegion {
  id: string
  center: GeolocationCoords
  radius: number // in meters
  name: string
  description?: string
  enabled: boolean
  type: 'service_area' | 'restriction' | 'notification'
}

export interface RouteInfo {
  distance: number // in meters
  duration: number // in seconds
  polyline: string // encoded polyline for route display
  steps?: RouteStep[]
  bounds: MapBounds
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  start_location: GeolocationCoords
  end_location: GeolocationCoords
}

export interface LocationHistory {
  id: string
  user_id: string
  location: GeolocationCoords
  address?: Address
  timestamp: string
  accuracy?: number
  activity_type?: 'request' | 'service' | 'travel' | 'idle'
}

export interface ProximitySearch {
  center: GeolocationCoords
  radius: number // in kilometers
  types?: string[]
  excludeTypes?: string[]
  minRating?: number
  openNow?: boolean
  priceLevel?: number[]
}

export interface ProximityResult {
  mechanic: {
    id: string
    name: string
    rating: number
    distance: number
    estimated_arrival: number // in minutes
    location: GeolocationCoords
    specializations: string[]
    hourly_rate: number
    is_available: boolean
  }
  service_area: GeofenceRegion
  route?: RouteInfo
}

// For integration with map providers
export interface MapProvider {
  name: 'google' | 'mapbox' | 'leaflet'
  apiKey?: string
  config?: Record<string, any>
}

// Enhanced mechanic availability with location intelligence
export interface EnhancedMechanicAvailability {
  id: string
  mechanic_id: string
  is_available: boolean
  max_concurrent_jobs: number
  current_active_jobs: number
  
  // Enhanced location data
  current_location?: GeolocationCoords
  service_areas: GeofenceRegion[]
  base_location: Address
  
  // Travel and routing
  travel_mode: 'driving' | 'walking' | 'bicycling'
  max_travel_distance: number // in km
  estimated_response_time: number // in minutes
  
  // Specializations and preferences
  specializations: string[]
  hourly_rate: number
  emergency_service: boolean
  
  // Working schedule
  working_hours: {
    start: string
    end: string
    days: number[]
    timezone: string
  }
  
  // Real-time data
  last_location_update: string
  location_accuracy?: number
  is_moving: boolean
  heading?: number
  
  // Calculated fields
  distance_from_request?: number
  estimated_arrival?: number
  route_to_request?: RouteInfo
  
  created_at: string
  updated_at: string
}

// Location-aware request matching
export interface LocationBasedRequestMatch {
  request_id: string
  mechanic_id: string
  distance: number
  estimated_travel_time: number
  compatibility_score: number // 0-100
  factors: {
    proximity_score: number
    availability_score: number
    specialization_score: number
    rating_score: number
    price_score: number
  }
  route?: RouteInfo
  estimated_completion: string
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NETWORK_ERROR' | 'INVALID_COORDINATES' | 'SERVICE_UNAVAILABLE'
  message: string
  details?: any
}

// For real-time location tracking
export interface LocationTrackingSession {
  id: string
  user_id: string
  request_id?: string
  started_at: string
  ended_at?: string
  status: 'active' | 'paused' | 'completed' | 'error'
  locations: LocationHistory[]
  total_distance?: number
  total_duration?: number
  watchId?: number // For cleanup
}