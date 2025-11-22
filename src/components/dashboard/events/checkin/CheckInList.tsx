/**
 * FILE: src/components/dashboard/events/checkin/CheckInList.tsx
 *
 * COMPONENT: CheckInList
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches check-in data from database
 * - Display-only list
 * - No client-side state needed
 *
 * PROPS:
 * - eventId: string - Event ID
 * - limit?: number - Number of recent check-ins to show
 *
 * FEATURES:
 * - Recent check-ins list
 * - Timestamp display
 * - Participant info
 *
 * USAGE:
 * <CheckInList eventId={event.id} limit={10} />
 */

import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { UserCheck } from 'lucide-react'
import { getRecentCheckins } from '@/lib/dal/participants'

interface CheckInListProps {
  eventId: string
  limit?: number
}

export async function CheckInList({ eventId, limit = 10 }: CheckInListProps) {
  const recentCheckins = await getRecentCheckins(eventId, limit)

  if (recentCheckins.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Check-ins</h3>
        <div className="text-center py-8 text-gray-500">
          <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">No check-ins yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Check-ins ({recentCheckins.length})
      </h3>

      <div className="space-y-3">
        {recentCheckins.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {participant.firstName} {participant.lastName}
                </div>
                {participant.company && (
                  <div className="text-sm text-gray-500">{participant.company}</div>
                )}
              </div>
            </div>

            <div className="text-right">
              {participant.checkinTime && (
                <div className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(participant.checkinTime), {
                    addSuffix: true,
                    locale: it,
                  })}
                </div>
              )}
              {participant.ticketType && (
                <div className="text-xs text-gray-500 mt-1">{participant.ticketType}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
