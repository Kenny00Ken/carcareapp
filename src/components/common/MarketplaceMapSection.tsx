'use client'

import dynamic from 'next/dynamic'
import { EnvironmentOutlined } from '@ant-design/icons'
import { Typography } from 'antd'

import type { MarketplaceLocation } from '@/hooks/useMarketplaceLocations'

const { Title, Paragraph, Text } = Typography

const DynamicLeafletMap = dynamic(
  () => import('./MarketplaceMapSection/LeafletMap').then((mod) => mod.LeafletMarketplaceMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading interactive map…</span>
      </div>
    )
  }
)

interface MarketplaceMapSectionProps {
  locations: MarketplaceLocation[]
  loading: boolean
  error: string | null
}

export const MarketplaceMapSection = ({ locations, loading, error }: MarketplaceMapSectionProps) => {
  const hasLocations = locations.length > 0

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-gray-50 py-16 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-green-50/60 via-transparent to-transparent dark:from-green-900/20" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Title level={2} className="!mb-2 !text-2xl font-bold text-gray-900 dark:!text-white sm:!text-3xl">
              Explore Nearby Automotive Experts
            </Title>
            <Paragraph className="!mb-0 max-w-2xl text-base text-gray-600 dark:!text-slate-300">
              Discover trusted mechanics and verified parts dealers around you. Zoom, pan, and tap on the green markers to view more details and launch turn-by-turn navigation.
            </Paragraph>
          </div>
          <div className="rounded-full border border-green-500/30 bg-green-50/70 px-4 py-2 text-sm font-medium text-green-700 shadow-sm backdrop-blur-sm dark:border-green-400/30 dark:bg-green-900/30 dark:text-green-200">
            <EnvironmentOutlined className="mr-2 text-base" /> Live coverage grows daily
          </div>
        </div>
      </div>

      <div className="relative mt-10">
        <div className="absolute inset-x-0 top-6 mx-auto h-[480px] max-w-7xl rounded-3xl bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 blur-3xl dark:from-green-500/10 dark:to-green-400/10" />
        <div className="relative left-1/2 h-[420px] w-screen -translate-x-1/2 overflow-hidden border-y border-gray-200/60 bg-white/90 shadow-inner backdrop-blur sm:h-[460px] md:h-[520px] dark:border-white/10 dark:bg-slate-950/80">
          <div className="absolute inset-0">
            {error ? (
              <div className="flex h-full w-full flex-col items-center justify-center space-y-3 bg-gradient-to-br from-white via-gray-100 to-gray-200 text-center dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                <Title level={4} className="!mb-0 text-base font-semibold text-red-600 dark:!text-red-400">
                  We could not load the map right now
                </Title>
                <Text className="text-sm text-gray-600 dark:text-slate-300">
                  {error}
                </Text>
              </div>
            ) : loading ? (
              <div className="flex h-full w-full flex-col items-center justify-center space-y-4 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
                <span className="h-12 w-12 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500" aria-hidden="true" />
                <Text className="text-sm font-medium text-gray-600 dark:text-slate-300">Loading trusted locations…</Text>
              </div>
            ) : (
              <DynamicLeafletMap locations={locations} />
            )}
          </div>

          {!loading && !error && !hasLocations && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-white/85 text-center backdrop-blur dark:bg-slate-950/85">
              <Title level={4} className="!mb-0 text-base font-semibold text-gray-900 dark:!text-white">
                Locations coming soon
              </Title>
              <Paragraph className="!mb-0 max-w-sm text-sm text-gray-600 dark:!text-slate-300">
                We are onboarding more mechanics and parts dealers. Check back shortly for live availability in your area.
              </Paragraph>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
