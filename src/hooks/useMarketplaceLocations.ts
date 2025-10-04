'use client'

import { useEffect, useMemo, useState } from 'react'
import { FirebaseError } from 'firebase/app'

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

const fallbackSeed: Array<Omit<MarketplaceLocation, 'mapsUrl'>> = [
  {
    id: 'fallback-mechanic-accra',
    type: 'mechanic',
    name: 'Accra Prime Auto Experts',
    coordinates: { lat: 5.6037, lng: -0.187 },
    address: 'Liberia Road, Accra',
    phone: '+233 20 123 4567'
  },
  {
    id: 'fallback-dealer-kumasi',
    type: 'dealer',
    name: 'Kumasi Parts Hub',
    coordinates: { lat: 6.6885, lng: -1.6244 },
    address: 'Harper Road, Kumasi',
    phone: '+233 54 987 6543'
  },
  {
    id: 'fallback-mechanic-takoradi',
    type: 'mechanic',
    name: 'Takoradi Rapid Mechanics',
    coordinates: { lat: 4.9043, lng: -1.7594 },
    address: 'Beach Road, Sekondi-Takoradi',
    phone: '+233 24 222 3344'
  },
  {
    id: 'fallback-dealer-tamale',
    type: 'dealer',
    name: 'Tamale Genuine Parts',
    coordinates: { lat: 9.4008, lng: -0.8393 },
    address: 'Yendi Road, Tamale',
    phone: '+233 55 665 7788'
  },
  {
    id: 'fallback-mechanic-cape-coast',
    type: 'mechanic',
    name: 'Cape Coast Service Bay',
    coordinates: { lat: 5.1053, lng: -1.2466 },
    address: 'Commercial Street, Cape Coast',
    phone: '+233 26 333 8899'
  },
  {
    id: 'fallback-dealer-ho',
    type: 'dealer',
    name: 'Ho Reliable Parts Depot',
    coordinates: { lat: 6.6008, lng: 0.4703 },
    address: 'Market Circle, Ho',
    phone: '+233 27 555 1122'
  }
]

const buildGoogleMapsUrl = (coords: Coordinates, label?: string) => {
  const destination = `${coords.lat},${coords.lng}`
  const query = label ? `${label} (${destination})` : destination
  const encoded = encodeURIComponent(query)
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
}

const FALLBACK_LOCATIONS: MarketplaceLocation[] = fallbackSeed.map((entry) => ({
  ...entry,
  mapsUrl: buildGoogleMapsUrl(entry.coordinates, entry.name)
}))

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

const resolveLocationsOrFallback = (candidates: MarketplaceLocation[]): MarketplaceLocation[] => {
  if (candidates.length > 0) {
    return candidates
  }
  return FALLBACK_LOCATIONS
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

        setLocations(resolveLocationsOrFallback(mapped))
      } catch (err) {
        console.error('Failed to load marketplace locations', err)
        if (!isMounted) {
          return
        }

        if (err instanceof FirebaseError && err.code === 'permission-denied') {
          setLocations(FALLBACK_LOCATIONS)
          setError(null)
        } else {
          const message = err instanceof Error ? err.message : 'Unable to load locations right now.'
          setError(message)
          setLocations(FALLBACK_LOCATIONS)
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
