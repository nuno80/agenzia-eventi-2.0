/**
 * FILE: src/lib/dal/staffAssignments.ts
 * Data Access Layer for Staff Assignments
 */

import { and, asc, desc, eq, gte, lt, lte, or } from 'drizzle-orm'
import { cache } from 'react'
import { db, staff, staffAssignments } from '@/db'

export type StaffAssignmentDTO = {
  id: string
  eventId: string
  staffId: string
  startTime: Date
  endTime: Date
  assignmentStatus: 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
  paymentStatus: 'not_due' | 'pending' | 'overdue' | 'paid'
  paymentTerms: 'custom' | 'immediate' | '30_days' | '60_days' | '90_days'
  paymentDueDate: Date | null
  paymentAmount: number | null
  paymentDate: Date | null
  invoiceNumber?: string | null
  invoiceUrl?: string | null
  staff?: { id: string; firstName: string; lastName: string; role: string }
  event?: { id: string; title: string; startDate: Date; endDate: Date }
}

function toDTO(
  row: typeof staffAssignments.$inferSelect & {
    staff?: { id: string; firstName: string; lastName: string; role: string }
    event?: { id: string; title: string; startDate: Date; endDate: Date }
  }
): StaffAssignmentDTO {
  return {
    id: row.id,
    eventId: row.eventId,
    staffId: row.staffId,
    startTime: row.startTime,
    endTime: row.endTime,
    assignmentStatus: row.assignmentStatus,
    paymentStatus: row.paymentStatus,
    paymentTerms: row.paymentTerms,
    paymentDueDate: row.paymentDueDate ?? null,
    paymentAmount: row.paymentAmount ?? null,
    paymentDate: row.paymentDate ?? null,
    invoiceNumber: row.invoiceNumber ?? null,
    invoiceUrl: row.invoiceUrl ?? null,
    staff: row.staff
      ? {
          id: row.staff.id,
          firstName: row.staff.firstName,
          lastName: row.staff.lastName,
          role: row.staff.role,
        }
      : undefined,
    event: row.event
      ? {
          id: row.event.id,
          title: row.event.title,
          startDate: row.event.startDate,
          endDate: row.event.endDate,
        }
      : undefined,
  }
}

// BASIC QUERIES
export const getAssignmentById = cache(async (id: string): Promise<StaffAssignmentDTO | null> => {
  const assignment = await db.query.staffAssignments.findFirst({
    where: eq(staffAssignments.id, id),
    with: {
      staff: { columns: { id: true, firstName: true, lastName: true, role: true } },
      event: { columns: { id: true, title: true, startDate: true, endDate: true } },
    },
  })
  return assignment ? toDTO(assignment) : null
})

export const getAssignmentsByEvent = cache(
  async (eventId: string): Promise<StaffAssignmentDTO[]> => {
    const rows = await db.query.staffAssignments.findMany({
      where: eq(staffAssignments.eventId, eventId),
      with: {
        staff: { columns: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: [asc(staffAssignments.startTime)],
    })
    return rows.map(toDTO)
  }
)

export const getAssignmentsByStaff = cache(
  async (staffId: string): Promise<StaffAssignmentDTO[]> => {
    const rows = await db.query.staffAssignments.findMany({
      where: eq(staffAssignments.staffId, staffId),
      with: {
        event: { columns: { id: true, title: true, startDate: true, endDate: true } },
      },
      orderBy: [desc(staffAssignments.startTime)],
    })
    return rows.map(toDTO)
  }
)

export const getUpcomingAssignments = cache(async (): Promise<StaffAssignmentDTO[]> => {
  const now = new Date()
  const rows = await db.query.staffAssignments.findMany({
    where: and(
      gte(staffAssignments.startTime, now),
      or(
        eq(staffAssignments.assignmentStatus, 'confirmed'),
        eq(staffAssignments.assignmentStatus, 'requested')
      )
    ),
    with: {
      staff: { columns: { id: true, firstName: true, lastName: true, role: true } },
      event: { columns: { id: true, title: true, startDate: true, endDate: true } },
    },
    orderBy: [asc(staffAssignments.startTime)],
  })
  return rows.map(toDTO)
})

export const getPendingConfirmations = cache(async (): Promise<StaffAssignmentDTO[]> => {
  const rows = await db.query.staffAssignments.findMany({
    where: eq(staffAssignments.assignmentStatus, 'requested'),
    with: {
      staff: { columns: { id: true, firstName: true, lastName: true, role: true } },
      event: { columns: { id: true, title: true, startDate: true, endDate: true } },
    },
  })
  return rows.map(toDTO)
})

// PAYMENT QUERIES
export const getOverduePayments = cache(async (): Promise<StaffAssignmentDTO[]> => {
  const now = new Date()
  const rows = await db.query.staffAssignments.findMany({
    where: and(
      eq(staffAssignments.paymentStatus, 'pending'),
      lt(staffAssignments.paymentDueDate, now)
    ),
    with: {
      staff: { columns: { id: true, firstName: true, lastName: true, role: true } },
      event: { columns: { id: true, title: true, startDate: true, endDate: true } },
    },
    orderBy: [asc(staffAssignments.paymentDueDate)],
  })
  return rows.map(toDTO)
})

export const getPaymentsDueSoon = cache(async (): Promise<StaffAssignmentDTO[]> => {
  const now = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const rows = await db.query.staffAssignments.findMany({
    where: and(
      eq(staffAssignments.paymentStatus, 'pending'),
      gte(staffAssignments.paymentDueDate, now),
      lte(staffAssignments.paymentDueDate, sevenDaysFromNow)
    ),
    with: {
      staff: { columns: { id: true, firstName: true, lastName: true, role: true } },
      event: { columns: { id: true, title: true, startDate: true, endDate: true } },
    },
    orderBy: [asc(staffAssignments.paymentDueDate)],
  })
  return rows.map(toDTO)
})

export const getAllPendingPayments = cache(async (): Promise<StaffAssignmentDTO[]> => {
  const rows = await db.query.staffAssignments.findMany({
    where: or(
      eq(staffAssignments.paymentStatus, 'pending'),
      eq(staffAssignments.paymentStatus, 'overdue')
    ),
    with: {
      staff: { columns: { id: true, firstName: true, lastName: true, role: true } },
      event: { columns: { id: true, title: true, startDate: true, endDate: true } },
    },
    orderBy: [asc(staffAssignments.paymentDueDate)],
  })
  return rows.map(toDTO)
})

export const getPaymentStats = cache(async () => {
  const [overdue, dueSoon, allPendingRows, allPaidRows] = await Promise.all([
    getOverduePayments(),
    getPaymentsDueSoon(),
    db
      .select()
      .from(staffAssignments)
      .where(
        or(
          eq(staffAssignments.paymentStatus, 'pending'),
          eq(staffAssignments.paymentStatus, 'overdue')
        )
      ),
    db.select().from(staffAssignments).where(eq(staffAssignments.paymentStatus, 'paid')),
  ])

  const totalOverdue = overdue.reduce((sum, a) => sum + (a.paymentAmount || 0), 0)
  const totalDueSoon = dueSoon.reduce((sum, a) => sum + (a.paymentAmount || 0), 0)
  const totalPending = allPendingRows.reduce((sum, a) => sum + (a.paymentAmount || 0), 0)
  const totalPaid = allPaidRows.reduce((sum, a) => sum + (a.paymentAmount || 0), 0)

  return {
    overdueCount: overdue.length,
    overdueAmount: totalOverdue,
    dueSoonCount: dueSoon.length,
    dueSoonAmount: totalDueSoon,
    pendingCount: allPendingRows.length,
    pendingAmount: totalPending,
    paidCount: allPaidRows.length,
    paidAmount: totalPaid,
    totalOutstanding: totalPending,
  }
})

export const getEventPayrollSummary = cache(async (eventId: string) => {
  const assignments = await getAssignmentsByEvent(eventId)
  const totalBudget = assignments.reduce((sum, a) => sum + (a.paymentAmount || 0), 0)
  const totalPaid = assignments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.paymentAmount || 0), 0)
  const totalPending = assignments
    .filter((a) => a.paymentStatus === 'pending' || a.paymentStatus === 'overdue')
    .reduce((sum, a) => sum + (a.paymentAmount || 0), 0)
  const totalOverdue = assignments
    .filter((a) => a.paymentStatus === 'overdue')
    .reduce((sum, a) => sum + (a.paymentAmount || 0), 0)

  return {
    totalStaff: assignments.length,
    totalBudget,
    totalPaid,
    totalPending,
    totalOverdue,
    percentagePaid: totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0,
    assignments,
  }
})

export const getEventPaymentsByStatus = cache(async (eventId: string) => {
  const assignments = await getAssignmentsByEvent(eventId)
  return {
    paid: assignments.filter((a) => a.paymentStatus === 'paid'),
    pending: assignments.filter((a) => a.paymentStatus === 'pending'),
    overdue: assignments.filter((a) => a.paymentStatus === 'overdue'),
    notDue: assignments.filter((a) => a.paymentStatus === 'not_due'),
    cancelled: assignments.filter((a) => a.assignmentStatus === 'cancelled'),
  }
})

// STATISTICS
export const getAssignmentStatsByRole = cache(async () => {
  const allAssignments = await db.select().from(staffAssignments)
  const allStaff = await db.select().from(staff)

  const staffRoles = new Map(allStaff.map((s) => [s.id, s.role]))
  const statsByRole: Record<string, number> = {}

  allAssignments.forEach((a) => {
    const role = staffRoles.get(a.staffId) || 'unknown'
    statsByRole[role] = (statsByRole[role] || 0) + 1
  })

  return statsByRole
})

export const getBusiestStaff = cache(async (limit: number = 10) => {
  const rows = await db.query.staff.findMany({
    with: {
      assignments: {
        where: or(
          eq(staffAssignments.assignmentStatus, 'confirmed'),
          eq(staffAssignments.assignmentStatus, 'completed')
        ),
      },
    },
  })

  const sorted = rows
    .map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
      assignmentCount: s.assignments.length,
    }))
    .sort((a, b) => b.assignmentCount - a.assignmentCount)
    .slice(0, limit)

  return sorted
})
