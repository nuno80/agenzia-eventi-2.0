// ============================================================================
// DATA ACCESS LAYER - AGENDA
// ============================================================================
// FILE: src/lib/dal/agenda.ts
//
// PURPOSE: Centralizes all database queries related to event agenda sessions
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getAgendaSessionById } from '@/lib/dal/agenda';
//   const session = await getAgendaSessionById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { agendaSessions, sessionRegistrations, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql, count, isNull, isNotNull } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Agenda session status enum
 * Represents the status of an agenda session
 */
export type AgendaSessionStatus = 'draft' | 'published' | 'cancelled' | 'completed'

/**
 * Agenda session type enum
 * Represents the type of agenda session
 */
export type AgendaSessionType =
  | 'keynote'
  | 'workshop'
  | 'panel'
  | 'breakout'
  | 'networking'
  | 'break'
  | 'other'

/**
 * Session registration status enum
 * Represents the status of a session registration
 */
export type SessionRegistrationStatus =
  | 'registered'
  | 'waitlisted'
  | 'cancelled'
  | 'attended'
  | 'no_show'

/**
 * Filter options for agenda session queries
 */
export interface AgendaSessionFilters {
  eventId?: string
  status?: AgendaSessionStatus | AgendaSessionStatus[]
  type?: AgendaSessionType | AgendaSessionType[]
  startTimeFrom?: Date
  startTimeTo?: Date
  endTimeFrom?: Date
  endTimeTo?: Date
  searchQuery?: string
  locationQuery?: string
  speakerQuery?: string
  tags?: string[]
  hasAvailableSpots?: boolean
}

/**
 * Sort options for agenda session queries
 */
export interface AgendaSessionSortOptions {
  field:
    | 'title'
    | 'startTime'
    | 'endTime'
    | 'status'
    | 'type'
    | 'location'
    | 'capacity'
    | 'registrationCount'
  order: 'asc' | 'desc'
}

/**
 * Filter options for session registration queries
 */
export interface SessionRegistrationFilters {
  sessionId?: string
  status?: SessionRegistrationStatus | SessionRegistrationStatus[]
  registeredFrom?: Date
  registeredTo?: Date
  searchQuery?: string
}

/**
 * Sort options for session registration queries
 */
export interface SessionRegistrationSortOptions {
  field: 'registeredAt' | 'participantName' | 'participantEmail' | 'status'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single agenda session by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Session detail pages, forms that need session info
 *
 * @param id - Agenda session ID
 * @returns Agenda session object or null if not found
 *
 * @example
 * const session = await getAgendaSessionById('sess_123');
 * if (!session) return notFound();
 */
export const getAgendaSessionById = cache(async (id: string) => {
  try {
    const session = await db.query.agendaSessions.findFirst({
      where: eq(agendaSessions.id, id),
      with: {
        event: true,
        registrations: true,
      },
    })

    return session || null
  } catch (error) {
    console.error('Error fetching agenda session by ID:', error)
    throw new Error('Failed to fetch agenda session')
  }
})

/**
 * Get all agenda sessions with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Agenda list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of agenda sessions
 *
 * @example
 * const sessionsList = await getAllAgendaSessions({ status: 'published' }, { field: 'startTime', order: 'asc' });
 */
export const getAllAgendaSessions = cache(
  async (
    filters?: AgendaSessionFilters,
    sort: AgendaSessionSortOptions = { field: 'startTime', order: 'asc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(agendaSessions.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(agendaSessions.status, s))))
        } else {
          conditions.push(eq(agendaSessions.status, filters.status))
        }
      }

      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          conditions.push(or(...filters.type.map((t) => eq(agendaSessions.type, t))))
        } else {
          conditions.push(eq(agendaSessions.type, filters.type))
        }
      }

      if (filters?.startTimeFrom) {
        conditions.push(gte(agendaSessions.startTime, filters.startTimeFrom))
      }

      if (filters?.startTimeTo) {
        conditions.push(lte(agendaSessions.startTime, filters.startTimeTo))
      }

      if (filters?.endTimeFrom) {
        conditions.push(gte(agendaSessions.endTime, filters.endTimeFrom))
      }

      if (filters?.endTimeTo) {
        conditions.push(lte(agendaSessions.endTime, filters.endTimeTo))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(like(agendaSessions.title, searchTerm), like(agendaSessions.description, searchTerm))
        )
      }

      if (filters?.locationQuery) {
        const locationTerm = `%${filters.locationQuery}%`
        conditions.push(like(agendaSessions.location, locationTerm))
      }

      if (filters?.speakerQuery) {
        const speakerTerm = `%${filters.speakerQuery}%`
        conditions.push(like(agendaSessions.speakers, speakerTerm))
      }

      if (filters?.tags && filters.tags.length > 0) {
        // This is a simplified approach for SQLite which doesn't have native JSON support
        // In a real app with proper JSON support, you'd use a more sophisticated query
        const tagConditions = filters.tags.map((tag) => {
          const tagPattern = `%"${tag}"%` // Looking for "tag" in JSON array string
          return like(agendaSessions.tags, tagPattern)
        })
        conditions.push(or(...tagConditions))
      }

      if (filters?.hasAvailableSpots !== undefined) {
        if (filters.hasAvailableSpots) {
          conditions.push(
            or(
              eq(agendaSessions.capacity, null), // Unlimited capacity
              sql`${agendaSessions.registrationCount} < ${agendaSessions.capacity}` // Has available spots
            )
          )
        } else {
          conditions.push(
            and(
              isNotNull(agendaSessions.capacity), // Has a capacity limit
              sql`${agendaSessions.registrationCount} >= ${agendaSessions.capacity}` // Is full
            )
          )
        }
      }

      // Build order by
      const orderByField = agendaSessions[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allSessions = await db.query.agendaSessions.findMany({
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

      return allSessions
    } catch (error) {
      console.error('Error fetching all agenda sessions:', error)
      throw new Error('Failed to fetch agenda sessions')
    }
  }
)

/**
 * Get agenda sessions for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, agenda management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of agenda sessions for the specified event
 *
 * @example
 * const eventSessions = await getAgendaSessionsByEventId('evt_123');
 */
export const getAgendaSessionsByEventId = cache(
  async (eventId: string, status?: AgendaSessionStatus | AgendaSessionStatus[]) => {
    try {
      const conditions = [eq(agendaSessions.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(agendaSessions.status, s))))
        } else {
          conditions.push(eq(agendaSessions.status, status))
        }
      }

      const eventSessions = await db.query.agendaSessions.findMany({
        where: and(...conditions),
        orderBy: asc(agendaSessions.startTime),
      })

      return eventSessions
    } catch (error) {
      console.error('Error fetching agenda sessions by event ID:', error)
      throw new Error('Failed to fetch event agenda sessions')
    }
  }
)

/**
 * Get agenda statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with agenda statistics
 *
 * @example
 * const stats = await getAgendaStatsByEventId('evt_123');
 * console.log(`Total sessions: ${stats.totalCount}, Average attendance: ${stats.averageAttendance}%`);
 */
export const getAgendaStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventSessions = await db.query.agendaSessions.findMany({
      where: eq(agendaSessions.eventId, eventId),
    })

    // Get all session IDs for this event
    const sessionIds = eventSessions.map((s) => s.id)

    // Get registration counts for each session
    let registrations = []
    if (sessionIds.length > 0) {
      registrations = await db.query.sessionRegistrations.findMany({
        where: or(...sessionIds.map((id) => eq(sessionRegistrations.sessionId, id))),
      })
    }

    // Calculate statistics
    const stats = {
      totalCount: eventSessions.length,
      draftCount: eventSessions.filter((s) => s.status === 'draft').length,
      publishedCount: eventSessions.filter((s) => s.status === 'published').length,
      cancelledCount: eventSessions.filter((s) => s.status === 'cancelled').length,
      completedCount: eventSessions.filter((s) => s.status === 'completed').length,

      // Count by type
      keynoteCount: eventSessions.filter((s) => s.type === 'keynote').length,
      workshopCount: eventSessions.filter((s) => s.type === 'workshop').length,
      panelCount: eventSessions.filter((s) => s.type === 'panel').length,
      breakoutCount: eventSessions.filter((s) => s.type === 'breakout').length,
      networkingCount: eventSessions.filter((s) => s.type === 'networking').length,
      breakCount: eventSessions.filter((s) => s.type === 'break').length,
      otherCount: eventSessions.filter((s) => s.type === 'other').length,

      // Registration metrics
      totalRegistrations: registrations.length,
      attendedCount: registrations.filter((r) => r.status === 'attended').length,
      noShowCount: registrations.filter((r) => r.status === 'no_show').length,
      waitlistedCount: registrations.filter((r) => r.status === 'waitlisted').length,
      cancelledRegistrations: registrations.filter((r) => r.status === 'cancelled').length,

      // Time metrics
      totalDurationMinutes: eventSessions.reduce((sum, s) => {
        if (s.startTime && s.endTime) {
          const start = new Date(s.startTime)
          const end = new Date(s.endTime)
          const durationMs = end.getTime() - start.getTime()
          return sum + durationMs / (1000 * 60) // Convert ms to minutes
        }
        return sum
      }, 0),
    }

    // Calculate rates
    const completedSessions = eventSessions.filter((s) => s.status === 'completed')
    const totalCapacity = eventSessions.reduce((sum, s) => sum + (s.capacity || 0), 0)

    stats.averageAttendance =
      completedSessions.length > 0
        ? Math.round(
            (stats.attendedCount /
              (completedSessions.length * (totalCapacity / eventSessions.length || 1))) *
              100
          )
        : 0

    stats.noShowRate =
      stats.totalRegistrations > 0
        ? Math.round((stats.noShowCount / stats.totalRegistrations) * 100)
        : 0

    return stats
  } catch (error) {
    console.error('Error fetching agenda stats:', error)
    throw new Error('Failed to fetch agenda statistics')
  }
})

/**
 * Get upcoming agenda sessions
 *
 * CACHE: Uses React cache()
 * USE CASE: Upcoming sessions list, schedule view
 *
 * @param eventId - Event ID
 * @returns Array of upcoming agenda sessions
 *
 * @example
 * const upcomingSessions = await getUpcomingAgendaSessions('evt_123');
 */
export const getUpcomingAgendaSessions = cache(async (eventId: string) => {
  try {
    const now = new Date()

    const upcomingSessions = await db.query.agendaSessions.findMany({
      where: and(
        eq(agendaSessions.eventId, eventId),
        eq(agendaSessions.status, 'published'),
        gte(agendaSessions.startTime, now)
      ),
      orderBy: asc(agendaSessions.startTime),
    })

    return upcomingSessions
  } catch (error) {
    console.error('Error fetching upcoming agenda sessions:', error)
    throw new Error('Failed to fetch upcoming agenda sessions')
  }
})

/**
 * Check if agenda session exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Agenda session ID to check
 * @returns Boolean indicating if agenda session exists
 *
 * @example
 * const exists = await agendaSessionExists('sess_123');
 * if (!exists) throw new Error('Session not found');
 */
export const agendaSessionExists = cache(async (id: string): Promise<boolean> => {
  try {
    const session = await db.query.agendaSessions.findFirst({
      where: eq(agendaSessions.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!session
  } catch (error) {
    console.error('Error checking agenda session existence:', error)
    return false
  }
})

/**
 * Get agenda sessions by type
 *
 * CACHE: Uses React cache()
 * USE CASE: Type-specific views, filtering
 *
 * @param eventId - Event ID
 * @param type - Agenda session type to filter by
 * @returns Array of agenda sessions of the specified type
 *
 * @example
 * const workshopSessions = await getAgendaSessionsByType('evt_123', 'workshop');
 */
export const getAgendaSessionsByType = cache(async (eventId: string, type: AgendaSessionType) => {
  try {
    const typeSessions = await db.query.agendaSessions.findMany({
      where: and(eq(agendaSessions.eventId, eventId), eq(agendaSessions.type, type)),
      orderBy: asc(agendaSessions.startTime),
    })

    return typeSessions
  } catch (error) {
    console.error('Error fetching agenda sessions by type:', error)
    throw new Error('Failed to fetch type agenda sessions')
  }
})

/**
 * Get current and next agenda sessions
 *
 * CACHE: Uses React cache()
 * USE CASE: Live event display, "happening now" widget
 *
 * @param eventId - Event ID
 * @returns Object with current and next sessions
 *
 * @example
 * const { currentSessions, nextSessions } = await getCurrentAndNextSessions('evt_123');
 */
export const getCurrentAndNextSessions = cache(async (eventId: string) => {
  try {
    const now = new Date()

    // Get current sessions (happening now)
    const currentSessions = await db.query.agendaSessions.findMany({
      where: and(
        eq(agendaSessions.eventId, eventId),
        eq(agendaSessions.status, 'published'),
        lte(agendaSessions.startTime, now),
        gte(agendaSessions.endTime, now)
      ),
      orderBy: asc(agendaSessions.endTime),
    })

    // Get next sessions (upcoming after current ones end)
    const nextStartTime =
      currentSessions.length > 0
        ? new Date(Math.max(...currentSessions.map((s) => new Date(s.endTime).getTime())))
        : now

    const nextSessions = await db.query.agendaSessions.findMany({
      where: and(
        eq(agendaSessions.eventId, eventId),
        eq(agendaSessions.status, 'published'),
        gte(agendaSessions.startTime, nextStartTime)
      ),
      orderBy: asc(agendaSessions.startTime),
      limit: 3, // Just get the next few sessions
    })

    return { currentSessions, nextSessions }
  } catch (error) {
    console.error('Error fetching current and next sessions:', error)
    throw new Error('Failed to fetch current and next sessions')
  }
})

/**
 * Get a single session registration by ID
 *
 * CACHE: Uses React cache()
 * USE CASE: Registration detail view
 *
 * @param id - Registration ID
 * @returns Session registration or null if not found
 *
 * @example
 * const registration = await getSessionRegistrationById('reg_123');
 */
export const getSessionRegistrationById = cache(async (id: string) => {
  try {
    const registration = await db.query.sessionRegistrations.findFirst({
      where: eq(sessionRegistrations.id, id),
      with: {
        session: true,
      },
    })

    return registration || null
  } catch (error) {
    console.error('Error fetching session registration by ID:', error)
    throw new Error('Failed to fetch session registration')
  }
})

/**
 * Get all registrations for a session
 *
 * CACHE: Uses React cache()
 * USE CASE: Session attendee list, check-in
 *
 * @param sessionId - Session ID
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of session registrations
 *
 * @example
 * const registrations = await getSessionRegistrations('sess_123');
 */
export const getSessionRegistrations = cache(
  async (
    sessionId: string,
    filters?: SessionRegistrationFilters,
    sort: SessionRegistrationSortOptions = { field: 'registeredAt', order: 'asc' }
  ) => {
    try {
      // Build where conditions
      const conditions = [eq(sessionRegistrations.sessionId, sessionId)]

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(sessionRegistrations.status, s))))
        } else {
          conditions.push(eq(sessionRegistrations.status, filters.status))
        }
      }

      if (filters?.registeredFrom) {
        conditions.push(gte(sessionRegistrations.registeredAt, filters.registeredFrom))
      }

      if (filters?.registeredTo) {
        conditions.push(lte(sessionRegistrations.registeredAt, filters.registeredTo))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(sessionRegistrations.participantName, searchTerm),
            like(sessionRegistrations.participantEmail, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = sessionRegistrations[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const registrations = await db.query.sessionRegistrations.findMany({
        where: and(...conditions),
        orderBy: orderFn(orderByField),
      })

      return registrations
    } catch (error) {
      console.error('Error fetching session registrations:', error)
      throw new Error('Failed to fetch session registrations')
    }
  }
)

/**
 * Check if a participant is registered for a session
 *
 * CACHE: Uses React cache()
 * USE CASE: Registration validation, duplicate prevention
 *
 * @param sessionId - Session ID
 * @param participantEmail - Participant's email
 * @returns Boolean indicating if the participant is registered
 *
 * @example
 * const isRegistered = await isParticipantRegisteredForSession('sess_123', 'john@example.com');
 */
export const isParticipantRegisteredForSession = cache(
  async (sessionId: string, participantEmail: string): Promise<boolean> => {
    try {
      const registration = await db.query.sessionRegistrations.findFirst({
        where: and(
          eq(sessionRegistrations.sessionId, sessionId),
          eq(sessionRegistrations.participantEmail, participantEmail),
          or(
            eq(sessionRegistrations.status, 'registered'),
            eq(sessionRegistrations.status, 'waitlisted'),
            eq(sessionRegistrations.status, 'attended')
          )
        ),
        columns: { id: true }, // Only fetch ID for efficiency
      })

      return !!registration
    } catch (error) {
      console.error('Error checking if participant is registered:', error)
      return false
    }
  }
)

/**
 * Get all sessions a participant is registered for
 *
 * CACHE: Uses React cache()
 * USE CASE: Participant schedule, personal agenda
 *
 * @param eventId - Event ID
 * @param participantEmail - Participant's email
 * @returns Array of sessions the participant is registered for
 *
 * @example
 * const participantSessions = await getParticipantSessions('evt_123', 'john@example.com');
 */
export const getParticipantSessions = cache(async (eventId: string, participantEmail: string) => {
  try {
    // First get all sessions for this event
    const eventSessionIds = await db.query.agendaSessions.findMany({
      where: eq(agendaSessions.eventId, eventId),
      columns: { id: true },
    })

    const sessionIds = eventSessionIds.map((s) => s.id)

    if (sessionIds.length === 0) {
      return []
    }

    // Then find all registrations for this participant
    const registrations = await db.query.sessionRegistrations.findMany({
      where: and(
        or(...sessionIds.map((id) => eq(sessionRegistrations.sessionId, id))),
        eq(sessionRegistrations.participantEmail, participantEmail),
        or(
          eq(sessionRegistrations.status, 'registered'),
          eq(sessionRegistrations.status, 'waitlisted'),
          eq(sessionRegistrations.status, 'attended')
        )
      ),
      with: {
        session: true,
      },
    })

    // Return the sessions
    return registrations.map((r) => r.session)
  } catch (error) {
    console.error('Error fetching participant sessions:', error)
    throw new Error('Failed to fetch participant sessions')
  }
})
