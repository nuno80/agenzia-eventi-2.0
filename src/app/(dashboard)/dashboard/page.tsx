/**
 * FILE: src/app/(dashboard)/dashboard/page.tsx
 *
 * PAGE: Dashboard Home
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches data from database
 * - Renders overview widgets
 * - No client-side interactivity needed
 *
 * FEATURES:
 * - Statistics overview (events by status)
 * - Urgent deadlines widget
 * - Upcoming events preview
 * - Payments widget
 *
 * USAGE:
 * Automatically rendered at /dashboard route
 */

import { Suspense } from 'react'
import { PaymentsWidget } from '@/components/dashboard/home/PaymentsWidget'
import { StatsOverview } from '@/components/dashboard/home/StatsOverview'
import { UpcomingEvents } from '@/components/dashboard/home/UpcomingEvents'
import { UrgentDeadlines } from '@/components/dashboard/home/UrgentDeadlines'
import { getUrgentDeadlines } from '@/lib/dal/deadlines'
import { getEventStats, getUpcomingEvents } from '@/lib/dal/events'

export const metadata = {
  title: 'Dashboard | EventHub',
  description: 'Panoramica eventi, scadenze e statistiche',
}

/**
 * Loading skeleton for the dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>

      {/* Deadlines skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>

      {/* Events skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard content with data fetching
 */
async function DashboardContent() {
  const [stats, deadlines, events] = await Promise.all([
    getEventStats(),
    getUrgentDeadlines(),
    getUpcomingEvents(),
  ])

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Payments Widget */}
      <PaymentsWidget />

      {/* Two column layout for medium+ screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Deadlines */}
        <UrgentDeadlines deadlines={deadlines} />

        {/* Upcoming Events */}
        <UpcomingEvents events={events} />
      </div>
    </div>
  )
}

/**
 * Main Dashboard Page
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Panoramica eventi, scadenze urgenti e statistiche
        </p>
      </div>

      {/* Content with Suspense */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
