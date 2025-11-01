/**
 * FILE: src/app/(dashboard)/page.tsx
 * 
 * PAGE: Dashboard Home
 * TYPE: Server Component (async)
 * 
 * WHY SERVER:
 * - Fetches data directly from database via DAL
 * - No client-side interactivity needed
 * - Uses Suspense for progressive loading
 * 
 * DATA SOURCES:
 * - getEventStats(): Overall event statistics
 * - getUpcomingEvents(5): Next 5 upcoming events
 * - getUrgentDeadlines(): Deadlines in next 7 days + overdue
 * 
 * PATTERN:
 * - Main page component wraps content in Suspense
 * - Async DashboardContent fetches data in parallel
 * - All display components are Server Components
 * 
 * FEATURES:
 * - Urgent deadlines alert (top priority)
 * - Stats overview cards (4 key metrics)
 * - Upcoming events list (next 5 events)
 * - Progressive loading with Suspense
 * 
 * USAGE:
 * Automatically rendered at / route within (dashboard) layout
 */

import { Suspense } from 'react';
import { getEventStats, getUpcomingEvents } from '@/lib/dal/events';
import { getUrgentDeadlines, getOverdueDeadlines } from '@/lib/dal/events';
import { UrgentDeadlines } from '@/components/dashboard/home/UrgentDeadlines';
import { StatsOverview } from '@/components/dashboard/home/StatsOverview';
import { UpcomingEvents } from '@/components/dashboard/home/UpcomingEvents';
import { Loader2 } from 'lucide-react';

/**
 * Main Dashboard Page
 * Wraps content in Suspense for streaming
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Panoramica generale degli eventi e attività in corso
        </p>
      </div>

      {/* Content with Suspense */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

/**
 * Dashboard Content Component
 * Async Server Component that fetches all data
 */
async function DashboardContent() {
  // Fetch all data in parallel for better performance
  const [stats, upcomingEvents, urgentDeadlines, overdueDeadlines] = await Promise.all([
    getEventStats(),
    getUpcomingEvents(5),
    getUrgentDeadlines(),
    getOverdueDeadlines(),
  ]);

  // Combine urgent and overdue deadlines
  const allUrgentDeadlines = [...overdueDeadlines, ...urgentDeadlines];

  return (
    <div className="space-y-8">
      {/* Urgent Deadlines - Top Priority */}
      {allUrgentDeadlines.length > 0 && (
        <UrgentDeadlines deadlines={allUrgentDeadlines} />
      )}

      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Upcoming Events */}
      <UpcomingEvents events={upcomingEvents} />
    </div>
  );
}

/**
 * Loading Skeleton
 * Shown while data is being fetched
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Loading indicator */}
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Skeleton list */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-lg animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-3" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}