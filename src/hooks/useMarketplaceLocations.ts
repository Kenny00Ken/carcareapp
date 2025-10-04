'use client'

import { useEffect, useMemo, useState } from 'react'
import { DatabaseService } from '@/services/database'
import type { User } from '@/types'

type MarketplaceEntityType = 'mechanic' | 'dealer'

type Coordinates = {
  lat: number
  lng: number
}

export interface MarketplaceLocation {
  id: string
  type: MarketplaceEntityType
  name: string
  coordinates: Coordinates
  address?: string
  phone?: string
  mapsUrl: string
}

interface UseMarketplaceLocationsResult {
  locations: MarketplaceLocation[]
  loading: boolean
  error: string | null
}

const buildGoogleMapsUrl = (coords: Coordinates, label?: string) => {
  const destination = `${coords.lat},${coords.lng}`
  const query = label ? `${label} (${destination})` : destination
  const encoded = encodeURIComponent(query)
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
}

const mapUserToLocation = (user: User): MarketplaceLocation | null => {
  const coords = user.location_data?.coordinates
  if (!coords) {
    return null
  }

  const type: MarketplaceEntityType = user.role === 'Dealer' ? 'dealer' : 'mechanic'
  const label = user.name || `${user.role} location`

  return {
    id: user.id,
    type,
    name: label,
    coordinates: coords,
    address: user.address || user.location_data?.address_components?.[0]?.long_name,
    phone: user.phone,
    mapsUrl: buildGoogleMapsUrl(coords, label)
  }
}

export const useMarketplaceLocations = (): UseMarketplaceLocationsResult => {
  const [locations, setLocations] = useState<MarketplaceLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadLocations = async () => {
      setLoading(true)
      setError(null)

      try {
        const [mechanics, dealers] = await Promise.all([
          DatabaseService.getUsersByRole('Mechanic'),
          DatabaseService.getUsersByRole('Dealer')
        ])

        if (!isMounted) {
          return
        }

        const mapped = [...mechanics, ...dealers]
          .map(mapUserToLocation)
          .filter((location): location is MarketplaceLocation => Boolean(location))

        setLocations(mapped)
      } catch (err) {
        console.error('Failed to load marketplace locations', err)
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unable to load locations right now.'
          setError(message)
          setLocations([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadLocations()

    return () => {
      isMounted = false
    }
  }, [])

  const stableLocations = useMemo(() => locations, [locations])

  return {
    locations: stableLocations,
    loading,
    error
  }
}
