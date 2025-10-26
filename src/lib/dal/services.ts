// ============================================================================
// DATA ACCESS LAYER - SERVICES
// ============================================================================
// FILE: src/lib/dal/services.ts
//
// PURPOSE: Centralizes all database queries related to event services
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getServiceById } from '@/lib/dal/services';
//   const service = await getServiceById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { services, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Service status enum
 * Represents the status of a service for an event
 */
export type ServiceStatus = 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

/**
 * Filter options for service queries
 */
export interface ServiceFilters {
  eventId?: string
  status?: ServiceStatus | ServiceStatus[]
  minCost?: number
  maxCost?: number
  provider?: string
  serviceType?: string
  searchQuery?: string
}

/**
 * Sort options for service queries
 */
export interface ServiceSortOptions {
  field: 'name' | 'provider' | 'cost' | 'status' | 'scheduledDate'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single service by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Service detail pages, forms that need service info
 *
 * @param id - Service ID
 * @returns Service object or null if not found
 *
 * @example
 * const service = await getServiceById('srv_123');
 * if (!service) return notFound();
 */
export const getServiceById = cache(async (id: string) => {
  try {
    const service = await db.query.services.findFirst({
      where: eq(services.id, id),
      with: {
        event: true,
      },
    })

    return service || null
  } catch (error) {
    console.error('Error fetching service by ID:', error)
    throw new Error('Failed to fetch service')
  }
})

/**
 * Get all services with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Service list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of services
 *
 * @example
 * const servicesList = await getAllServices({ status: 'confirmed' }, { field: 'scheduledDate', order: 'asc' });
 */
export const getAllServices = cache(
  async (
    filters?: ServiceFilters,
    sort: ServiceSortOptions = { field: 'scheduledDate', order: 'asc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(services.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(services.status, s))))
        } else {
          conditions.push(eq(services.status, filters.status))
        }
      }

      if (filters?.minCost) {
        conditions.push(gte(services.cost, filters.minCost))
      }

      if (filters?.maxCost) {
        conditions.push(lte(services.cost, filters.maxCost))
      }

      if (filters?.provider) {
        conditions.push(like(services.provider, `%${filters.provider}%`))
      }

      if (filters?.serviceType) {
        conditions.push(like(services.serviceType, `%${filters.serviceType}%`))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(services.name, searchTerm),
            like(services.provider, searchTerm),
            like(services.description, searchTerm),
            like(services.serviceType, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = services[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allServices = await db.query.services.findMany({
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

      return allServices
    } catch (error) {
      console.error('Error fetching all services:', error)
      throw new Error('Failed to fetch services')
    }
  }
)

/**
 * Get services for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, service management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of services for the specified event
 *
 * @example
 * const eventServices = await getServicesByEventId('evt_123');
 */
export const getServicesByEventId = cache(
  async (eventId: string, status?: ServiceStatus | ServiceStatus[]) => {
    try {
      const conditions = [eq(services.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(services.status, s))))
        } else {
          conditions.push(eq(services.status, status))
        }
      }

      const eventServices = await db.query.services.findMany({
        where: and(...conditions),
        orderBy: asc(services.scheduledDate),
      })

      return eventServices
    } catch (error) {
      console.error('Error fetching services by event ID:', error)
      throw new Error('Failed to fetch event services')
    }
  }
)

/**
 * Get service statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with service statistics
 *
 * @example
 * const stats = await getServiceStatsByEventId('evt_123');
 * console.log(`Total service cost: ${stats.totalCost}`);
 */
export const getServiceStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventServices = await db.query.services.findMany({
      where: eq(services.eventId, eventId),
    })

    // Calculate statistics
    const stats = {
      totalCount: eventServices.length,
      requestedCount: eventServices.filter((s) => s.status === 'requested').length,
      confirmedCount: eventServices.filter((s) => s.status === 'confirmed').length,
      inProgressCount: eventServices.filter((s) => s.status === 'in_progress').length,
      completedCount: eventServices.filter((s) => s.status === 'completed').length,
      cancelledCount: eventServices.filter((s) => s.status === 'cancelled').length,

      // Calculate total costs
      totalCost: eventServices.reduce((sum, s) => sum + (s.cost || 0), 0),
      confirmedCost: eventServices
        .filter((s) => ['confirmed', 'in_progress', 'completed'].includes(s.status))
        .reduce((sum, s) => sum + (s.cost || 0), 0),
    }

    // Calculate completion rate
    const activeServices = stats.confirmedCount + stats.inProgressCount + stats.completedCount
    stats.completionRate =
      activeServices > 0 ? Math.round((stats.completedCount / activeServices) * 100) : 0

    return stats
  } catch (error) {
    console.error('Error fetching service stats:', error)
    throw new Error('Failed to fetch service statistics')
  }
})

/**
 * Search services by name or provider
 *
 * CACHE: Uses React cache()
 * USE CASE: Search functionality, autocomplete
 *
 * @param query - Search query string
 * @param eventId - Optional event ID to limit search scope
 * @returns Array of matching services
 *
 * @example
 * const results = await searchServices('catering');
 */
export const searchServices = cache(async (query: string, eventId?: string) => {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const searchTerm = `%${query.trim()}%`
    const conditions = [
      or(
        like(services.name, searchTerm),
        like(services.provider, searchTerm),
        like(services.serviceType, searchTerm),
        like(services.description, searchTerm)
      ),
    ]

    if (eventId) {
      conditions.push(eq(services.eventId, eventId))
    }

    const results = await db.query.services.findMany({
      where: and(...conditions),
      orderBy: [asc(services.name)],
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
    console.error('Error searching services:', error)
    throw new Error('Failed to search services')
  }
})

/**
 * Check if service exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Service ID to check
 * @returns Boolean indicating if service exists
 *
 * @example
 * const exists = await serviceExists('srv_123');
 * if (!exists) throw new Error('Service not found');
 */
export const serviceExists = cache(async (id: string): Promise<boolean> => {
  try {
    const service = await db.query.services.findFirst({
      where: eq(services.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!service
  } catch (error) {
    console.error('Error checking service existence:', error)
    return false
  }
})

/**
 * Get upcoming services for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event planning, timeline view
 *
 * @param eventId - Event ID
 * @param days - Number of days to look ahead
 * @returns Array of upcoming services
 *
 * @example
 * const upcomingServices = await getUpcomingServices('evt_123', 7);
 */
export const getUpcomingServices = cache(async (eventId: string, days: number = 7) => {
  try {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    const upcomingServices = await db.query.services.findMany({
      where: and(
        eq(services.eventId, eventId),
        gte(services.scheduledDate, now),
        lte(services.scheduledDate, futureDate),
        or(eq(services.status, 'confirmed'), eq(services.status, 'in_progress'))
      ),
      orderBy: asc(services.scheduledDate),
    })

    return upcomingServices
  } catch (error) {
    console.error('Error fetching upcoming services:', error)
    throw new Error('Failed to fetch upcoming services')
  }
})
