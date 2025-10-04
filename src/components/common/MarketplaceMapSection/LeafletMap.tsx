'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L, { type LatLngBoundsExpression, type LatLngExpression } from 'leaflet'

import type { MarketplaceLocation } from '@/hooks/useMarketplaceLocations'

const DEFAULT_CENTER: LatLngExpression = [5.6037, -0.187]
const DEFAULT_ZOOM = 11

const greenMarkerIcon = new L.Icon({
  iconUrl: '/icons/marker-green.svg',
  iconRetinaUrl: '/icons/marker-green.svg',
  iconSize: [40, 52],
  iconAnchor: [20, 52],
  popupAnchor: [2, -46],
  shadowUrl: undefined
})

const buildBounds = (locations: MarketplaceLocation[]): LatLngBoundsExpression | null => {
  if (!locations.length) {
    return null
  }

  const points = locations.map((location) => [location.coordinates.lat, location.coordinates.lng]) as LatLngExpression[]
  return L.latLngBounds(points)
}

const FitMapToLocations = ({ locations }: { locations: MarketplaceLocation[] }) => {
  const map = useMap()
  const bounds = useMemo(() => buildBounds(locations), [locations])

  useEffect(() => {
    if (!bounds) {
      return
    }

    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 })
  }, [bounds, map])

  return null
}

interface LeafletMarketplaceMapProps {
  locations: MarketplaceLocation[]
}

export const LeafletMarketplaceMap = ({ locations }: LeafletMarketplaceMapProps) => {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      scrollWheelZoom
      style={{ minHeight: 360 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitMapToLocations locations={locations} />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={greenMarkerIcon}
        >
          <Popup className="!max-w-xs">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {location.name}
              </h3>
              <p className="text-xs uppercase tracking-wide text-green-600 font-medium">
                {location.type === 'mechanic' ? 'Mechanic' : 'Parts Dealer'}
              </p>
              {location.address && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {location.address}
                </p>
              )}
              {location.phone && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Phone:</span> {location.phone}
                </p>
              )}
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
              >
                Get Directions
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
