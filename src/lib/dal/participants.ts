// ============================================================================
// DATA ACCESS LAYER - PARTICIPANTS
// ============================================================================
// FILE: src/lib/dal/participants.ts
//
// PURPOSE: Centralizes all database queries related to event participants
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getParticipantById } from '@/lib/dal/participants';
//   const participant = await getParticipantById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { participants, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Participant status enum
 * Represents the registration status of a participant
 */
export type ParticipantStatus = 'registered' | 'confirmed' | 'cancelled' | 'attended' | 'no_show'

/**
 * Filter options for participant queries
 */
export interface ParticipantFilters {
  eventId?: string
  status?: ParticipantStatus | ParticipantStatus[]
  registrationDateFrom?: Date
  registrationDateTo?: Date
  searchQuery?: string
}

/**
 * Sort options for participant queries
 */
export interface ParticipantSortOptions {
  field: 'name' | 'email' | 'registrationDate' | 'status'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single participant by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Participant detail pages, forms that need participant info
 *
 * @param id - Participant ID
 * @returns Participant object or null if not found
 *
 * @example
 * const participant = await getParticipantById('part_123');
 * if (!participant) return notFound();
 */
export const getParticipantById = cache(async (id: string) => {
  try {
    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, id),
      with: {
        event: true,
      },
    })

    return participant || null
  } catch (error) {
    console.error('Error fetching participant by ID:', error)
    throw new Error('Failed to fetch participant')
  }
})

/**
 * Get all participants with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Participant list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of participants
 *
 * @example
 * const participantsList = await getAllParticipants({ status: 'confirmed' }, { field: 'name', order: 'asc' });
 */
export const getAllParticipants = cache(
  async (
    filters?: ParticipantFilters,
    sort: ParticipantSortOptions = { field: 'registrationDate', order: 'desc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(participants.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(participants.status, s))))
        } else {
          conditions.push(eq(participants.status, filters.status))
        }
      }

      if (filters?.registrationDateFrom) {
        conditions.push(gte(participants.registrationDate, filters.registrationDateFrom))
      }

      if (filters?.registrationDateTo) {
        conditions.push(lte(participants.registrationDate, filters.registrationDateTo))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(participants.name, searchTerm),
            like(participants.email, searchTerm),
            like(participants.phone, searchTerm),
            like(participants.company, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = participants[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allParticipants = await db.query.participants.findMany({
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

      return allParticipants
    } catch (error) {
      console.error('Error fetching all participants:', error)
      throw new Error('Failed to fetch participants')
    }
  }
)

/**
 * Get participants for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, participant management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of participants for the specified event
 *
 * @example
 * const eventParticipants = await getParticipantsByEventId('evt_123');
 */
export const getParticipantsByEventId = cache(
  async (eventId: string, status?: ParticipantStatus | ParticipantStatus[]) => {
    try {
      const conditions = [eq(participants.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(participants.status, s))))
        } else {
          conditions.push(eq(participants.status, status))
        }
      }

      const eventParticipants = await db.query.participants.findMany({
        where: and(...conditions),
        orderBy: asc(participants.name),
      })

      return eventParticipants
    } catch (error) {
      console.error('Error fetching participants by event ID:', error)
      throw new Error('Failed to fetch event participants')
    }
  }
)

/**
 * Get participant statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with participant statistics
 *
 * @example
 * const stats = await getParticipantStatsByEventId('evt_123');
 * console.log(`Confirmed participants: ${stats.confirmedCount}`);
 */
export const getParticipantStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventParticipants = await db.query.participants.findMany({
      where: eq(participants.eventId, eventId),
    })

    // Calculate statistics
    const stats = {
      totalCount: eventParticipants.length,
      registeredCount: eventParticipants.filter((p) => p.status === 'registered').length,
      confirmedCount: eventParticipants.filter((p) => p.status === 'confirmed').length,
      cancelledCount: eventParticipants.filter((p) => p.status === 'cancelled').length,
      attendedCount: eventParticipants.filter((p) => p.status === 'attended').length,
      noShowCount: eventParticipants.filter((p) => p.status === 'no_show').length,
    }

    // Calculate attendance rate
    const expectedAttendees = stats.confirmedCount + stats.attendedCount + stats.noShowCount
    stats.attendanceRate =
      expectedAttendees > 0 ? Math.round((stats.attendedCount / expectedAttendees) * 100) : 0

    return stats
  } catch (error) {
    console.error('Error fetching participant stats:', error)
    throw new Error('Failed to fetch participant statistics')
  }
})

/**
 * Search participants by name or email
 *
 * CACHE: Uses React cache()
 * USE CASE: Search functionality, autocomplete
 *
 * @param query - Search query string
 * @param eventId - Optional event ID to limit search scope
 * @returns Array of matching participants
 *
 * @example
 * const results = await searchParticipants('mario rossi');
 */
export const searchParticipants = cache(async (query: string, eventId?: string) => {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const searchTerm = `%${query.trim()}%`
    const conditions = [
      or(
        like(participants.name, searchTerm),
        like(participants.email, searchTerm),
        like(participants.phone, searchTerm)
      ),
    ]

    if (eventId) {
      conditions.push(eq(participants.eventId, eventId))
    }

    const results = await db.query.participants.findMany({
      where: and(...conditions),
      orderBy: [asc(participants.name)],
      limit: 20,
      with: {
        event: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    })

    return results
  } catch (error) {
    console.error('Error searching participants:', error)
    throw new Error('Failed to search participants')
  }
})

/**
 * Check if participant exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Participant ID to check
 * @returns Boolean indicating if participant exists
 *
 * @example
 * const exists = await participantExists('part_123');
 * if (!exists) throw new Error('Participant not found');
 */
export const participantExists = cache(async (id: string): Promise<boolean> => {
  try {
    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!participant
  } catch (error) {
    console.error('Error checking participant existence:', error)
    return false
  }
})

/**
 * Check if email is already registered for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Registration form validation
 *
 * @param email - Email address to check
 * @param eventId - Event ID
 * @param excludeParticipantId - Optional participant ID to exclude from check (for updates)
 * @returns Boolean indicating if email is already registered
 *
 * @example
 * const isDuplicate = await isEmailRegisteredForEvent('mario@example.com', 'evt_123');
 * if (isDuplicate) throw new Error('Email already registered');
 */
export const isEmailRegisteredForEvent = cache(
  async (email: string, eventId: string, excludeParticipantId?: string): Promise<boolean> => {
    try {
      const conditions = [eq(participants.email, email), eq(participants.eventId, eventId)]

      if (excludeParticipantId) {
        conditions.push(sql`${participants.id} != ${excludeParticipantId}`)
      }

      const existingParticipant = await db.query.participants.findFirst({
        where: and(...conditions),
        columns: { id: true }, // Only fetch ID for efficiency
      })

      return !!existingParticipant
    } catch (error) {
      console.error('Error checking email registration:', error)
      return false
    }
  }
)
