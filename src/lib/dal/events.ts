/**
 * DATA ACCESS LAYER: Events
 *
 * PURPOSE:
 * - Centralize all database queries for events
 * - Use React cache() to deduplicate requests
 * - Provide type-safe data fetching
 *
 * PATTERN:
 * - All functions are wrapped in cache() for automatic deduplication
 * - Used in Server Components and Server Actions
 * - Never call directly from Client Components
 *
 * USAGE:
 * import { getEventById } from '@/lib/dal/events';
 * const event = await getEventById('event_123');
 */

import { and, asc, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/db'
import {
  agenda,
  budgetCategories,
  budgetItems,
  communications,
  deadlines,
  events,
  participants,
  services,
  speakers,
  sponsors,
} from '@/db'

// ============================================================================
// BASIC QUERIES
// ============================================================================

/**
 * Get single event by ID
 * Returns null if not found
 */
export const getEventById = cache(async (id: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, id),
  })

  return event || null
})

/**
 * Get all events
 * Ordered by start date (newest first)
 */
export const getAllEvents = cache(async () => {
  const allEvents = await db.query.events.findMany({
    orderBy: [desc(events.startDate)],
  })

  return allEvents
})

/**
 * Get events by status
 * @param status - Event status filter
 */
export const getEventsByStatus = cache(
  async (status: 'draft' | 'planning' | 'open' | 'ongoing' | 'completed' | 'cancelled') => {
    const filtered = await db.query.events.findMany({
      where: eq(events.status, status),
      orderBy: [desc(events.startDate)],
    })

    return filtered
  }
)

/**
 * Get events by priority
 * @param priority - Priority level filter
 */
export const getEventsByPriority = cache(async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
  const filtered = await db.query.events.findMany({
    where: eq(events.priority, priority),
    orderBy: [asc(events.startDate)],
  })

  return filtered
})

// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * Get event statistics for dashboard overview
 * Returns counts by status and totals
 */
export const getEventStats = cache(async () => {
  const now = new Date()

  // Get all events
  const allEvents = await db.select().from(events)

  // Calculate stats
  const stats = {
    total: allEvents.length,
    draft: allEvents.filter((e) => e.status === 'draft').length,
    planning: allEvents.filter((e) => e.status === 'planning').length,
    open: allEvents.filter((e) => e.status === 'open').length,
    ongoing: allEvents.filter((e) => e.status === 'ongoing').length,
    completed: allEvents.filter((e) => e.status === 'completed').length,
    cancelled: allEvents.filter((e) => e.status === 'cancelled').length,
    upcoming: allEvents.filter(
      (e) => e.startDate && new Date(e.startDate) > now && e.status !== 'cancelled'
    ).length,
    past: allEvents.filter((e) => e.endDate && new Date(e.endDate) < now).length,
  }

  return stats
})

/**
 * Get upcoming events (future events only)
 * @param limit - Number of events to return (default: 5)
 */
export const getUpcomingEvents = cache(async (limit: number = 5) => {
  const now = new Date()

  const upcoming = await db.query.events.findMany({
    where: and(gte(events.startDate, now), eq(events.status, 'open')),
    orderBy: [asc(events.startDate)],
    limit,
  })

  return upcoming
})

/**
 * Get ongoing events (currently happening)
 */
export const getOngoingEvents = cache(async () => {
  const now = new Date()

  const ongoing = await db.query.events.findMany({
    where: and(lte(events.startDate, now), gte(events.endDate, now), eq(events.status, 'ongoing')),
    orderBy: [asc(events.startDate)],
  })

  return ongoing
})

/**
 * Get recent events (last 30 days)
 */
export const getRecentEvents = cache(async () => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recent = await db.query.events.findMany({
    where: gte(events.createdAt, thirtyDaysAgo),
    orderBy: [desc(events.createdAt)],
    limit: 10,
  })

  return recent
})

// ============================================================================
// EVENTS WITH RELATIONS
// ============================================================================

/**
 * Get event with all participants
 * Includes participant count and details
 */
export const getEventWithParticipants = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      participants: {
        orderBy: [asc(participants.lastName)],
      },
    },
  })

  return event || null
})

/**
 * Get event with all speakers
 */
export const getEventWithSpeakers = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      speakers: {
        orderBy: [asc(speakers.lastName)],
      },
    },
  })

  return event || null
})

/**
 * Get event with all sponsors
 */
export const getEventWithSponsors = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      sponsors: {
        orderBy: [desc(sponsors.sponsorshipAmount)],
      },
    },
  })

  return event || null
})

/**
 * Get event with agenda/schedule
 */
export const getEventWithAgenda = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      agenda: {
        orderBy: [asc(agenda.startTime)],
        with: {
          speaker: true,
        },
      },
    },
  })

  return event || null
})

/**
 * Get event with services
 */
export const getEventWithServices = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      services: {
        orderBy: [asc(services.serviceName)],
      },
    },
  })

  return event || null
})

/**
 * Get event with complete budget breakdown
 * Includes categories and all items
 */
export const getEventWithBudget = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      budgetCategories: {
        with: {
          items: {
            orderBy: [desc(budgetItems.actualCost)],
          },
        },
      },
    },
  })

  return event || null
})

/**
 * Get event with all deadlines
 */
export const getEventWithDeadlines = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      deadlines: {
        orderBy: [asc(deadlines.dueDate)],
      },
    },
  })

  return event || null
})

/**
 * Get event with communications history
 */
export const getEventWithCommunications = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      communications: {
        orderBy: [desc(communications.sentDate)],
      },
    },
  })

  return event || null
})

/**
 * Get complete event details with ALL relations
 * Use sparingly - heavy query
 */
export const getEventComplete = cache(async (eventId: string) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      participants: true,
      speakers: true,
      sponsors: true,
      agenda: {
        with: {
          speaker: true,
        },
      },
      services: true,
      budgetCategories: {
        with: {
          items: true,
        },
      },
      deadlines: true,
      communications: true,
    },
  })

  return event || null
})

// ============================================================================
// PARTICIPANT STATS
// ============================================================================

/**
 * Get participant statistics for an event
 */
export const getEventParticipantStats = cache(async (eventId: string) => {
  const allParticipants = await db.query.participants.findMany({
    where: eq(participants.eventId, eventId),
  })

  const stats = {
    total: allParticipants.length,
    confirmed: allParticipants.filter((p) => p.registrationStatus === 'confirmed').length,
    pending: allParticipants.filter((p) => p.registrationStatus === 'pending').length,
    cancelled: allParticipants.filter((p) => p.registrationStatus === 'cancelled').length,
    waitlist: allParticipants.filter((p) => p.registrationStatus === 'waitlist').length,
    checkedIn: allParticipants.filter((p) => p.checkedIn).length,
    paid: allParticipants.filter((p) => p.paymentStatus === 'paid').length,
    pending_payment: allParticipants.filter((p) => p.paymentStatus === 'pending').length,
  }

  return stats
})

// ============================================================================
// BUDGET STATS
// ============================================================================

/**
 * Get budget summary for an event
 */
export const getEventBudgetSummary = cache(async (eventId: string) => {
  const event = await getEventById(eventId)
  if (!event) return null

  const categories = await db.query.budgetCategories.findMany({
    where: eq(budgetCategories.eventId, eventId),
    with: {
      items: true,
    },
  })

  const totalAllocated = categories.reduce((sum, cat) => sum + (cat.allocatedAmount || 0), 0)
  const totalSpent = categories.reduce((sum, cat) => sum + (cat.spentAmount || 0), 0)

  return {
    totalBudget: event.totalBudget || 0,
    totalAllocated,
    totalSpent,
    remaining: (event.totalBudget || 0) - totalSpent,
    percentageUsed: event.totalBudget ? (totalSpent / event.totalBudget) * 100 : 0,
    categories: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      allocated: cat.allocatedAmount,
      spent: cat.spentAmount,
      remaining: (cat.allocatedAmount || 0) - (cat.spentAmount || 0),
      itemCount: cat.items.length,
    })),
  }
})

// ============================================================================
// DEADLINES
// ============================================================================

/**
 * Get urgent deadlines across all events
 * Returns deadlines due in next 7 days
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
      event: true,
    },
  })

  return urgent
})

/**
 * Get overdue deadlines
 */
export const getOverdueDeadlines = cache(async () => {
  const now = new Date()

  const overdue = await db.query.deadlines.findMany({
    where: and(lte(deadlines.dueDate, now), eq(deadlines.status, 'pending')),
    orderBy: [asc(deadlines.dueDate)],
    with: {
      event: true,
    },
  })

  return overdue
})

// ============================================================================
// SEARCH & FILTERS
// ============================================================================

/**
 * Search events by title or description
 * Simple text matching (can be enhanced with full-text search)
 */
export const searchEvents = cache(async (query: string) => {
  const allEvents = await getAllEvents()

  const searchLower = query.toLowerCase()
  const filtered = allEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower)
  )

  return filtered
})

/**
 * Get events within date range
 */
export const getEventsByDateRange = cache(async (startDate: Date, endDate: Date) => {
  const filtered = await db.query.events.findMany({
    where: and(gte(events.startDate, startDate), lte(events.endDate, endDate)),
    orderBy: [asc(events.startDate)],
  })

  return filtered
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if event registration is open
 */
export const isRegistrationOpen = (event: typeof events.$inferSelect): boolean => {
  const now = new Date()

  // Check if registration dates are set
  if (!event.registrationOpenDate || !event.registrationCloseDate) {
    return event.status === 'open'
  }

  // Check date range
  const isInRange =
    new Date(event.registrationOpenDate) <= now && new Date(event.registrationCloseDate) >= now

  // Check capacity
  const hasCapacity =
    !event.maxParticipants || (event.currentParticipants || 0) < event.maxParticipants

  return isInRange && hasCapacity && event.status === 'open'
}

/**
 * Get days until event
 */
export const getDaysUntilEvent = (event: typeof events.$inferSelect): number => {
  const now = new Date()
  const start = new Date(event.startDate)
  const diffTime = start.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Calculate event progress percentage
 * Based on current date vs start/end dates
 */
export const getEventProgress = (event: typeof events.$inferSelect): number => {
  const now = new Date()
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)

  if (now < start) return 0
  if (now > end) return 100

  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()

  return Math.round((elapsed / total) * 100)
}
