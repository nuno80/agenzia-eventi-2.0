/**
 * FILE: src/components/dashboard/events/tabs/CheckinTab.tsx
 *
 * COMPONENT: CheckinTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches check-in data and statistics
 * - Orchestrates child components
 * - No direct interactivity (delegated to children)
 *
 * PROPS:
 * - eventId: string - Event ID
 *
 * FEATURES:
 * - Check-in statistics overview
 * - QR scanner interface
 * - Recent check-ins list
 * - Pending check-ins table with manual check-in
 *
 * LAYOUT:
 * - Top: Stats cards (3 columns)
 * - Middle: Scanner (left) + Recent list (right)
 * - Bottom: Pending check-ins table
 *
 * USAGE:
 * <CheckinTab eventId={event.id} />
 */

import { Suspense } from 'react'
import { getPendingCheckinParticipants } from '@/lib/dal/participants'
import { CheckInList } from '../checkin/CheckInList'
import { CheckInScanner } from '../checkin/CheckInScanner'
import { CheckInStats } from '../checkin/CheckInStats'
import { PendingCheckInsTable } from '../checkin/PendingCheckInsTable'

interface CheckinTabProps {
  eventId: string
}

export async function CheckinTab({ eventId }: CheckinTabProps) {
  // Fetch pending check-ins
  const pendingParticipants = await getPendingCheckinParticipants(eventId)

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
            ))}
          </div>
        }
      >
        <CheckInStats eventId={eventId} />
      </Suspense>

      {/* Scanner + Recent Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <CheckInScanner />

        {/* Recent Check-ins */}
        <Suspense
          fallback={
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
          }
        >
          <CheckInList eventId={eventId} limit={10} />
        </Suspense>
      </div>

      {/* Pending Check-ins Table */}
      <div>
        <PendingCheckInsTable participants={pendingParticipants} eventId={eventId} />
      </div>
    </div>
  )
}
