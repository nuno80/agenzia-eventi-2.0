/**
 * FILE: src/app/(dashboard)/eventi/page.tsx
 *
 * PAGE: Events List
 * TYPE: Server Component (main) + Client Component (with filters)
 *
 * WHY MIXED:
 * - Server Component fetches initial data from database
 * - Client Component handles filtering/sorting (in-memory)
 * - Better UX: instant filter response without server round-trips
 *
 * DATA SOURCES:
 * - getAllEvents(): Fetches all events from database
 *
 * PATTERN:
 * - Server Component fetches data
 * - Passes data to Client Component wrapper
 * - Client Component handles all filtering logic
 *
 * FEATURES:
 * - List all events with filters
 * - Search, sort, filter by status/priority
 * - Responsive grid (1/2/3 columns)
 * - Create new event button
 * - Empty state
 *
 * USAGE:
 * Automatically rendered at /eventi route
 */

import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { PaymentsWidget } from '@/components/dashboard/home/PaymentsWidget'
import { getAllEvents } from '@/lib/dal/events'
import { EventsListClient } from './eventi/EventsListClient'

/**
 * Main Events Page (Server Component)
 * Fetches data and passes to client component
 */
export default function EventsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventi</h1>
          <p className="text-sm text-gray-600 mt-1">Gestisci tutti i tuoi eventi</p>
        </div>
      </div>

      {/* Payments widget */}
      <Suspense
        fallback={
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            Caricamento pagamenti…
          </div>
        }
      >
        <PaymentsWidget />
      </Suspense>

      {/* Content with Suspense */}
      <Suspense fallback={<EventsPageSkeleton />}>
        <EventsContent />
      </Suspense>
    </div>
  )
}

/**
 * Events Content (Server Component - async)
 * Fetches events and passes to client component
 */
async function EventsContent() {
  const events = await getAllEvents()

  return <EventsListClient events={events} />
}

/**
 * Loading Skeleton
 */
function EventsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Caricamento eventi...</p>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
