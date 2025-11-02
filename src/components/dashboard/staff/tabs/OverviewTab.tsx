/**
 * FILE: src/components/dashboard/staff/tabs/OverviewTab.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: OverviewTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Solo presentazione dati ricevuti dal parent
 *
 * PROPS:
 * - staff: StaffDTO - dati profilo
 */

import type { StaffDTO } from '@/lib/dal/staff'

interface OverviewTabProps {
  staff: StaffDTO
}

export function OverviewTab({ staff }: OverviewTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div>
        <div className="text-xs text-gray-500">Email</div>
        <div className="text-sm font-medium text-gray-900">{staff.email}</div>
      </div>
      {staff.phone && (
        <div>
          <div className="text-xs text-gray-500">Telefono</div>
          <div className="text-sm font-medium text-gray-900">{staff.phone}</div>
        </div>
      )}
      {staff.specialization && (
        <div>
          <div className="text-xs text-gray-500">Specializzazione</div>
          <div className="text-sm font-medium text-gray-900">{staff.specialization}</div>
        </div>
      )}
      <div>
        <div className="text-xs text-gray-500">Stato</div>
        <div className="text-sm font-medium text-gray-900">{staff.isActive ? 'Attivo' : 'Inattivo'}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500">Tariffa oraria</div>
        <div className="text-sm font-medium text-gray-900">{staff.hourlyRate ?? '—'}</div>
      </div>
      {staff.tags && staff.tags.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Tag</div>
          <div className="flex flex-wrap gap-2">
            {staff.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
      {staff.notes && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Note</div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap">{staff.notes}</div>
        </div>
      )}
    </div>
  )
}
