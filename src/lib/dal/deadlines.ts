// ============================================================================
// DATA ACCESS LAYER - DEADLINES
// ============================================================================
// FILE: src/lib/dal/deadlines.ts
//
// PURPOSE: Centralizes all database queries related to event deadlines
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getDeadlineById } from '@/lib/dal/deadlines';
//   const deadline = await getDeadlineById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { deadlines, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Deadline status enum
 * Represents the status of a deadline
 */
export type DeadlineStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'

/**
 * Deadline priority enum
 * Represents the priority level of a deadline
 */
export type DeadlinePriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Filter options for deadline queries
 */
export interface DeadlineFilters {
  eventId?: string
  status?: DeadlineStatus | DeadlineStatus[]
  priority?: DeadlinePriority | DeadlinePriority[]
  category?: string
  dueDateFrom?: Date
  dueDateTo?: Date
  searchQuery?: string
}

/**
 * Sort options for deadline queries
 */
export interface DeadlineSortOptions {
  field: 'title' | 'dueDate' | 'priority' | 'status' | 'category'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single deadline by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Deadline detail pages, forms that need deadline info
 *
 * @param id - Deadline ID
 * @returns Deadline object or null if not found
 *
 * @example
 * const deadline = await getDeadlineById('dl_123');
 * if (!deadline) return notFound();
 */
export const getDeadlineById = cache(async (id: string) => {
  try {
    const deadline = await db.query.deadlines.findFirst({
      where: eq(deadlines.id, id),
      with: {
        event: true,
      },
    })

    return deadline || null
  } catch (error) {
    console.error('Error fetching deadline by ID:', error)
    throw new Error('Failed to fetch deadline')
  }
})

/**
 * Get all deadlines with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Deadline list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of deadlines
 *
 * @example
 * const deadlinesList = await getAllDeadlines({ status: 'pending' }, { field: 'dueDate', order: 'asc' });
 */
export const getAllDeadlines = cache(
  async (
    filters?: DeadlineFilters,
    sort: DeadlineSortOptions = { field: 'dueDate', order: 'asc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(deadlines.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(deadlines.status, s))))
        } else {
          conditions.push(eq(deadlines.status, filters.status))
        }
      }

      if (filters?.priority) {
        if (Array.isArray(filters.priority)) {
          conditions.push(or(...filters.priority.map((p) => eq(deadlines.priority, p))))
        } else {
          conditions.push(eq(deadlines.priority, filters.priority))
        }
      }

      if (filters?.category) {
        conditions.push(eq(deadlines.category, filters.category))
      }

      if (filters?.dueDateFrom) {
        conditions.push(gte(deadlines.dueDate, filters.dueDateFrom))
      }

      if (filters?.dueDateTo) {
        conditions.push(lte(deadlines.dueDate, filters.dueDateTo))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(deadlines.title, searchTerm),
            like(deadlines.description, searchTerm),
            like(deadlines.category, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = deadlines[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allDeadlines = await db.query.deadlines.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: orderFn(orderByField),
        with: {
          event: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      })

      return allDeadlines
    } catch (error) {
      console.error('Error fetching all deadlines:', error)
      throw new Error('Failed to fetch deadlines')
    }
  }
)

/**
 * Get deadlines for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, deadline management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of deadlines for the specified event
 *
 * @example
 * const eventDeadlines = await getDeadlinesByEventId('evt_123');
 */
export const getDeadlinesByEventId = cache(
  async (eventId: string, status?: DeadlineStatus | DeadlineStatus[]) => {
    try {
      const conditions = [eq(deadlines.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(deadlines.status, s))))
        } else {
          conditions.push(eq(deadlines.status, status))
        }
      }

      const eventDeadlines = await db.query.deadlines.findMany({
        where: and(...conditions),
        orderBy: asc(deadlines.dueDate),
      })

      return eventDeadlines
    } catch (error) {
      console.error('Error fetching deadlines by event ID:', error)
      throw new Error('Failed to fetch event deadlines')
    }
  }
)

/**
 * Get deadline statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with deadline statistics
 *
 * @example
 * const stats = await getDeadlineStatsByEventId('evt_123');
 * console.log(`Completed deadlines: ${stats.completedCount}`);
 */
export const getDeadlineStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventDeadlines = await db.query.deadlines.findMany({
      where: eq(deadlines.eventId, eventId),
    })

    // Calculate statistics
    const stats = {
      totalCount: eventDeadlines.length,
      pendingCount: eventDeadlines.filter((d) => d.status === 'pending').length,
      inProgressCount: eventDeadlines.filter((d) => d.status === 'in_progress').length,
      completedCount: eventDeadlines.filter((d) => d.status === 'completed').length,
      overdueCount: eventDeadlines.filter((d) => d.status === 'overdue').length,
      cancelledCount: eventDeadlines.filter((d) => d.status === 'cancelled').length,

      // Count by priority
      lowPriorityCount: eventDeadlines.filter((d) => d.priority === 'low').length,
      mediumPriorityCount: eventDeadlines.filter((d) => d.priority === 'medium').length,
      highPriorityCount: eventDeadlines.filter((d) => d.priority === 'high').length,
      urgentPriorityCount: eventDeadlines.filter((d) => d.priority === 'urgent').length,
    }

    // Calculate completion rate
    const activeDeadlines = stats.totalCount - stats.cancelledCount
    stats.completionRate =
      activeDeadlines > 0 ? Math.round((stats.completedCount / activeDeadlines) * 100) : 0

    return stats
  } catch (error) {
    console.error('Error fetching deadline stats:', error)
    throw new Error('Failed to fetch deadline statistics')
  }
})

/**
 * Get upcoming deadlines for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event planning, timeline view
 *
 * @param eventId - Event ID
 * @param days - Number of days to look ahead
 * @returns Array of upcoming deadlines
 *
 * @example
 * const upcomingDeadlines = await getUpcomingDeadlines('evt_123', 7);
 */
export const getUpcomingDeadlines = cache(async (eventId: string, days: number = 7) => {
  try {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    const upcomingDeadlines = await db.query.deadlines.findMany({
      where: and(
        eq(deadlines.eventId, eventId),
        gte(deadlines.dueDate, now),
        lte(deadlines.dueDate, futureDate),
        or(eq(deadlines.status, 'pending'), eq(deadlines.status, 'in_progress'))
      ),
      orderBy: asc(deadlines.dueDate),
    })

    return upcomingDeadlines
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error)
    throw new Error('Failed to fetch upcoming deadlines')
  }
})

/**
 * Get overdue deadlines for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Task management, alerts
 *
 * @param eventId - Event ID
 * @returns Array of overdue deadlines
 *
 * @example
 * const overdueDeadlines = await getOverdueDeadlines('evt_123');
 */
export const getOverdueDeadlines = cache(async (eventId: string) => {
  try {
    const now = new Date()

    const overdueDeadlines = await db.query.deadlines.findMany({
      where: and(
        eq(deadlines.eventId, eventId),
        lte(deadlines.dueDate, now),
        or(eq(deadlines.status, 'pending'), eq(deadlines.status, 'in_progress'))
      ),
      orderBy: asc(deadlines.dueDate),
    })

    return overdueDeadlines
  } catch (error) {
    console.error('Error fetching overdue deadlines:', error)
    throw new Error('Failed to fetch overdue deadlines')
  }
})

/**
 * Check if deadline exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Deadline ID to check
 * @returns Boolean indicating if deadline exists
 *
 * @example
 * const exists = await deadlineExists('dl_123');
 * if (!exists) throw new Error('Deadline not found');
 */
export const deadlineExists = cache(async (id: string): Promise<boolean> => {
  try {
    const deadline = await db.query.deadlines.findFirst({
      where: eq(deadlines.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!deadline
  } catch (error) {
    console.error('Error checking deadline existence:', error)
    return false
  }
})

/**
 * Get deadlines by category
 *
 * CACHE: Uses React cache()
 * USE CASE: Category-specific views, filtering
 *
 * @param eventId - Event ID
 * @param category - Category to filter by
 * @returns Array of deadlines in the specified category
 *
 * @example
 * const marketingDeadlines = await getDeadlinesByCategory('evt_123', 'Marketing');
 */
export const getDeadlinesByCategory = cache(async (eventId: string, category: string) => {
  try {
    const categoryDeadlines = await db.query.deadlines.findMany({
      where: and(eq(deadlines.eventId, eventId), eq(deadlines.category, category)),
      orderBy: asc(deadlines.dueDate),
    })

    return categoryDeadlines
  } catch (error) {
    console.error('Error fetching deadlines by category:', error)
    throw new Error('Failed to fetch category deadlines')
  }
})

/**
 * Get high priority deadlines
 *
 * CACHE: Uses React cache()
 * USE CASE: Priority task management, alerts
 *
 * @param eventId - Event ID
 * @returns Array of high and urgent priority deadlines
 *
 * @example
 * const highPriorityTasks = await getHighPriorityDeadlines('evt_123');
 */
export const getHighPriorityDeadlines = cache(async (eventId: string) => {
  try {
    const highPriorityDeadlines = await db.query.deadlines.findMany({
      where: and(
        eq(deadlines.eventId, eventId),
        or(eq(deadlines.priority, 'high'), eq(deadlines.priority, 'urgent')),
        or(eq(deadlines.status, 'pending'), eq(deadlines.status, 'in_progress'))
      ),
      orderBy: [desc(deadlines.priority), asc(deadlines.dueDate)],
    })

    return highPriorityDeadlines
  } catch (error) {
    console.error('Error fetching high priority deadlines:', error)
    throw new Error('Failed to fetch high priority deadlines')
  }
})
