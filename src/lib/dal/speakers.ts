// ============================================================================
// DATA ACCESS LAYER - SPEAKERS
// ============================================================================
// FILE: src/lib/dal/speakers.ts
//
// PURPOSE: Centralizes all database queries related to event speakers
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getSpeakerById } from '@/lib/dal/speakers';
//   const speaker = await getSpeakerById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { speakers, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Speaker status enum
 * Represents the status of a speaker's participation
 */
export type SpeakerStatus = 'invited' | 'confirmed' | 'cancelled' | 'attended'

/**
 * Filter options for speaker queries
 */
export interface SpeakerFilters {
  eventId?: string
  status?: SpeakerStatus | SpeakerStatus[]
  topic?: string
  searchQuery?: string
}

/**
 * Sort options for speaker queries
 */
export interface SpeakerSortOptions {
  field: 'name' | 'email' | 'topic' | 'status' | 'presentationDate'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single speaker by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Speaker detail pages, forms that need speaker info
 *
 * @param id - Speaker ID
 * @returns Speaker object or null if not found
 *
 * @example
 * const speaker = await getSpeakerById('spk_123');
 * if (!speaker) return notFound();
 */
export const getSpeakerById = cache(async (id: string) => {
  try {
    const speaker = await db.query.speakers.findFirst({
      where: eq(speakers.id, id),
      with: {
        event: true,
      },
    })

    return speaker || null
  } catch (error) {
    console.error('Error fetching speaker by ID:', error)
    throw new Error('Failed to fetch speaker')
  }
})

/**
 * Get all speakers with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Speaker list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of speakers
 *
 * @example
 * const speakersList = await getAllSpeakers({ status: 'confirmed' }, { field: 'name', order: 'asc' });
 */
export const getAllSpeakers = cache(
  async (filters?: SpeakerFilters, sort: SpeakerSortOptions = { field: 'name', order: 'asc' }) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(speakers.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(speakers.status, s))))
        } else {
          conditions.push(eq(speakers.status, filters.status))
        }
      }

      if (filters?.topic) {
        conditions.push(like(speakers.topic, `%${filters.topic}%`))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(speakers.name, searchTerm),
            like(speakers.email, searchTerm),
            like(speakers.bio, searchTerm),
            like(speakers.topic, searchTerm),
            like(speakers.company, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = speakers[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allSpeakers = await db.query.speakers.findMany({
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

      return allSpeakers
    } catch (error) {
      console.error('Error fetching all speakers:', error)
      throw new Error('Failed to fetch speakers')
    }
  }
)

/**
 * Get speakers for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, speaker management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of speakers for the specified event
 *
 * @example
 * const eventSpeakers = await getSpeakersByEventId('evt_123');
 */
export const getSpeakersByEventId = cache(
  async (eventId: string, status?: SpeakerStatus | SpeakerStatus[]) => {
    try {
      const conditions = [eq(speakers.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(speakers.status, s))))
        } else {
          conditions.push(eq(speakers.status, status))
        }
      }

      const eventSpeakers = await db.query.speakers.findMany({
        where: and(...conditions),
        orderBy: asc(speakers.name),
      })

      return eventSpeakers
    } catch (error) {
      console.error('Error fetching speakers by event ID:', error)
      throw new Error('Failed to fetch event speakers')
    }
  }
)

/**
 * Get speaker statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with speaker statistics
 *
 * @example
 * const stats = await getSpeakerStatsByEventId('evt_123');
 * console.log(`Confirmed speakers: ${stats.confirmedCount}`);
 */
export const getSpeakerStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventSpeakers = await db.query.speakers.findMany({
      where: eq(speakers.eventId, eventId),
    })

    // Calculate statistics
    const stats = {
      totalCount: eventSpeakers.length,
      invitedCount: eventSpeakers.filter((s) => s.status === 'invited').length,
      confirmedCount: eventSpeakers.filter((s) => s.status === 'confirmed').length,
      cancelledCount: eventSpeakers.filter((s) => s.status === 'cancelled').length,
      attendedCount: eventSpeakers.filter((s) => s.status === 'attended').length,
    }

    // Calculate confirmation rate
    const invitedTotal =
      stats.invitedCount + stats.confirmedCount + stats.cancelledCount + stats.attendedCount
    stats.confirmationRate =
      invitedTotal > 0
        ? Math.round(((stats.confirmedCount + stats.attendedCount) / invitedTotal) * 100)
        : 0

    return stats
  } catch (error) {
    console.error('Error fetching speaker stats:', error)
    throw new Error('Failed to fetch speaker statistics')
  }
})

/**
 * Search speakers by name, topic, or company
 *
 * CACHE: Uses React cache()
 * USE CASE: Search functionality, autocomplete
 *
 * @param query - Search query string
 * @param eventId - Optional event ID to limit search scope
 * @returns Array of matching speakers
 *
 * @example
 * const results = await searchSpeakers('machine learning');
 */
export const searchSpeakers = cache(async (query: string, eventId?: string) => {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const searchTerm = `%${query.trim()}%`
    const conditions = [
      or(
        like(speakers.name, searchTerm),
        like(speakers.email, searchTerm),
        like(speakers.topic, searchTerm),
        like(speakers.company, searchTerm),
        like(speakers.bio, searchTerm)
      ),
    ]

    if (eventId) {
      conditions.push(eq(speakers.eventId, eventId))
    }

    const results = await db.query.speakers.findMany({
      where: and(...conditions),
      orderBy: [asc(speakers.name)],
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
    console.error('Error searching speakers:', error)
    throw new Error('Failed to search speakers')
  }
})

/**
 * Check if speaker exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Speaker ID to check
 * @returns Boolean indicating if speaker exists
 *
 * @example
 * const exists = await speakerExists('spk_123');
 * if (!exists) throw new Error('Speaker not found');
 */
export const speakerExists = cache(async (id: string): Promise<boolean> => {
  try {
    const speaker = await db.query.speakers.findFirst({
      where: eq(speakers.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!speaker
  } catch (error) {
    console.error('Error checking speaker existence:', error)
    return false
  }
})

/**
 * Get featured speakers for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event landing page, promotional materials
 *
 * @param eventId - Event ID
 * @param limit - Maximum number of speakers to return
 * @returns Array of featured speakers
 *
 * @example
 * const featuredSpeakers = await getFeaturedSpeakers('evt_123', 4);
 */
export const getFeaturedSpeakers = cache(async (eventId: string, limit: number = 4) => {
  try {
    const featuredSpeakers = await db.query.speakers.findMany({
      where: and(
        eq(speakers.eventId, eventId),
        eq(speakers.status, 'confirmed'),
        eq(speakers.featured, true)
      ),
      orderBy: asc(speakers.name),
      limit,
    })

    return featuredSpeakers
  } catch (error) {
    console.error('Error fetching featured speakers:', error)
    throw new Error('Failed to fetch featured speakers')
  }
})
