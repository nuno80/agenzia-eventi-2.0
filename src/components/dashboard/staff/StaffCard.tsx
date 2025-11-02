/**
 * FILE: src/components/dashboard/staff/StaffCard.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: StaffCard
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Presentational only: nessuno stato/effetto client
 * - Riceve dati dal server e rende markup
 *
 * PROPS:
 * - staff: StaffDTO - Dati membro staff da visualizzare
 *
 * FEATURES:
 * - Nome completo, ruolo, stato
 * - Contatti (email/telefono)
 * - Tag principali
 * - Placeholder azione rapida (assegnazione a evento)
 *
 * USAGE:
 * <StaffCard staff={member} />
 */

import { CalendarClock, Mail, Phone, Tag } from 'lucide-react'
import Link from 'next/link'
import type { StaffDTO } from '@/lib/dal/staff'
import { cn } from '@/lib/utils'

interface StaffCardProps {
  staff: StaffDTO
}

export function StaffCard({ staff }: StaffCardProps) {
  const fullName = `${staff.lastName} ${staff.firstName}`

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Link href={`/persone/staff/${staff.id}/overview`} className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {fullName}
            </Link>
            {!staff.isActive && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-700">
                Inattivo
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 capitalize">{staff.role.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Email</div>
            <div className="text-sm font-medium text-gray-900 truncate">{staff.email}</div>
          </div>
        </div>

        {staff.phone && (
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-0.5">Telefono</div>
              <div className="text-sm font-medium text-gray-900 truncate">{staff.phone}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {staff.tags && staff.tags.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span>Tag</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {staff.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions placeholder */}
      <div className={cn('flex items-center justify-between pt-2 border-t border-gray-100')}>
        <div className="text-xs text-gray-500">Tariffa oraria: {staff.hourlyRate ?? '—'}</div>
        <Link
          href="#"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <CalendarClock className="w-4 h-4" />
          <span>Assegna a evento</span>
        </Link>
      </div>
    </div>
  )
}
