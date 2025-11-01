/**
 * FILE: src/lib/dal/participants.ts
 *
 * DATA ACCESS LAYER: Participants
 *
 * PURPOSE:
 * - Centralize all database queries for participants
 * - Use React cache() to deduplicate requests
 * - Provide type-safe data fetching
 *
 * PATTERN:
 * - All functions wrapped in cache() for automatic deduplication
 * - Used in Server Components and Server Actions
 * - Never call directly from Client Components
 *
 * USAGE:
 * import { getParticipantsByEvent } from '@/lib/dal/participants';
 * const participants = await getParticipantsByEvent('event_123');
 */

import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/lib/db'
import { events, participants } from '@/lib/db/schema'

// ============================================================================
// BASIC QUERIES
// ============================================================================

/**
 * Get single participant by ID
 */
export const getParticipantById = cache(async (id: string) => {
  const participant = await db.query.participants.findFirst({
    where: eq(participants.id, id),
    with: {
      event: true,
    },
  })

  return participant || null
})

/**
 * Get all participants for a specific event
 * Ordered by last name
 */
export const getParticipantsByEvent = cache(async (eventId: string) => {
  const eventParticipants = await db.query.participants.findMany({
    where: eq(participants.eventId, eventId),
    orderBy: [asc(participants.lastName), asc(participants.firstName)],
  })

  return eventParticipants
})

/**
 * Get all participants across all events
 */
export const getAllParticipants = cache(async () => {
  const allParticipants = await db.query.participants.findMany({
    orderBy: [desc(participants.registrationDate)],
    with: {
      event: true,
    },
  })

  return allParticipants
})

// ============================================================================
// FILTERED QUERIES
// ============================================================================

/**
 * Get participants by registration status
 */
export const getParticipantsByStatus = cache(
  async (eventId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist') => {
    const filtered = await db.query.participants.findMany({
      where: and(eq(participants.eventId, eventId), eq(participants.registrationStatus, status)),
      orderBy: [asc(participants.lastName)],
    })

    return filtered
  }
)

/**
 * Get participants by payment status
 */
export const getParticipantsByPaymentStatus = cache(
  async (eventId: string, paymentStatus: 'pending' | 'paid' | 'refunded' | 'free') => {
    const filtered = await db.query.participants.findMany({
      where: and(eq(participants.eventId, eventId), eq(participants.paymentStatus, paymentStatus)),
      orderBy: [asc(participants.lastName)],
    })

    return filtered
  }
)

/**
 * Get checked-in participants
 */
export const getCheckedInParticipants = cache(async (eventId: string) => {
  const checkedIn = await db.query.participants.findMany({
    where: and(eq(participants.eventId, eventId), eq(participants.checkedIn, true)),
    orderBy: [desc(participants.checkinTime)],
  })

  return checkedIn
})

/**
 * Get participants who haven't checked in yet
 */
export const getPendingCheckinParticipants = cache(async (eventId: string) => {
  const pending = await db.query.participants.findMany({
    where: and(
      eq(participants.eventId, eventId),
      eq(participants.checkedIn, false),
      eq(participants.registrationStatus, 'confirmed')
    ),
    orderBy: [asc(participants.lastName)],
  })

  return pending
})

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get participant statistics for an event
 */
export const getParticipantStats = cache(async (eventId: string) => {
  const allParticipants = await getParticipantsByEvent(eventId)

  const stats = {
    total: allParticipants.length,
    confirmed: allParticipants.filter((p) => p.registrationStatus === 'confirmed').length,
    pending: allParticipants.filter((p) => p.registrationStatus === 'pending').length,
    cancelled: allParticipants.filter((p) => p.registrationStatus === 'cancelled').length,
    waitlist: allParticipants.filter((p) => p.registrationStatus === 'waitlist').length,
    checkedIn: allParticipants.filter((p) => p.checkedIn).length,
    paid: allParticipants.filter((p) => p.paymentStatus === 'paid').length,
    pendingPayment: allParticipants.filter((p) => p.paymentStatus === 'pending').length,
    free: allParticipants.filter((p) => p.paymentStatus === 'free').length,
    refunded: allParticipants.filter((p) => p.paymentStatus === 'refunded').length,
  }

  // Calculate revenue
  const totalRevenue = allParticipants
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + (p.ticketPrice || 0), 0)

  const pendingRevenue = allParticipants
    .filter((p) => p.paymentStatus === 'pending')
    .reduce((sum, p) => sum + (p.ticketPrice || 0), 0)

  return {
    ...stats,
    totalRevenue,
    pendingRevenue,
    totalPotentialRevenue: totalRevenue + pendingRevenue,
  }
})

/**
 * Get participants by ticket type
 */
export const getParticipantsByTicketType = cache(async (eventId: string) => {
  const allParticipants = await getParticipantsByEvent(eventId)

  // Group by ticket type
  const byTicketType = allParticipants.reduce(
    (acc, p) => {
      const type = p.ticketType || 'Nessuno'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(p)
      return acc
    },
    {} as Record<string, typeof allParticipants>
  )

  return byTicketType
})

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search participants by name or email
 */
export const searchParticipants = cache(async (eventId: string, query: string) => {
  const allParticipants = await getParticipantsByEvent(eventId)

  const searchLower = query.toLowerCase()
  const filtered = allParticipants.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchLower) ||
      p.lastName.toLowerCase().includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower) ||
      p.company?.toLowerCase().includes(searchLower)
  )

  return filtered
})

// ============================================================================
// AGGREGATIONS
// ============================================================================

/**
 * Get company distribution
 * Returns list of companies with participant counts
 */
export const getCompanyDistribution = cache(async (eventId: string) => {
  const allParticipants = await getParticipantsByEvent(eventId)

  const companies = allParticipants.reduce(
    (acc, p) => {
      const company = p.company || 'Nessuna azienda'
      acc[company] = (acc[company] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Convert to array and sort by count
  return Object.entries(companies)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
})

/**
 * Get dietary requirements summary
 */
export const getDietaryRequirementsSummary = cache(async (eventId: string) => {
  const allParticipants = await getParticipantsByEvent(eventId)

  const withRequirements = allParticipants.filter((p) => p.dietaryRequirements)

  return {
    total: withRequirements.length,
    requirements: withRequirements.map((p) => ({
      name: `${p.firstName} ${p.lastName}`,
      requirement: p.dietaryRequirements,
    })),
  }
})

/**
 * Get special needs summary
 */
export const getSpecialNeedsSummary = cache(async (eventId: string) => {
  const allParticipants = await getParticipantsByEvent(eventId)

  const withNeeds = allParticipants.filter((p) => p.specialNeeds)

  return {
    total: withNeeds.length,
    needs: withNeeds.map((p) => ({
      name: `${p.firstName} ${p.lastName}`,
      need: p.specialNeeds,
    })),
  }
})

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

/**
 * Get recently registered participants
 */
export const getRecentRegistrations = cache(async (eventId: string, limit: number = 10) => {
  const recent = await db.query.participants.findMany({
    where: eq(participants.eventId, eventId),
    orderBy: [desc(participants.registrationDate)],
    limit,
  })

  return recent
})

/**
 * Get recently checked-in participants
 */
export const getRecentCheckins = cache(async (eventId: string, limit: number = 10) => {
  const recent = await db.query.participants.findMany({
    where: and(eq(participants.eventId, eventId), eq(participants.checkedIn, true)),
    orderBy: [desc(participants.checkinTime)],
    limit,
  })

  return recent
})
