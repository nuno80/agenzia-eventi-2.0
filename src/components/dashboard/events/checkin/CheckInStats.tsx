/**
 * FILE: src/components/dashboard/events/checkin/CheckInStats.tsx
 *
 * COMPONENT: CheckInStats
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches statistics from database
 * - Display-only cards
 * - No interactivity
 *
 * PROPS:
 * - eventId: string - Event ID
 *
 * FEATURES:
 * - Total checked-in count
 * - Check-in rate percentage
 * - Pending check-ins count
 *
 * USAGE:
 * <CheckInStats eventId={event.id} />
 */

import { CheckCircle, Clock, Users } from 'lucide-react'
import { getParticipantStats } from '@/lib/dal/participants'

interface CheckInStatsProps {
  eventId: string
}

export async function CheckInStats({ eventId }: CheckInStatsProps) {
  const stats = await getParticipantStats(eventId)

  const checkInRate =
    stats.confirmed > 0 ? Math.round((stats.checkedIn / stats.confirmed) * 100) : 0
  const pendingCheckIns = stats.confirmed - stats.checkedIn

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Checked In */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.checkedIn}</div>
            <div className="text-sm text-gray-600">Checked In</div>
          </div>
        </div>
      </div>

      {/* Check-in Rate */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{checkInRate}%</div>
            <div className="text-sm text-gray-600">Check-in Rate</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          {stats.checkedIn} of {stats.confirmed} confirmed
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{pendingCheckIns}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>
    </div>
  )
}
