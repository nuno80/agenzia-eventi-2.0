import { StaffAssignmentModalMulti } from '@/components/dashboard/events/StaffAssignmentModalMulti'
import { StaffAssignmentsClient } from '@/components/dashboard/events/tabs/StaffAssignmentsClient'
import { StaffTabFilters } from '@/components/dashboard/events/tabs/StaffTabFilters'
import { getAllStaff } from '@/lib/dal/staff'
import { getAssignmentsByEvent } from '@/lib/dal/staff-assignments'

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
        <StaffAssignmentsClient
          items={filtered.map((a) => ({
            id: a.id,
            startTime: a.startTime,
            endTime: a.endTime,
            assignmentStatus: a.assignmentStatus as string,
            paymentStatus: a.paymentStatus as any,
            paymentTerms: a.paymentTerms as any,
            paymentDueDate: a.paymentDueDate,
            paymentDate: a.paymentDate,
            staff: a.staff
              ? {
                  id: a.staff.id,
                  firstName: a.staff.firstName,
                  lastName: a.staff.lastName,
                  role: a.staff.role,
                }
              : null,
          }))}
        />
      )}
    </div>
  )
}
