// ============================================================================
// DATA ACCESS LAYER - EVENTS
// ============================================================================
// FILE: src/lib/dal/events.ts
//
// PURPOSE: Centralizes all database queries related to events
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getEventById } from '@/lib/dal/events';
//   const event = await getEventById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Event status enum
 * Represents the lifecycle of an event
 */
export type EventStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled'

/**
 * Event type enum
 * Categorizes different event formats
 */
export type EventType = 'congresso_medico' | 'conferenza_aziendale' | 'workshop' | 'fiera'

/**
 * Filter options for event queries
 */
export interface EventFilters {
  status?: EventStatus | EventStatus[]
  type?: EventType
  startDateFrom?: Date
  startDateTo?: Date
  searchQuery?: string
}

/**
 * Sort options for event queries
 */
export interface EventSortOptions {
  field: 'startDate' | 'name' | 'capacity' | 'budget'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single event by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Event detail pages, tabs that need event info
 *
 * @param id - Event ID
 * @returns Event object or null if not found
 *
 * @example
 * const event = await getEventById('evt_123');
 * if (!event) return notFound();
 */
export const getEventById = cache(async (id: string) => {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      // Include related data if needed
      // with: {
      //   participants: true,
      //   speakers: true,
      //   sponsors: true,
      // }
    })

    return event || null
  } catch (error) {
    console.error('Error fetching event by ID:', error)
    throw new Error('Failed to fetch event')
  }
})

/**
 * Get all events with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Event list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of events
 *
 * @example
 * const events = await getAllEvents({ status: 'upcoming' }, { field: 'startDate', order: 'asc' });
 */
export const getAllEvents = cache(
  async (
    filters?: EventFilters,
    sort: EventSortOptions = { field: 'startDate', order: 'desc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(events.status, s))))
        } else {
          conditions.push(eq(events.status, filters.status))
        }
      }

      if (filters?.type) {
        conditions.push(eq(events.type, filters.type))
      }

      if (filters?.startDateFrom) {
        conditions.push(gte(events.startDate, filters.startDateFrom))
      }

      if (filters?.startDateTo) {
        conditions.push(lte(events.startDate, filters.startDateTo))
      }

      if (filters?.searchQuery) {
        conditions.push(like(events.name, `%${filters.searchQuery}%`))
      }

      // Build order by
      const orderByField = events[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allEvents = await db.query.events.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: orderFn(orderByField),
      })

      return allEvents
    } catch (error) {
      console.error('Error fetching all events:', error)
      throw new Error('Failed to fetch events')
    }
  }
)

/**
 * Get upcoming events (next 30 days)
 *
 * CACHE: Uses React cache()
 * USE CASE: Dashboard home page
 *
 * @param daysAhead - Number of days to look ahead (default: 30)
 * @returns Array of upcoming events
 *
 * @example
 * const upcomingEvents = await getUpcomingEvents();
 */
export const getUpcomingEvents = cache(async (daysAhead: number = 30) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    futureDate.setHours(23, 59, 59, 999)

    const upcomingEvents = await db.query.events.findMany({
      where: and(
        or(eq(events.status, 'upcoming'), eq(events.status, 'active')),
        gte(events.startDate, today),
        lte(events.startDate, futureDate)
      ),
      orderBy: asc(events.startDate),
    })

    return upcomingEvents
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    throw new Error('Failed to fetch upcoming events')
  }
})

/**
 * Get active events (currently happening)
 *
 * CACHE: Uses React cache()
 * USE CASE: Dashboard stats, real-time monitoring
 *
 * @returns Array of active events
 *
 * @example
 * const activeEvents = await getActiveEvents();
 */
export const getActiveEvents = cache(async () => {
  try {
    const today = new Date()

    const activeEvents = await db.query.events.findMany({
      where: and(
        eq(events.status, 'active'),
        lte(events.startDate, today),
        gte(events.endDate, today)
      ),
      orderBy: asc(events.startDate),
    })

    return activeEvents
  } catch (error) {
    console.error('Error fetching active events:', error)
    throw new Error('Failed to fetch active events')
  }
})

/**
 * Get event statistics
 *
 * CACHE: Uses React cache()
 * USE CASE: Dashboard overview cards
 *
 * @returns Object with event statistics
 *
 * @example
 * const stats = await getEventStats();
 * console.log(`Active events: ${stats.activeCount}`);
 */
export const getEventStats = cache(async () => {
  try {
    const allEvents = await db.query.events.findMany()

    // Calculate statistics
    const stats = {
      totalEvents: allEvents.length,
      activeCount: allEvents.filter((e) => e.status === 'active').length,
      upcomingCount: allEvents.filter((e) => e.status === 'upcoming').length,
      completedCount: allEvents.filter((e) => e.status === 'completed').length,
      totalParticipants: allEvents.reduce((sum, e) => sum + (e.registeredCount || 0), 0),
      totalBudget: allEvents.reduce((sum, e) => sum + (e.budget || 0), 0),
      totalSpent: allEvents.reduce((sum, e) => sum + (e.spent || 0), 0),
    }

    // Calculate budget utilization percentage
    stats.budgetUtilization =
      stats.totalBudget > 0 ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0

    return stats
  } catch (error) {
    console.error('Error fetching event stats:', error)
    throw new Error('Failed to fetch event statistics')
  }
})

/**
 * Get events by status
 *
 * CACHE: Uses React cache()
 * USE CASE: Filtered lists, status-specific views
 *
 * @param status - Event status to filter by
 * @returns Array of events with specified status
 *
 * @example
 * const draftEvents = await getEventsByStatus('draft');
 */
export const getEventsByStatus = cache(async (status: EventStatus) => {
  try {
    const filteredEvents = await db.query.events.findMany({
      where: eq(events.status, status),
      orderBy: desc(events.createdAt),
    })

    return filteredEvents
  } catch (error) {
    console.error('Error fetching events by status:', error)
    throw new Error('Failed to fetch events by status')
  }
})

/**
 * Get events by type
 *
 * CACHE: Uses React cache()
 * USE CASE: Type-specific reports, category views
 *
 * @param type - Event type to filter by
 * @returns Array of events with specified type
 *
 * @example
 * const medicalConferences = await getEventsByType('congresso_medico');
 */
export const getEventsByType = cache(async (type: EventType) => {
  try {
    const filteredEvents = await db.query.events.findMany({
      where: eq(events.type, type),
      orderBy: desc(events.startDate),
    })

    return filteredEvents
  } catch (error) {
    console.error('Error fetching events by type:', error)
    throw new Error('Failed to fetch events by type')
  }
})

/**
 * Check if event exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Event ID to check
 * @returns Boolean indicating if event exists
 *
 * @example
 * const exists = await eventExists('evt_123');
 * if (!exists) throw new Error('Event not found');
 */
export const eventExists = cache(async (id: string): Promise<boolean> => {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!event
  } catch (error) {
    console.error('Error checking event existence:', error)
    return false
  }
})

/**
 * Get event with full details (including relations)
 *
 * CACHE: Uses React cache()
 * USE CASE: Detail pages that need all related data
 *
 * @param id - Event ID
 * @returns Event with all related data or null
 *
 * @example
 * const fullEvent = await getEventWithDetails('evt_123');
 * console.log(`Participants: ${fullEvent.participants.length}`);
 */
export const getEventWithDetails = cache(async (id: string) => {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        participants: {
          orderBy: (participants, { asc }) => [asc(participants.name)],
        },
        speakers: {
          orderBy: (speakers, { asc }) => [asc(speakers.name)],
        },
        sponsors: {
          orderBy: (sponsors, { desc }) => [desc(sponsors.amount)],
        },
        services: true,
        budgetCategories: true,
        deadlines: {
          where: (deadlines, { eq }) => eq(deadlines.status, 'pending'),
          orderBy: (deadlines, { asc }) => [asc(deadlines.dueDate)],
        },
      },
    })

    return event || null
  } catch (error) {
    console.error('Error fetching event with details:', error)
    throw new Error('Failed to fetch event details')
  }
})

/**
 * Search events by name or location
 *
 * CACHE: Uses React cache()
 * USE CASE: Search functionality, autocomplete
 *
 * @param query - Search query string
 * @returns Array of matching events
 *
 * @example
 * const results = await searchEvents('cardiologia');
 */
export const searchEvents = cache(async (query: string) => {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const searchTerm = `%${query.trim()}%`

    const results = await db.query.events.findMany({
      where: or(
        like(events.name, searchTerm),
        like(events.location, searchTerm),
        like(events.description, searchTerm)
      ),
      orderBy: [desc(events.startDate), asc(events.name)],
      limit: 20,
    })

    return results
  } catch (error) {
    console.error('Error searching events:', error)
    throw new Error('Failed to search events')
  }
})

/**
 * Get events with upcoming deadlines
 *
 * CACHE: Uses React cache()
 * USE CASE: Dashboard alerts, deadline tracking
 *
 * @param daysAhead - Number of days to look ahead (default: 14)
 * @returns Array of events with upcoming deadlines
 *
 * @example
 * const eventsWithDeadlines = await getEventsWithUpcomingDeadlines(7);
 */
export const getEventsWithUpcomingDeadlines = cache(async (daysAhead: number = 14) => {
  try {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    // This is a more complex query that requires joining with deadlines table
    // Implementation depends on the specific schema relationships
    // This is a simplified example
    const eventsWithDeadlines = await db.query.events.findMany({
      with: {
        deadlines: {
          where: (deadlines, { and, gte, lte, eq }) =>
            and(
              gte(deadlines.dueDate, today),
              lte(deadlines.dueDate, futureDate),
              eq(deadlines.status, 'pending')
            ),
        },
      },
      // Only include events that have at least one upcoming deadline
      where: (events, { exists, sql }) =>
        exists(
          sql`SELECT 1 FROM ${deadlines} WHERE ${deadlines.eventId} = ${events.id} AND ${deadlines.status} = 'pending' AND ${deadlines.dueDate} >= ${today} AND ${deadlines.dueDate} <= ${futureDate}`
        ),
    })

    // Filter out events with no deadlines (should not happen due to exists clause, but just in case)
    return eventsWithDeadlines.filter((event) => event.deadlines.length > 0)
  } catch (error) {
    console.error('Error fetching events with upcoming deadlines:', error)
    throw new Error('Failed to fetch events with upcoming deadlines')
  }
})
