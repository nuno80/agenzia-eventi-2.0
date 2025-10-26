// ============================================================================
// DATA ACCESS LAYER - COMMUNICATIONS
// ============================================================================
// FILE: src/lib/dal/communications.ts
//
// PURPOSE: Centralizes all database queries related to event communications
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getCommunicationById } from '@/lib/dal/communications';
//   const communication = await getCommunicationById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { communications, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Communication status enum
 * Represents the status of a communication
 */
export type CommunicationStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled'

/**
 * Communication type enum
 * Represents the type of communication
 */
export type CommunicationType = 'email' | 'sms' | 'push' | 'in_app'

/**
 * Recipient type enum
 * Represents the type of recipient for a communication
 */
export type RecipientType = 'all' | 'participants' | 'speakers' | 'sponsors' | 'custom'

/**
 * Filter options for communication queries
 */
export interface CommunicationFilters {
  eventId?: string
  status?: CommunicationStatus | CommunicationStatus[]
  type?: CommunicationType | CommunicationType[]
  recipientType?: RecipientType | RecipientType[]
  scheduledFrom?: Date
  scheduledTo?: Date
  sentFrom?: Date
  sentTo?: Date
  searchQuery?: string
}

/**
 * Sort options for communication queries
 */
export interface CommunicationSortOptions {
  field: 'title' | 'scheduledAt' | 'sentAt' | 'status' | 'type' | 'recipientCount'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single communication by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Communication detail pages, forms that need communication info
 *
 * @param id - Communication ID
 * @returns Communication object or null if not found
 *
 * @example
 * const communication = await getCommunicationById('comm_123');
 * if (!communication) return notFound();
 */
export const getCommunicationById = cache(async (id: string) => {
  try {
    const communication = await db.query.communications.findFirst({
      where: eq(communications.id, id),
      with: {
        event: true,
      },
    })

    return communication || null
  } catch (error) {
    console.error('Error fetching communication by ID:', error)
    throw new Error('Failed to fetch communication')
  }
})

/**
 * Get all communications with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Communication list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of communications
 *
 * @example
 * const communicationsList = await getAllCommunications({ status: 'sent' }, { field: 'sentAt', order: 'desc' });
 */
export const getAllCommunications = cache(
  async (
    filters?: CommunicationFilters,
    sort: CommunicationSortOptions = { field: 'scheduledAt', order: 'desc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(communications.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(communications.status, s))))
        } else {
          conditions.push(eq(communications.status, filters.status))
        }
      }

      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          conditions.push(or(...filters.type.map((t) => eq(communications.type, t))))
        } else {
          conditions.push(eq(communications.type, filters.type))
        }
      }

      if (filters?.recipientType) {
        if (Array.isArray(filters.recipientType)) {
          conditions.push(
            or(...filters.recipientType.map((rt) => eq(communications.recipientType, rt)))
          )
        } else {
          conditions.push(eq(communications.recipientType, filters.recipientType))
        }
      }

      if (filters?.scheduledFrom) {
        conditions.push(gte(communications.scheduledAt, filters.scheduledFrom))
      }

      if (filters?.scheduledTo) {
        conditions.push(lte(communications.scheduledAt, filters.scheduledTo))
      }

      if (filters?.sentFrom) {
        conditions.push(gte(communications.sentAt, filters.sentFrom))
      }

      if (filters?.sentTo) {
        conditions.push(lte(communications.sentAt, filters.sentTo))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(communications.title, searchTerm),
            like(communications.content, searchTerm),
            like(communications.recipientFilter, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = communications[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allCommunications = await db.query.communications.findMany({
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

      return allCommunications
    } catch (error) {
      console.error('Error fetching all communications:', error)
      throw new Error('Failed to fetch communications')
    }
  }
)

/**
 * Get communications for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, communication management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of communications for the specified event
 *
 * @example
 * const eventCommunications = await getCommunicationsByEventId('evt_123');
 */
export const getCommunicationsByEventId = cache(
  async (eventId: string, status?: CommunicationStatus | CommunicationStatus[]) => {
    try {
      const conditions = [eq(communications.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(communications.status, s))))
        } else {
          conditions.push(eq(communications.status, status))
        }
      }

      const eventCommunications = await db.query.communications.findMany({
        where: and(...conditions),
        orderBy: desc(communications.scheduledAt),
      })

      return eventCommunications
    } catch (error) {
      console.error('Error fetching communications by event ID:', error)
      throw new Error('Failed to fetch event communications')
    }
  }
)

/**
 * Get communication statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with communication statistics
 *
 * @example
 * const stats = await getCommunicationStatsByEventId('evt_123');
 * console.log(`Total sent: ${stats.sentCount}, Open rate: ${stats.openRate}%`);
 */
export const getCommunicationStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventCommunications = await db.query.communications.findMany({
      where: eq(communications.eventId, eventId),
    })

    // Calculate statistics
    const stats = {
      totalCount: eventCommunications.length,
      draftCount: eventCommunications.filter((c) => c.status === 'draft').length,
      scheduledCount: eventCommunications.filter((c) => c.status === 'scheduled').length,
      sentCount: eventCommunications.filter((c) => c.status === 'sent').length,
      cancelledCount: eventCommunications.filter((c) => c.status === 'cancelled').length,

      // Count by type
      emailCount: eventCommunications.filter((c) => c.type === 'email').length,
      smsCount: eventCommunications.filter((c) => c.type === 'sms').length,
      pushCount: eventCommunications.filter((c) => c.type === 'push').length,
      inAppCount: eventCommunications.filter((c) => c.type === 'in_app').length,

      // Performance metrics
      totalRecipients: eventCommunications.reduce((sum, c) => sum + (c.recipientCount || 0), 0),
      totalOpens: eventCommunications.reduce((sum, c) => sum + (c.openCount || 0), 0),
      totalClicks: eventCommunications.reduce((sum, c) => sum + (c.clickCount || 0), 0),
      totalBounces: eventCommunications.reduce((sum, c) => sum + (c.bounceCount || 0), 0),
    }

    // Calculate rates
    const sentCommunications = eventCommunications.filter((c) => c.status === 'sent')
    const totalSentRecipients = sentCommunications.reduce(
      (sum, c) => sum + (c.recipientCount || 0),
      0
    )

    stats.openRate =
      totalSentRecipients > 0 ? Math.round((stats.totalOpens / totalSentRecipients) * 100) : 0

    stats.clickRate =
      stats.totalOpens > 0 ? Math.round((stats.totalClicks / stats.totalOpens) * 100) : 0

    stats.bounceRate =
      totalSentRecipients > 0 ? Math.round((stats.totalBounces / totalSentRecipients) * 100) : 0

    return stats
  } catch (error) {
    console.error('Error fetching communication stats:', error)
    throw new Error('Failed to fetch communication statistics')
  }
})

/**
 * Get upcoming scheduled communications
 *
 * CACHE: Uses React cache()
 * USE CASE: Communication planning, timeline view
 *
 * @param eventId - Event ID
 * @param days - Number of days to look ahead
 * @returns Array of upcoming scheduled communications
 *
 * @example
 * const upcomingCommunications = await getUpcomingCommunications('evt_123', 7);
 */
export const getUpcomingCommunications = cache(async (eventId: string, days: number = 7) => {
  try {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    const upcomingCommunications = await db.query.communications.findMany({
      where: and(
        eq(communications.eventId, eventId),
        eq(communications.status, 'scheduled'),
        gte(communications.scheduledAt, now),
        lte(communications.scheduledAt, futureDate)
      ),
      orderBy: asc(communications.scheduledAt),
    })

    return upcomingCommunications
  } catch (error) {
    console.error('Error fetching upcoming communications:', error)
    throw new Error('Failed to fetch upcoming communications')
  }
})

/**
 * Check if communication exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Communication ID to check
 * @returns Boolean indicating if communication exists
 *
 * @example
 * const exists = await communicationExists('comm_123');
 * if (!exists) throw new Error('Communication not found');
 */
export const communicationExists = cache(async (id: string): Promise<boolean> => {
  try {
    const communication = await db.query.communications.findFirst({
      where: eq(communications.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!communication
  } catch (error) {
    console.error('Error checking communication existence:', error)
    return false
  }
})

/**
 * Get communications by type
 *
 * CACHE: Uses React cache()
 * USE CASE: Type-specific views, filtering
 *
 * @param eventId - Event ID
 * @param type - Communication type to filter by
 * @returns Array of communications of the specified type
 *
 * @example
 * const emailCommunications = await getCommunicationsByType('evt_123', 'email');
 */
export const getCommunicationsByType = cache(async (eventId: string, type: CommunicationType) => {
  try {
    const typeCommunications = await db.query.communications.findMany({
      where: and(eq(communications.eventId, eventId), eq(communications.type, type)),
      orderBy: desc(communications.scheduledAt),
    })

    return typeCommunications
  } catch (error) {
    console.error('Error fetching communications by type:', error)
    throw new Error('Failed to fetch type communications')
  }
})

/**
 * Get recent sent communications
 *
 * CACHE: Uses React cache()
 * USE CASE: Recent activity, dashboard
 *
 * @param eventId - Event ID
 * @param limit - Maximum number of communications to return
 * @returns Array of recently sent communications
 *
 * @example
 * const recentCommunications = await getRecentSentCommunications('evt_123', 5);
 */
export const getRecentSentCommunications = cache(async (eventId: string, limit: number = 5) => {
  try {
    const recentCommunications = await db.query.communications.findMany({
      where: and(eq(communications.eventId, eventId), eq(communications.status, 'sent')),
      orderBy: desc(communications.sentAt),
      limit,
    })

    return recentCommunications
  } catch (error) {
    console.error('Error fetching recent sent communications:', error)
    throw new Error('Failed to fetch recent sent communications')
  }
})
