'use client'

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit,
  getDoc,
  doc
} from 'firebase/firestore'
import { db } from './firebase'
import { EnhancedLocationService } from './enhancedLocation'
import type { 
  GeolocationCoords,
  ProximitySearch,
  ProximityResult,
  LocationBasedRequestMatch,
  EnhancedMechanicAvailability
} from '@/types/location'
import type { UserSettings, User, Request } from '@/types'

export interface MechanicMatchingParams {
  requestLocation: GeolocationCoords
  urgencyLevel: 'low' | 'medium' | 'high'
  serviceType?: string[]
  vehicleBrand?: string
  maxDistance?: number // in km
  maxResults?: number
  priceRange?: {
    min: number
    max: number
  }
  requiredRating?: number
  emergencyService?: boolean
}

export interface MechanicMatchResult {
  mechanic: EnhancedMechanicAvailability
  user: User
  distance: number
  estimatedArrival: number // in minutes
  compatibilityScore: number
  priceEstimate: number
  isAvailable: boolean
  matchFactors: {
    proximityScore: number
    availabilityScore: number
    specializationScore: number
    ratingScore: number
    priceScore: number
    urgencyScore: number
  }
}

export class MechanicMatchingService {
  private static readonly DEFAULT_SEARCH_RADIUS = 50 // km
  private static readonly MAX_RESULTS = 20
  private static readonly COMPATIBILITY_WEIGHTS = {
    proximity: 0.30,
    availability: 0.25,
    specialization: 0.20,
    rating: 0.15,
    price: 0.10
  }

  /**
   * Find the best matching mechanics for a service request
   */
  static async findBestMatches(
    params: MechanicMatchingParams
  ): Promise<MechanicMatchResult[]> {
    // Input validation
    if (!params.requestLocation || !EnhancedLocationService.isValidCoordinates(params.requestLocation.lat, params.requestLocation.lng)) {
      throw new Error('Invalid request location coordinates')
    }

    if (!params.urgencyLevel || !['low', 'medium', 'high'].includes(params.urgencyLevel)) {
      throw new Error('Invalid urgency level')
    }

    try {
      console.log('🔍 Finding mechanics for request:', {
        location: `${params.requestLocation.lat}, ${params.requestLocation.lng}`,
        urgency: params.urgencyLevel,
        maxDistance: params.maxDistance || this.DEFAULT_SEARCH_RADIUS
      })

      // Step 1: Get all available mechanics with location data
      const availableMechanics = await this.getAvailableMechanicsWithLocation()
      
      if (availableMechanics.length === 0) {
        console.log('⚠️ No mechanics with location data found')
        return []
      }

      // Step 2: Filter by distance with validation
      const mechanicsInRange = this.filterByDistance(
        availableMechanics,
        params.requestLocation,
        Math.min(params.maxDistance || this.DEFAULT_SEARCH_RADIUS, 200) // Cap at 200km for performance
      )

      console.log(`📍 Found ${mechanicsInRange.length} mechanics within ${params.maxDistance || this.DEFAULT_SEARCH_RADIUS}km`)

      if (mechanicsInRange.length === 0) {
        console.log('⚠️ No mechanics found within specified radius')
        return []
      }

      // Step 3: Score and rank mechanics
      const scoredMechanics = await this.scoreMechanics(mechanicsInRange, params)

      // Step 4: Sort by compatibility score and return top results
      const validResults = scoredMechanics.filter(result => 
        result.compatibilityScore > 0 && 
        result.isAvailable && 
        result.distance <= (params.maxDistance || this.DEFAULT_SEARCH_RADIUS)
      )

      const sortedResults = validResults
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, Math.min(params.maxResults || this.MAX_RESULTS, 50)) // Cap results

      console.log(`🏆 Returning top ${sortedResults.length} mechanic matches`)
      
      return sortedResults
    } catch (error) {
      console.error('❌ Error finding mechanic matches:', error)
      
      // Return empty array instead of throwing for better UX
      if (error instanceof Error && error.message.includes('Invalid')) {
        throw error // Re-throw validation errors
      }
      
      return []
    }
  }

  /**
   * Get all mechanics with valid location and availability data
   */
  private static async getAvailableMechanicsWithLocation(): Promise<Array<{
    settings: UserSettings,
    user: User
  }>> {
    try {
      // Query user settings for mechanics with location enabled
      const settingsQuery = query(
        collection(db, 'user_settings'),
        where('location_enabled', '==', true),
        where('share_location_with_customers', '==', true),
        where('mechanic_settings', '!=', null)
      )

      const settingsSnapshot = await getDocs(settingsQuery)
      const mechanicsWithLocation: Array<{
        settings: UserSettings,
        user: User
      }> = []

      // Get user data for each mechanic
      for (const settingsDoc of settingsSnapshot.docs) {
        const settings = { id: settingsDoc.id, ...settingsDoc.data() } as UserSettings
        
        // Validate location data
        if (!settings.current_location?.lat || !settings.current_location?.lng) {
          continue
        }

        try {
          // Get user profile
          const userDoc = await getDoc(doc(db, 'users', settings.user_id))
          if (userDoc.exists()) {
            const user = { id: userDoc.id, ...userDoc.data() } as User
            
            // Only include mechanics
            if (user.role === 'Mechanic') {
              mechanicsWithLocation.push({ settings, user })
            }
          }
        } catch (error) {
          console.warn(`Failed to get user data for mechanic ${settings.user_id}:`, error)
        }
      }

      return mechanicsWithLocation
    } catch (error) {
      console.error('Error getting available mechanics:', error)
      return []
    }
  }

  /**
   * Filter mechanics by distance from request location
   */
  private static filterByDistance(
    mechanics: Array<{ settings: UserSettings, user: User }>,
    requestLocation: GeolocationCoords,
    maxDistance: number
  ): Array<{ settings: UserSettings, user: User, distance: number }> {
    return mechanics
      .map(({ settings, user }) => {
        const distance = EnhancedLocationService.calculateDistance(
          requestLocation.lat,
          requestLocation.lng,
          settings.current_location!.lat,
          settings.current_location!.lng
        )

        return { settings, user, distance }
      })
      .filter(item => item.distance <= maxDistance)
  }

  /**
   * Score mechanics based on various factors
   */
  private static async scoreMechanics(
    mechanicsInRange: Array<{ settings: UserSettings, user: User, distance: number }>,
    params: MechanicMatchingParams
  ): Promise<MechanicMatchResult[]> {
    const results: MechanicMatchResult[] = []

    for (const { settings, user, distance } of mechanicsInRange) {
      try {
        const score = this.calculateCompatibilityScore(settings, user, distance, params)
        const estimatedArrival = this.calculateEstimatedArrival(distance, params.urgencyLevel)
        const priceEstimate = this.calculatePriceEstimate(settings, params)

        const enhancedMechanic: EnhancedMechanicAvailability = {
          id: settings.id,
          mechanic_id: settings.user_id,
          is_available: this.checkCurrentAvailability(settings),
          max_concurrent_jobs: settings.mechanic_settings?.max_concurrent_requests || 3,
          current_active_jobs: 0, // Would need to query active requests
          current_location: settings.current_location,
          service_areas: [], // Would be populated from settings
          base_location: {
            formatted_address: settings.current_location?.address || 'Unknown Address',
            city: 'Unknown City',
            country: 'Unknown Country',
            coordinates: settings.current_location!
          },
          travel_mode: 'driving',
          max_travel_distance: settings.mechanic_settings?.service_radius || 25,
          estimated_response_time: estimatedArrival,
          specializations: user.mechanic_specializations?.service_types || [],
          hourly_rate: settings.mechanic_settings?.minimum_job_value || 50,
          emergency_service: user.mechanic_specializations?.emergency_services || settings.mechanic_settings?.emergency_services || false,
          working_hours: {
            start: '08:00',
            end: '18:00',
            days: [1, 2, 3, 4, 5, 6],
            timezone: 'GMT'
          },
          last_location_update: settings.updated_at,
          is_moving: false,
          distance_from_request: distance,
          estimated_arrival: estimatedArrival,
          created_at: settings.created_at,
          updated_at: settings.updated_at
        }

        const result: MechanicMatchResult = {
          mechanic: enhancedMechanic,
          user,
          distance,
          estimatedArrival,
          compatibilityScore: score.total,
          priceEstimate,
          isAvailable: enhancedMechanic.is_available,
          matchFactors: score.factors
        }

        results.push(result)
      } catch (error) {
        console.warn(`Error scoring mechanic ${user.id}:`, error)
      }
    }

    return results
  }

  /**
   * Calculate compatibility score based on multiple factors
   */
  private static calculateCompatibilityScore(
    settings: UserSettings,
    user: User,
    distance: number,
    params: MechanicMatchingParams
  ): { total: number, factors: MechanicMatchResult['matchFactors'] } {
    // Proximity Score (closer is better)
    const proximityScore = Math.max(0, 100 - (distance / (params.maxDistance || 50)) * 100)

    // Availability Score
    const availabilityScore = this.checkCurrentAvailability(settings) ? 100 : 0

    // Specialization Score - now using new mechanic_specializations structure
    const specializationScore = this.calculateSpecializationScore(
      user.mechanic_specializations,
      params.serviceType || [],
      params.vehicleBrand
    )

    // Rating Score
    const ratingScore = ((user.rating || 4.0) / 5.0) * 100

    // Price Score (lower price is better, but within reason)
    const mechanicRate = settings.mechanic_settings?.minimum_job_value || 50
    const priceScore = this.calculatePriceScore(mechanicRate, params.priceRange)

    // Urgency Score (emergency mechanics get bonus for urgent requests)
    const urgencyScore = this.calculateUrgencyScore(
      user.mechanic_specializations?.emergency_services || settings.mechanic_settings?.emergency_services || false,
      params.urgencyLevel
    )

    const factors = {
      proximityScore,
      availabilityScore,
      specializationScore,
      ratingScore,
      priceScore,
      urgencyScore
    }

    // Calculate weighted total
    const total = (
      proximityScore * this.COMPATIBILITY_WEIGHTS.proximity +
      availabilityScore * this.COMPATIBILITY_WEIGHTS.availability +
      specializationScore * this.COMPATIBILITY_WEIGHTS.specialization +
      ratingScore * this.COMPATIBILITY_WEIGHTS.rating +
      priceScore * this.COMPATIBILITY_WEIGHTS.price
    ) + (urgencyScore * 0.1) // Bonus for emergency service

    return { total: Math.min(100, total), factors }
  }

  /**
   * Check if mechanic is currently available
   */
  private static checkCurrentAvailability(settings: UserSettings): boolean {
    if (!settings.mechanic_settings) return false

    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()

    // Check working hours if enabled
    if (settings.mechanic_settings.working_hours?.enabled) {
      const schedule = settings.mechanic_settings.working_hours.schedule
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
      const todaySchedule = schedule[dayNames[currentDay]]

      if (!todaySchedule?.enabled) return false

      const startHour = parseInt(todaySchedule.start.split(':')[0])
      const endHour = parseInt(todaySchedule.end.split(':')[0])

      if (currentHour < startHour || currentHour >= endHour) return false
    }

    // Check if location is recent (within last hour)
    if (settings.current_location?.last_updated) {
      const lastUpdate = new Date(settings.current_location.last_updated)
      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
      if (hoursSinceUpdate > 1) return false
    }

    return true
  }

  /**
   * Calculate specialization match score with vehicle brand consideration
   */
  private static calculateSpecializationScore(
    mechanicSpecs: any,
    requestedSpecs: string[],
    vehicleBrand?: string
  ): number {
    if (!mechanicSpecs) return 50 // Neutral score for mechanics without specializations

    let totalScore = 0
    let weightedFactors = 0

    // Service type matching (70% weight)
    if (requestedSpecs.length > 0 && mechanicSpecs.service_types?.length > 0) {
      const serviceMatches = requestedSpecs.filter(spec => 
        mechanicSpecs.service_types.some((mechanicSpec: string) => 
          mechanicSpec.toLowerCase().includes(spec.toLowerCase()) ||
          spec.toLowerCase().includes(mechanicSpec.toLowerCase())
        )
      )
      const serviceScore = (serviceMatches.length / requestedSpecs.length) * 100
      totalScore += serviceScore * 0.7
      weightedFactors += 0.7
    }

    // Vehicle brand matching (30% weight)
    if (vehicleBrand && mechanicSpecs.vehicle_brands?.length > 0) {
      const brandMatch = mechanicSpecs.vehicle_brands.some((brand: string) => 
        brand.toLowerCase() === vehicleBrand.toLowerCase() ||
        brand.toLowerCase() === 'other'
      )
      const brandScore = brandMatch ? 100 : 0
      totalScore += brandScore * 0.3
      weightedFactors += 0.3
    }

    // If no specific requirements, give higher score
    if (requestedSpecs.length === 0 && !vehicleBrand) {
      return 100
    }

    // Return weighted average, or neutral score if no factors matched
    return weightedFactors > 0 ? totalScore / weightedFactors : 50
  }

  /**
   * Calculate price score (prefer reasonable pricing)
   */
  private static calculatePriceScore(
    mechanicRate: number,
    priceRange?: { min: number, max: number }
  ): number {
    if (!priceRange) {
      // Default scoring: prefer rates between 50-150
      if (mechanicRate >= 50 && mechanicRate <= 150) return 100
      if (mechanicRate < 50) return 80 // Too cheap might indicate quality issues
      return Math.max(0, 100 - ((mechanicRate - 150) / 10)) // Penalty for high rates
    }

    if (mechanicRate >= priceRange.min && mechanicRate <= priceRange.max) {
      return 100
    }

    if (mechanicRate < priceRange.min) {
      return 90 // Slightly penalize rates below range
    }

    // Penalize rates above range
    const overagePercent = ((mechanicRate - priceRange.max) / priceRange.max) * 100
    return Math.max(0, 100 - overagePercent)
  }

  /**
   * Calculate urgency-based score bonus
   */
  private static calculateUrgencyScore(
    providesEmergencyService: boolean,
    urgencyLevel: 'low' | 'medium' | 'high'
  ): number {
    if (urgencyLevel === 'high' && providesEmergencyService) {
      return 20 // Bonus points for emergency service capability
    }
    if (urgencyLevel === 'medium' && providesEmergencyService) {
      return 10 // Smaller bonus for medium urgency
    }
    return 0
  }

  /**
   * Calculate estimated arrival time
   */
  private static calculateEstimatedArrival(
    distance: number,
    urgencyLevel: 'low' | 'medium' | 'high'
  ): number {
    // Base speed assumptions (km/h)
    const speeds = {
      low: 40,    // Normal traffic, no rush
      medium: 50, // Moderate urgency
      high: 60    // Emergency, faster travel
    }

    const speed = speeds[urgencyLevel]
    const travelTimeHours = distance / speed
    const travelTimeMinutes = travelTimeHours * 60

    // Add preparation time
    const prepTime = urgencyLevel === 'high' ? 5 : 15
    
    return Math.round(travelTimeMinutes + prepTime)
  }

  /**
   * Calculate price estimate for the service
   */
  private static calculatePriceEstimate(
    settings: UserSettings,
    params: MechanicMatchingParams
  ): number {
    const baseRate = settings.mechanic_settings?.minimum_job_value || 50
    
    // Add urgency multiplier
    const urgencyMultipliers = {
      low: 1.0,
      medium: 1.2,
      high: 1.5
    }

    const estimate = baseRate * urgencyMultipliers[params.urgencyLevel]
    
    // Round to nearest 5
    return Math.round(estimate / 5) * 5
  }

  /**
   * Create location-based request notifications for nearby mechanics
   */
  static async notifyNearbyMechanics(
    request: Request,
    requestLocation: GeolocationCoords,
    maxDistance: number = 25
  ): Promise<string[]> {
    try {
      const matches = await this.findBestMatches({
        requestLocation,
        urgencyLevel: request.urgency || 'medium',
        maxDistance,
        maxResults: 10
      })

      const notifiedMechanics: string[] = []

      // Send notifications to top matches
      for (const match of matches.slice(0, 5)) {
        try {
          // Here you would integrate with your notification service
          // await NotificationService.sendMechanicNotification(match.user.id, request)
          notifiedMechanics.push(match.user.id)
          
          console.log(`📧 Would notify mechanic ${match.user.name} (${match.distance.toFixed(1)}km away, score: ${match.compatibilityScore.toFixed(1)})`)
        } catch (error) {
          console.error(`Failed to notify mechanic ${match.user.id}:`, error)
        }
      }

      return notifiedMechanics
    } catch (error) {
      console.error('Error notifying nearby mechanics:', error)
      return []
    }
  }

  /**
   * Get real-time mechanic updates for active requests
   */
  static async getRealtimeMechanicUpdates(
    requestId: string,
    mechanicIds: string[]
  ): Promise<MechanicMatchResult[]> {
    // This would implement real-time tracking of mechanic locations
    // and availability for active requests
    try {
      // Placeholder implementation
      console.log(`Getting real-time updates for request ${requestId}`)
      return []
    } catch (error) {
      console.error('Error getting real-time mechanic updates:', error)
      return []
    }
  }
}