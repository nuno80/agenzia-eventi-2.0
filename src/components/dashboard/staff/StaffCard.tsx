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

import { Mail, Phone, Tag } from 'lucide-react'
import Link from 'next/link'
import { StaffAssignmentModal } from '@/components/dashboard/staff/StaffAssignmentModal'
import type { StaffDTO } from '@/lib/dal/staff'
import { cn, toRoleLabel } from '@/lib/utils'

interface StaffCardProps {
  staff: StaffDTO
  events: { id: string; title: string; startDate?: Date | string; endDate?: Date | string }[]
}

export function StaffCard({ staff, events }: StaffCardProps) {
  const fullName = `${staff.lastName} ${staff.firstName}`

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <Link
              href={`/persone/staff/${staff.id}/overview`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {fullName}
            </Link>
            {!staff.isActive && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-700">
                Inattivo
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 capitalize">{toRoleLabel(staff.role)}</div>
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
        <StaffAssignmentModal
          staff={{
            id: staff.id,
            firstName: staff.firstName,
            lastName: staff.lastName,
            role: staff.role,
          }}
          events={events}
          triggerVariant="link"
        />
      </div>
    </div>
  )
}
