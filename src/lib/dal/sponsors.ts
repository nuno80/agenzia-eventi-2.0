// ============================================================================
// DATA ACCESS LAYER - SPONSORS
// ============================================================================
// FILE: src/lib/dal/sponsors.ts
//
// PURPOSE: Centralizes all database queries related to event sponsors
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getSponsorById } from '@/lib/dal/sponsors';
//   const sponsor = await getSponsorById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { sponsors, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Sponsor status enum
 * Represents the status of a sponsor's participation
 */
export type SponsorStatus = 'contacted' | 'negotiating' | 'confirmed' | 'paid' | 'cancelled'

/**
 * Filter options for sponsor queries
 */
export interface SponsorFilters {
  eventId?: string
  status?: SponsorStatus | SponsorStatus[]
  minAmount?: number
  maxAmount?: number
  searchQuery?: string
}

/**
 * Sort options for sponsor queries
 */
export interface SponsorSortOptions {
  field: 'name' | 'amount' | 'status' | 'contactDate'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single sponsor by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Sponsor detail pages, forms that need sponsor info
 *
 * @param id - Sponsor ID
 * @returns Sponsor object or null if not found
 *
 * @example
 * const sponsor = await getSponsorById('spn_123');
 * if (!sponsor) return notFound();
 */
export const getSponsorById = cache(async (id: string) => {
  try {
    const sponsor = await db.query.sponsors.findFirst({
      where: eq(sponsors.id, id),
      with: {
        event: true,
      },
    })

    return sponsor || null
  } catch (error) {
    console.error('Error fetching sponsor by ID:', error)
    throw new Error('Failed to fetch sponsor')
  }
})

/**
 * Get all sponsors with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Sponsor list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of sponsors
 *
 * @example
 * const sponsorsList = await getAllSponsors({ status: 'confirmed' }, { field: 'amount', order: 'desc' });
 */
export const getAllSponsors = cache(
  async (
    filters?: SponsorFilters,
    sort: SponsorSortOptions = { field: 'amount', order: 'desc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(sponsors.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(sponsors.status, s))))
        } else {
          conditions.push(eq(sponsors.status, filters.status))
        }
      }

      if (filters?.minAmount) {
        conditions.push(gte(sponsors.amount, filters.minAmount))
      }

      if (filters?.maxAmount) {
        conditions.push(lte(sponsors.amount, filters.maxAmount))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(sponsors.name, searchTerm),
            like(sponsors.contactName, searchTerm),
            like(sponsors.contactEmail, searchTerm),
            like(sponsors.benefits, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = sponsors[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allSponsors = await db.query.sponsors.findMany({
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

      return allSponsors
    } catch (error) {
      console.error('Error fetching all sponsors:', error)
      throw new Error('Failed to fetch sponsors')
    }
  }
)

/**
 * Get sponsors for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, sponsor management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of sponsors for the specified event
 *
 * @example
 * const eventSponsors = await getSponsorsByEventId('evt_123');
 */
export const getSponsorsByEventId = cache(
  async (eventId: string, status?: SponsorStatus | SponsorStatus[]) => {
    try {
      const conditions = [eq(sponsors.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(sponsors.status, s))))
        } else {
          conditions.push(eq(sponsors.status, status))
        }
      }

      const eventSponsors = await db.query.sponsors.findMany({
        where: and(...conditions),
        orderBy: desc(sponsors.amount),
      })

      return eventSponsors
    } catch (error) {
      console.error('Error fetching sponsors by event ID:', error)
      throw new Error('Failed to fetch event sponsors')
    }
  }
)

/**
 * Get sponsor statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with sponsor statistics
 *
 * @example
 * const stats = await getSponsorStatsByEventId('evt_123');
 * console.log(`Total sponsorship amount: ${stats.totalAmount}`);
 */
export const getSponsorStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventSponsors = await db.query.sponsors.findMany({
      where: eq(sponsors.eventId, eventId),
    })

    // Calculate statistics
    const stats = {
      totalCount: eventSponsors.length,
      contactedCount: eventSponsors.filter((s) => s.status === 'contacted').length,
      negotiatingCount: eventSponsors.filter((s) => s.status === 'negotiating').length,
      confirmedCount: eventSponsors.filter((s) => s.status === 'confirmed').length,
      paidCount: eventSponsors.filter((s) => s.status === 'paid').length,
      cancelledCount: eventSponsors.filter((s) => s.status === 'cancelled').length,

      // Calculate total amounts
      totalAmount: eventSponsors.reduce((sum, s) => sum + (s.amount || 0), 0),
      confirmedAmount: eventSponsors
        .filter((s) => ['confirmed', 'paid'].includes(s.status))
        .reduce((sum, s) => sum + (s.amount || 0), 0),
      paidAmount: eventSponsors
        .filter((s) => s.status === 'paid')
        .reduce((sum, s) => sum + (s.amount || 0), 0),
    }

    // Calculate conversion rate (contacted to confirmed/paid)
    const potentialSponsors =
      stats.contactedCount + stats.negotiatingCount + stats.confirmedCount + stats.paidCount
    stats.conversionRate =
      potentialSponsors > 0
        ? Math.round(((stats.confirmedCount + stats.paidCount) / potentialSponsors) * 100)
        : 0

    return stats
  } catch (error) {
    console.error('Error fetching sponsor stats:', error)
    throw new Error('Failed to fetch sponsor statistics')
  }
})

/**
 * Search sponsors by name or contact info
 *
 * CACHE: Uses React cache()
 * USE CASE: Search functionality, autocomplete
 *
 * @param query - Search query string
 * @param eventId - Optional event ID to limit search scope
 * @returns Array of matching sponsors
 *
 * @example
 * const results = await searchSponsors('acme');
 */
export const searchSponsors = cache(async (query: string, eventId?: string) => {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const searchTerm = `%${query.trim()}%`
    const conditions = [
      or(
        like(sponsors.name, searchTerm),
        like(sponsors.contactName, searchTerm),
        like(sponsors.contactEmail, searchTerm),
        like(sponsors.contactPhone, searchTerm)
      ),
    ]

    if (eventId) {
      conditions.push(eq(sponsors.eventId, eventId))
    }

    const results = await db.query.sponsors.findMany({
      where: and(...conditions),
      orderBy: [desc(sponsors.amount), asc(sponsors.name)],
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
    console.error('Error searching sponsors:', error)
    throw new Error('Failed to search sponsors')
  }
})

/**
 * Check if sponsor exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Sponsor ID to check
 * @returns Boolean indicating if sponsor exists
 *
 * @example
 * const exists = await sponsorExists('spn_123');
 * if (!exists) throw new Error('Sponsor not found');
 */
export const sponsorExists = cache(async (id: string): Promise<boolean> => {
  try {
    const sponsor = await db.query.sponsors.findFirst({
      where: eq(sponsors.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!sponsor
  } catch (error) {
    console.error('Error checking sponsor existence:', error)
    return false
  }
})

/**
 * Get total sponsorship amount for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Budget calculations, financial reporting
 *
 * @param eventId - Event ID
 * @param onlyConfirmed - If true, only count confirmed and paid sponsors
 * @returns Total sponsorship amount
 *
 * @example
 * const confirmedAmount = await getTotalSponsorshipAmount('evt_123', true);
 */
export const getTotalSponsorshipAmount = cache(
  async (eventId: string, onlyConfirmed: boolean = false): Promise<number> => {
    try {
      const conditions = [eq(sponsors.eventId, eventId)]

      if (onlyConfirmed) {
        conditions.push(or(eq(sponsors.status, 'confirmed'), eq(sponsors.status, 'paid')))
      }

      const eventSponsors = await db.query.sponsors.findMany({
        where: and(...conditions),
        columns: { amount: true },
      })

      const totalAmount = eventSponsors.reduce((sum, sponsor) => sum + (sponsor.amount || 0), 0)
      return totalAmount
    } catch (error) {
      console.error('Error calculating total sponsorship amount:', error)
      return 0
    }
  }
)
