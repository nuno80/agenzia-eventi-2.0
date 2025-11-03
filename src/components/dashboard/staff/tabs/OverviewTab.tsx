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

import { PaymentQuickActions, PaymentStatusBadge } from '@/components/dashboard/staff'
import type { StaffDTO } from '@/lib/dal/staff'
import { getUpcomingAssignmentsForStaff } from '@/lib/dal/staff'
import { formatDateTime } from '@/lib/utils'

interface OverviewTabProps {
  staff: StaffDTO
}

export async function OverviewTab({ staff }: OverviewTabProps) {
  const assignments = await getUpcomingAssignmentsForStaff(staff.id)

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
        <div className="text-sm font-medium text-gray-900">
          {staff.isActive ? 'Attivo' : 'Inattivo'}
        </div>
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

      {assignments && assignments.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Prossime assegnazioni</div>
          <div className="space-y-3">
            {assignments.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 border-t pt-3 first:border-t-0 first:pt-0"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {a.event?.title ?? 'Evento'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDateTime(a.startTime)} → {formatDateTime(a.endTime)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentStatusBadge
                    paymentTerms={a.paymentTerms}
                    paymentDueDate={a.paymentDueDate}
                    paymentDate={a.paymentDate}
                    assignmentStatus={a.assignmentStatus}
                    endTime={a.endTime}
                  />
                  <PaymentQuickActions assignmentId={a.id} currentDueDate={a.paymentDueDate} isPaid={a.paymentStatus === 'paid'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
