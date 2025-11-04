import { StaffAssignmentModalMulti } from '@/components/dashboard/events/StaffAssignmentModalMulti'
import { StaffTabFilters } from '@/components/dashboard/events/tabs/StaffTabFilters'
import { PaymentQuickActions, PaymentStatusBadge } from '@/components/dashboard/staff'
import { getAllStaff } from '@/lib/dal/staff'
import { getAssignmentsByEvent } from '@/lib/dal/staff-assignments'
import { formatDateTime, toRoleLabel } from '@/lib/utils'

interface StaffTabProps {
  eventId: string
  searchParams?: Record<string, string>
}

export async function StaffTab({ eventId, searchParams }: StaffTabProps) {
  const [assignments, staff] = await Promise.all([getAssignmentsByEvent(eventId), getAllStaff()])

  // Apply filters from search params
  const role = searchParams?.role ?? ''
  const astatus = searchParams?.astatus ?? ''
  const pstatus = searchParams?.pstatus ?? ''

  const filtered = assignments.filter((a) => {
    const byRole = role ? a.staff?.role === role : true
    const byAStatus = astatus ? a.assignmentStatus === astatus : true
    const byPStatus = pstatus ? a.paymentStatus === pstatus : true
    return byRole && byAStatus && byPStatus
  })

  const roles = Array.from(new Set(staff.map((s) => s.role))) as string[]

  const isEmpty = !filtered || filtered.length === 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <StaffTabFilters roles={roles} />
        <h3 className="text-lg font-semibold text-gray-900">Assegnazioni Staff</h3>
        {/* Inline multi-assignment modal trigger */}
        <StaffAssignmentModalMulti
          eventId={eventId}
          staff={staff.map((s) => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            role: s.role,
          }))}
        />
      </div>

      {isEmpty ? (
        <div className="text-center text-sm text-gray-600">
          Nessuna assegnazione staff per questo evento.
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((a) => (
            <div key={a.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {a.staff ? `${a.staff.lastName} ${a.staff.firstName}` : 'Membro dello staff'}
                  {a.staff?.role ? (
                    <span className="ml-2 text-xs text-gray-500">
                      ({toRoleLabel(a.staff.role)})
                    </span>
                  ) : null}
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
                <PaymentQuickActions
                  assignmentId={a.id}
                  currentDueDate={a.paymentDueDate}
                  isPaid={a.paymentStatus === 'paid'}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
