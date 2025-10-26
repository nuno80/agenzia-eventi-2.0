// ============================================================================
// DATA ACCESS LAYER - CHECKINS
// ============================================================================
// FILE: src/lib/dal/checkins.ts
//
// PURPOSE: Centralizes all database queries related to event check-ins
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getCheckinById } from '@/lib/dal/checkins';
//   const checkin = await getCheckinById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { checkins, events, participants } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql, count, isNull, isNotNull } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Checkin status enum
 * Represents the status of a check-in
 */
export type CheckinStatus = 'checked_in' | 'checked_out' | 'no_show' | 'cancelled'

/**
 * Checkin type enum
 * Represents the type of check-in
 */
export type CheckinType = 'participant' | 'speaker' | 'staff' | 'vip' | 'media' | 'other'

/**
 * Verification method enum
 * Represents the method used to verify the check-in
 */
export type VerificationMethod =
  | 'qr_code'
  | 'manual'
  | 'id_check'
  | 'ticket'
  | 'facial_recognition'
  | 'none'

/**
 * Filter options for check-in queries
 */
export interface CheckinFilters {
  eventId?: string
  status?: CheckinStatus | CheckinStatus[]
  type?: CheckinType | CheckinType[]
  verificationMethod?: VerificationMethod | VerificationMethod[]
  checkedInFrom?: Date
  checkedInTo?: Date
  checkedOutFrom?: Date
  checkedOutTo?: Date
  searchQuery?: string
  badgePrinted?: boolean
  materialsProvided?: boolean
  onlyCheckedIn?: boolean
  onlyCheckedOut?: boolean
}

/**
 * Sort options for check-in queries
 */
export interface CheckinSortOptions {
  field: 'personName' | 'personEmail' | 'checkedInAt' | 'checkedOutAt' | 'status' | 'type'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single check-in by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Check-in detail pages, forms that need check-in info
 *
 * @param id - Check-in ID
 * @returns Check-in object or null if not found
 *
 * @example
 * const checkin = await getCheckinById('chk_123');
 * if (!checkin) return notFound();
 */
export const getCheckinById = cache(async (id: string) => {
  try {
    const checkin = await db.query.checkins.findFirst({
      where: eq(checkins.id, id),
      with: {
        event: true,
      },
    })

    return checkin || null
  } catch (error) {
    console.error('Error fetching check-in by ID:', error)
    throw new Error('Failed to fetch check-in')
  }
})

/**
 * Get all check-ins with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Check-in list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of check-ins
 *
 * @example
 * const checkinsList = await getAllCheckins({ status: 'checked_in' }, { field: 'checkedInAt', order: 'desc' });
 */
export const getAllCheckins = cache(
  async (
    filters?: CheckinFilters,
    sort: CheckinSortOptions = { field: 'checkedInAt', order: 'desc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(checkins.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(checkins.status, s))))
        } else {
          conditions.push(eq(checkins.status, filters.status))
        }
      }

      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          conditions.push(or(...filters.type.map((t) => eq(checkins.type, t))))
        } else {
          conditions.push(eq(checkins.type, filters.type))
        }
      }

      if (filters?.verificationMethod) {
        if (Array.isArray(filters.verificationMethod)) {
          conditions.push(
            or(...filters.verificationMethod.map((vm) => eq(checkins.verificationMethod, vm)))
          )
        } else {
          conditions.push(eq(checkins.verificationMethod, filters.verificationMethod))
        }
      }

      if (filters?.checkedInFrom) {
        conditions.push(gte(checkins.checkedInAt, filters.checkedInFrom))
      }

      if (filters?.checkedInTo) {
        conditions.push(lte(checkins.checkedInAt, filters.checkedInTo))
      }

      if (filters?.checkedOutFrom) {
        conditions.push(gte(checkins.checkedOutAt, filters.checkedOutFrom))
      }

      if (filters?.checkedOutTo) {
        conditions.push(lte(checkins.checkedOutAt, filters.checkedOutTo))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(checkins.personName, searchTerm),
            like(checkins.personEmail, searchTerm),
            like(checkins.notes, searchTerm)
          )
        )
      }

      if (filters?.badgePrinted !== undefined) {
        conditions.push(eq(checkins.badgePrinted, filters.badgePrinted))
      }

      if (filters?.materialsProvided !== undefined) {
        conditions.push(eq(checkins.materialsProvided, filters.materialsProvided))
      }

      if (filters?.onlyCheckedIn) {
        conditions.push(isNotNull(checkins.checkedInAt))
      }

      if (filters?.onlyCheckedOut) {
        conditions.push(isNotNull(checkins.checkedOutAt))
      }

      // Build order by
      const orderByField = checkins[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allCheckins = await db.query.checkins.findMany({
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

      return allCheckins
    } catch (error) {
      console.error('Error fetching all check-ins:', error)
      throw new Error('Failed to fetch check-ins')
    }
  }
)

/**
 * Get check-ins for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, check-in management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of check-ins for the specified event
 *
 * @example
 * const eventCheckins = await getCheckinsByEventId('evt_123');
 */
export const getCheckinsByEventId = cache(
  async (eventId: string, status?: CheckinStatus | CheckinStatus[]) => {
    try {
      const conditions = [eq(checkins.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(checkins.status, s))))
        } else {
          conditions.push(eq(checkins.status, status))
        }
      }

      const eventCheckins = await db.query.checkins.findMany({
        where: and(...conditions),
        orderBy: desc(checkins.checkedInAt),
      })

      return eventCheckins
    } catch (error) {
      console.error('Error fetching check-ins by event ID:', error)
      throw new Error('Failed to fetch event check-ins')
    }
  }
)

/**
 * Get check-in statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with check-in statistics
 *
 * @example
 * const stats = await getCheckinStatsByEventId('evt_123');
 * console.log(`Total checked in: ${stats.checkedInCount}, Check-in rate: ${stats.checkinRate}%`);
 */
export const getCheckinStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventCheckins = await db.query.checkins.findMany({
      where: eq(checkins.eventId, eventId),
    })

    // Get total expected attendees for this event
    const participantCount = await db
      .select({ count: count() })
      .from(participants)
      .where(eq(participants.eventId, eventId))

    const totalExpected = participantCount[0]?.count || 0

    // Calculate statistics
    const stats = {
      totalCount: eventCheckins.length,
      checkedInCount: eventCheckins.filter(
        (c) => c.status === 'checked_in' || c.status === 'checked_out'
      ).length,
      checkedOutCount: eventCheckins.filter((c) => c.status === 'checked_out').length,
      noShowCount: eventCheckins.filter((c) => c.status === 'no_show').length,
      cancelledCount: eventCheckins.filter((c) => c.status === 'cancelled').length,

      // Count by type
      participantCount: eventCheckins.filter((c) => c.type === 'participant').length,
      speakerCount: eventCheckins.filter((c) => c.type === 'speaker').length,
      staffCount: eventCheckins.filter((c) => c.type === 'staff').length,
      vipCount: eventCheckins.filter((c) => c.type === 'vip').length,
      mediaCount: eventCheckins.filter((c) => c.type === 'media').length,
      otherCount: eventCheckins.filter((c) => c.type === 'other').length,

      // Additional metrics
      badgePrintedCount: eventCheckins.filter((c) => c.badgePrinted).length,
      materialsProvidedCount: eventCheckins.filter((c) => c.materialsProvided).length,

      // Rates
      checkinRate:
        totalExpected > 0
          ? Math.round(
              (eventCheckins.filter((c) => c.status === 'checked_in' || c.status === 'checked_out')
                .length /
                totalExpected) *
                100
            )
          : 0,
      noShowRate:
        totalExpected > 0
          ? Math.round(
              (eventCheckins.filter((c) => c.status === 'no_show').length / totalExpected) * 100
            )
          : 0,
    }

    return stats
  } catch (error) {
    console.error('Error fetching check-in stats:', error)
    throw new Error('Failed to fetch check-in statistics')
  }
})

/**
 * Check if a person is checked in
 *
 * CACHE: Uses React cache()
 * USE CASE: Check-in verification, access control
 *
 * @param eventId - Event ID
 * @param personEmail - Person's email
 * @returns Boolean indicating if the person is checked in
 *
 * @example
 * const isCheckedIn = await isPersonCheckedIn('evt_123', 'john@example.com');
 */
export const isPersonCheckedIn = cache(
  async (eventId: string, personEmail: string): Promise<boolean> => {
    try {
      const checkin = await db.query.checkins.findFirst({
        where: and(
          eq(checkins.eventId, eventId),
          eq(checkins.personEmail, personEmail),
          or(eq(checkins.status, 'checked_in'), eq(checkins.status, 'checked_out'))
        ),
        columns: { id: true }, // Only fetch ID for efficiency
      })

      return !!checkin
    } catch (error) {
      console.error('Error checking if person is checked in:', error)
      return false
    }
  }
)

/**
 * Check if check-in exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Check-in ID to check
 * @returns Boolean indicating if check-in exists
 *
 * @example
 * const exists = await checkinExists('chk_123');
 * if (!exists) throw new Error('Check-in not found');
 */
export const checkinExists = cache(async (id: string): Promise<boolean> => {
  try {
    const checkin = await db.query.checkins.findFirst({
      where: eq(checkins.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!checkin
  } catch (error) {
    console.error('Error checking check-in existence:', error)
    return false
  }
})

/**
 * Get check-ins by type
 *
 * CACHE: Uses React cache()
 * USE CASE: Type-specific views, filtering
 *
 * @param eventId - Event ID
 * @param type - Check-in type to filter by
 * @returns Array of check-ins of the specified type
 *
 * @example
 * const vipCheckins = await getCheckinsByType('evt_123', 'vip');
 */
export const getCheckinsByType = cache(async (eventId: string, type: CheckinType) => {
  try {
    const typeCheckins = await db.query.checkins.findMany({
      where: and(eq(checkins.eventId, eventId), eq(checkins.type, type)),
      orderBy: desc(checkins.checkedInAt),
    })

    return typeCheckins
  } catch (error) {
    console.error('Error fetching check-ins by type:', error)
    throw new Error('Failed to fetch type check-ins')
  }
})

/**
 * Get recent check-ins
 *
 * CACHE: Uses React cache()
 * USE CASE: Recent activity, dashboard
 *
 * @param eventId - Event ID
 * @param limit - Maximum number of check-ins to return
 * @returns Array of recent check-ins
 *
 * @example
 * const recentCheckins = await getRecentCheckins('evt_123', 5);
 */
export const getRecentCheckins = cache(async (eventId: string, limit: number = 5) => {
  try {
    const recentCheckins = await db.query.checkins.findMany({
      where: and(
        eq(checkins.eventId, eventId),
        or(eq(checkins.status, 'checked_in'), eq(checkins.status, 'checked_out'))
      ),
      orderBy: desc(checkins.checkedInAt),
      limit,
    })

    return recentCheckins
  } catch (error) {
    console.error('Error fetching recent check-ins:', error)
    throw new Error('Failed to fetch recent check-ins')
  }
})

/**
 * Get check-in by person email
 *
 * CACHE: Uses React cache()
 * USE CASE: Check-in lookup, verification
 *
 * @param eventId - Event ID
 * @param email - Person's email
 * @returns Check-in object or null if not found
 *
 * @example
 * const personCheckin = await getCheckinByEmail('evt_123', 'john@example.com');
 */
export const getCheckinByEmail = cache(async (eventId: string, email: string) => {
  try {
    const checkin = await db.query.checkins.findFirst({
      where: and(eq(checkins.eventId, eventId), eq(checkins.personEmail, email)),
    })

    return checkin || null
  } catch (error) {
    console.error('Error fetching check-in by email:', error)
    throw new Error('Failed to fetch check-in by email')
  }
})

/**
 * Get check-ins that need badge printing
 *
 * CACHE: Uses React cache()
 * USE CASE: Badge printing queue
 *
 * @param eventId - Event ID
 * @returns Array of check-ins that need badge printing
 *
 * @example
 * const badgesToPrint = await getCheckinsNeedingBadges('evt_123');
 */
export const getCheckinsNeedingBadges = cache(async (eventId: string) => {
  try {
    const checkinsNeedingBadges = await db.query.checkins.findMany({
      where: and(
        eq(checkins.eventId, eventId),
        eq(checkins.status, 'checked_in'),
        eq(checkins.badgePrinted, false)
      ),
      orderBy: asc(checkins.checkedInAt),
    })

    return checkinsNeedingBadges
  } catch (error) {
    console.error('Error fetching check-ins needing badges:', error)
    throw new Error('Failed to fetch check-ins needing badges')
  }
})
