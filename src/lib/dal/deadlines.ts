/**
 * FILE: src/lib/dal/deadlines.ts
 * TYPE: Server-side Data Access Layer
 * WHY: Centralize access to deadlines data with DTO pattern and cache()
 *
 * FEATURES:
 * - All deadline queries with React cache()
 * - DTO pattern for type safety
 * - Event relation included where needed
 * - Stats and filters
 */

import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { cache } from 'react'
import { db, deadlines } from '@/db'

// ============================================================================
// DTO TYPE
// ============================================================================

export type DeadlineDTO = {
  id: string
  eventId: string
  title: string
  description: string | null
  dueDate: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  completedDate: Date | null
  assignedTo: string | null
  category: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  // Event relation (optional, included in some queries)
  event?: {
    id: string
    title: string
    startDate: Date
    endDate: Date
    status: string
  }
}

function toDTO(row: typeof deadlines.$inferSelect, event?: any): DeadlineDTO {
  return {
    id: row.id,
    eventId: row.eventId,
    title: row.title,
    description: row.description ?? null,
    dueDate: row.dueDate,
    priority: row.priority as DeadlineDTO['priority'],
    status: row.status as DeadlineDTO['status'],
    completedDate: row.completedDate ?? null,
    assignedTo: row.assignedTo ?? null,
    category: row.category ?? null,
    notes: row.notes ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(event && { event }),
  }
}

// ============================================================================
// CORE QUERIES
// ============================================================================

/**
 * Get all deadlines for a specific event
 * Ordered by due date (earliest first)
 */
export const getDeadlinesByEvent = cache(async (eventId: string): Promise<DeadlineDTO[]> => {
  const rows = await db.query.deadlines.findMany({
    where: eq(deadlines.eventId, eventId),
    orderBy: [asc(deadlines.dueDate)],
  })
  return rows.map((row) => toDTO(row))
})

/**
 * Get single deadline by ID
 * Returns null if not found
 */
export const getDeadlineById = cache(async (id: string): Promise<DeadlineDTO | null> => {
  const row = await db.query.deadlines.findFirst({
    where: eq(deadlines.id, id),
    with: {
      event: {
        columns: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
  })

  if (!row) return null

  return toDTO(row, row.event)
})

/**
 * Get all deadlines across all events
 * Ordered by due date (earliest first)
 */
export const getAllDeadlines = cache(async (): Promise<DeadlineDTO[]> => {
  const rows = await db.query.deadlines.findMany({
    orderBy: [asc(deadlines.dueDate)],
    with: {
      event: {
        columns: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
  })

  return rows.map((row) => toDTO(row, row.event))
})

// ============================================================================
// URGENT & OVERDUE (Moved from events.ts)
// ============================================================================

/**
 * Get urgent deadlines across all events
 * Returns deadlines due in next 7 days that are still pending
 */
export const getUrgentDeadlines = cache(async () => {
  const now = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  const urgent = await db.query.deadlines.findMany({
    where: and(
      gte(deadlines.dueDate, now),
      lte(deadlines.dueDate, sevenDaysFromNow),
      eq(deadlines.status, 'pending')
    ),
    orderBy: [asc(deadlines.dueDate)],
    with: {
      event: {
        columns: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
  })

  return urgent.map((row) => toDTO(row, row.event))
})

/**
 * Get overdue deadlines
 * Returns pending deadlines past their due date
 */
export const getOverdueDeadlines = cache(async () => {
  const now = new Date()

  const overdue = await db.query.deadlines.findMany({
    where: and(lte(deadlines.dueDate, now), eq(deadlines.status, 'pending')),
    orderBy: [asc(deadlines.dueDate)],
    with: {
      event: {
        columns: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    },
  })

  return overdue.map((row) => toDTO(row, row.event))
})

// ============================================================================
// FILTERS
// ============================================================================

/**
 * Get deadlines by status
 */
export const getDeadlinesByStatus = cache(
  async (status: 'pending' | 'in_progress' | 'completed' | 'overdue'): Promise<DeadlineDTO[]> => {
    const rows = await db.query.deadlines.findMany({
      where: eq(deadlines.status, status),
      orderBy: [asc(deadlines.dueDate)],
      with: {
        event: {
          columns: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    })

    return rows.map((row) => toDTO(row, row.event))
  }
)

/**
 * Get deadlines by priority
 */
export const getDeadlinesByPriority = cache(
  async (priority: 'low' | 'medium' | 'high' | 'urgent'): Promise<DeadlineDTO[]> => {
    const rows = await db.query.deadlines.findMany({
      where: eq(deadlines.priority, priority),
      orderBy: [asc(deadlines.dueDate)],
      with: {
        event: {
          columns: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    })

    return rows.map((row) => toDTO(row, row.event))
  }
)

/**
 * Get deadlines by category
 */
export const getDeadlinesByCategory = cache(async (category: string): Promise<DeadlineDTO[]> => {
  const rows = await db.query.deadlines.findMany({
    where: eq(deadlines.category, category),
    orderBy: [asc(deadlines.dueDate)],
  })

  return rows.map((row) => toDTO(row))
})

// ============================================================================
// STATS
// ============================================================================

/**
 * Get deadline statistics for an event
 * Returns counts by status and priority
 */
export const getDeadlineStats = cache(async (eventId: string) => {
  const all = await db.query.deadlines.findMany({
    where: eq(deadlines.eventId, eventId),
  })

  const now = new Date()

  return {
    total: all.length,
    // By status
    pending: all.filter((d) => d.status === 'pending').length,
    inProgress: all.filter((d) => d.status === 'in_progress').length,
    completed: all.filter((d) => d.status === 'completed').length,
    overdue: all.filter((d) => d.status === 'overdue').length,
    // By priority
    urgent: all.filter((d) => d.priority === 'urgent').length,
    high: all.filter((d) => d.priority === 'high').length,
    medium: all.filter((d) => d.priority === 'medium').length,
    low: all.filter((d) => d.priority === 'low').length,
    // Time-based
    dueThisWeek: all.filter((d) => {
      const dueDate = new Date(d.dueDate)
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      return dueDate >= now && dueDate <= weekFromNow && d.status === 'pending'
    }).length,
    pastDue: all.filter((d) => new Date(d.dueDate) < now && d.status === 'pending').length,
  }
})

/**
 * Get global deadline statistics
 * Across all events
 */
export const getGlobalDeadlineStats = cache(async () => {
  const all = await db.query.deadlines.findMany()

  const now = new Date()

  return {
    total: all.length,
    pending: all.filter((d) => d.status === 'pending').length,
    inProgress: all.filter((d) => d.status === 'in_progress').length,
    completed: all.filter((d) => d.status === 'completed').length,
    overdue: all.filter((d) => d.status === 'overdue').length,
    urgent: all.filter((d) => d.priority === 'urgent' && d.status === 'pending').length,
    dueThisWeek: all.filter((d) => {
      const dueDate = new Date(d.dueDate)
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      return dueDate >= now && dueDate <= weekFromNow && d.status === 'pending'
    }).length,
  }
})
