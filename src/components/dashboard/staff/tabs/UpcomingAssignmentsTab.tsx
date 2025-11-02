/**
 * FILE: src/components/dashboard/staff/tabs/UpcomingAssignmentsTab.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: UpcomingAssignmentsTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Recupera dati dal DAL lato server (no stato client necessario)
 *
 * PROPS:
 * - staffId: string - ID staff per query
 *
 * FEATURES:
 * - Lista delle assegnazioni future con link all'evento
 */

import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { getUpcomingAssignmentsForStaff } from '@/lib/dal/staff'

interface Props {
  staffId: string
}

export async function UpcomingAssignmentsTab({ staffId }: Props) {
  const assignments = await getUpcomingAssignmentsForStaff(staffId)

  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
        Nessuna assegnazione futura trovata.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg divide-y">
      {assignments.map((a) => (
        <div key={a.id} className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-600" />
              <span>{a.event?.title}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {new Date(a.startTime).toLocaleString()} → {new Date(a.endTime).toLocaleString()}
            </div>
          </div>
          {a.event?.id && (
            <Link href={`/eventi/${a.event.id}/overview`} className="text-sm text-blue-600 hover:text-blue-700">
              Vai all'evento
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
