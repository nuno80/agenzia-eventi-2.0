/**
 * DATA ACCESS LAYER: Communications
 *
 * PURPOSE:
 * - Centralize all database queries for communications and email templates
 * - Use React cache() to deduplicate requests
 * - Provide type-safe data fetching
 *
 * PATTERN:
 * - All functions are wrapped in cache() for automatic deduplication
 * - Used in Server Components and Server Actions
 * - Never call directly from Client Components
 *
 * USAGE:
 * import { getCommunicationsByEvent } from '@/lib/dal/communications';
 * const communications = await getCommunicationsByEvent('event_123');
 */

import { and, desc, eq, gte } from 'drizzle-orm'
import { cache } from 'react'
import { communications, db, emailTemplates } from '@/db'

// ============================================================================
// COMMUNICATIONS QUERIES
// ============================================================================

/**
 * Get all communications for a specific event
 * Ordered by sent date (newest first)
 */
export const getCommunicationsByEvent = cache(async (eventId: string) => {
  const eventCommunications = await db.query.communications.findMany({
    where: eq(communications.eventId, eventId),
    orderBy: [desc(communications.sentDate), desc(communications.createdAt)],
  })

  return eventCommunications
})

/**
 * Get single communication by ID
 * Returns null if not found
 */
export const getCommunicationById = cache(async (id: string) => {
  const communication = await db.query.communications.findFirst({
    where: eq(communications.id, id),
  })

  return communication || null
})

/**
 * Get recent communications across all events
 * @param limit - Number of communications to return (default: 10)
 */
export const getRecentCommunications = cache(async (limit: number = 10) => {
  const recent = await db.query.communications.findMany({
    orderBy: [desc(communications.sentDate), desc(communications.createdAt)],
    limit,
    with: {
      event: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  })

  return recent
})

/**
 * Get communications by status
 * @param status - Communication status filter
 */
export const getCommunicationsByStatus = cache(
  async (status: 'draft' | 'scheduled' | 'sent' | 'failed') => {
    const filtered = await db.query.communications.findMany({
      where: eq(communications.status, status),
      orderBy: [desc(communications.sentDate), desc(communications.createdAt)],
      with: {
        event: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
    })

    return filtered
  }
)

/**
 * Get scheduled communications (future sends)
 */
export const getScheduledCommunications = cache(async () => {
  const now = new Date()

  const scheduled = await db.query.communications.findMany({
    where: and(eq(communications.status, 'scheduled'), gte(communications.scheduledDate, now)),
    orderBy: [desc(communications.scheduledDate)],
    with: {
      event: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
  })

  return scheduled
})

// ============================================================================
// COMMUNICATION STATS
// ============================================================================

/**
 * Get communication statistics for an event
 * Returns aggregate metrics
 */
export const getCommunicationStats = cache(async (eventId: string) => {
  const eventCommunications = await db.query.communications.findMany({
    where: eq(communications.eventId, eventId),
  })

  // Calculate stats
  const stats = {
    totalSent: eventCommunications.filter((c) => c.status === 'sent').length,
    totalDraft: eventCommunications.filter((c) => c.status === 'draft').length,
    totalScheduled: eventCommunications.filter((c) => c.status === 'scheduled').length,
    totalFailed: eventCommunications.filter((c) => c.status === 'failed').length,
    totalRecipients: eventCommunications.reduce((sum, c) => sum + (c.recipientCount || 0), 0),
    avgOpenRate:
      eventCommunications.length > 0
        ? eventCommunications.reduce((sum, c) => sum + (c.openRate || 0), 0) /
          eventCommunications.length
        : 0,
    avgClickRate:
      eventCommunications.length > 0
        ? eventCommunications.reduce((sum, c) => sum + (c.clickRate || 0), 0) /
          eventCommunications.length
        : 0,
  }

  return stats
})

/**
 * Get global communication statistics across all events
 */
export const getGlobalCommunicationStats = cache(async () => {
  const allCommunications = await db.select().from(communications)

  const stats = {
    total: allCommunications.length,
    sent: allCommunications.filter((c) => c.status === 'sent').length,
    draft: allCommunications.filter((c) => c.status === 'draft').length,
    scheduled: allCommunications.filter((c) => c.status === 'scheduled').length,
    failed: allCommunications.filter((c) => c.status === 'failed').length,
    totalRecipients: allCommunications.reduce((sum, c) => sum + (c.recipientCount || 0), 0),
    avgOpenRate:
      allCommunications.length > 0
        ? allCommunications.reduce((sum, c) => sum + (c.openRate || 0), 0) /
          allCommunications.length
        : 0,
    avgClickRate:
      allCommunications.length > 0
        ? allCommunications.reduce((sum, c) => sum + (c.clickRate || 0), 0) /
          allCommunications.length
        : 0,
  }

  return stats
})

// ============================================================================
// EMAIL TEMPLATES QUERIES
// ============================================================================

/**
 * Get all email templates
 * Includes both global and event-specific templates
 * Ordered by name
 */
export const getEmailTemplates = cache(async () => {
  const templates = await db.query.emailTemplates.findMany({
    orderBy: [desc(emailTemplates.isDefault), desc(emailTemplates.usageCount)],
  })

  return templates
})

/**
 * Get email templates for a specific event
 * Includes global templates (eventId = null) and event-specific templates
 */
export const getEmailTemplatesByEvent = cache(async (eventId: string) => {
  const allTemplates = await db.query.emailTemplates.findMany({
    orderBy: [desc(emailTemplates.isDefault), desc(emailTemplates.usageCount)],
  })

  // Filter to include global templates and event-specific templates
  const filtered = allTemplates.filter((t) => !t.eventId || t.eventId === eventId)

  return filtered
})

/**
 * Get single email template by ID
 * Returns null if not found
 */
export const getEmailTemplateById = cache(async (id: string) => {
  const template = await db.query.emailTemplates.findFirst({
    where: eq(emailTemplates.id, id),
  })

  return template || null
})

/**
 * Get email templates by category
 */
export const getEmailTemplatesByCategory = cache(
  async (category: 'welcome' | 'reminder' | 'confirmation' | 'update' | 'thank_you' | 'custom') => {
    const templates = await db.query.emailTemplates.findMany({
      where: eq(emailTemplates.category, category),
      orderBy: [desc(emailTemplates.usageCount)],
    })

    return templates
  }
)

/**
 * Get default email templates
 * Returns templates marked as default
 */
export const getDefaultEmailTemplates = cache(async () => {
  const templates = await db.query.emailTemplates.findMany({
    where: eq(emailTemplates.isDefault, true),
    orderBy: [desc(emailTemplates.usageCount)],
  })

  return templates
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get recipient count for a communication type
 * Calculates how many recipients would receive an email based on type
 */
export const getRecipientCount = async (
  eventId: string,
  recipientType: 'all_participants' | 'confirmed_only' | 'speakers' | 'sponsors' | 'custom'
): Promise<number> => {
  switch (recipientType) {
    case 'all_participants': {
      const participants = await db.query.participants.findMany({
        where: eq(communications.eventId, eventId),
      })
      return participants.length
    }
    case 'confirmed_only': {
      const participants = await db.query.participants.findMany({
        where: eq(communications.eventId, eventId),
      })
      return participants.filter((p) => p.registrationStatus === 'confirmed').length
    }
    case 'speakers': {
      const speakers = await db.query.speakers.findMany({
        where: eq(communications.eventId, eventId),
      })
      return speakers.length
    }
    case 'sponsors': {
      const sponsors = await db.query.sponsors.findMany({
        where: eq(communications.eventId, eventId),
      })
      return sponsors.length
    }
    case 'custom':
      return 0 // Custom recipients handled separately
    default:
      return 0
  }
}

/**
 * Get recipient emails for a communication type
 * Returns array of email addresses based on recipient type
 */
export const getRecipientEmails = async (
  eventId: string,
  recipientType: 'all_participants' | 'confirmed_only' | 'speakers' | 'sponsors' | 'custom'
): Promise<string[]> => {
  switch (recipientType) {
    case 'all_participants': {
      const participants = await db.query.participants.findMany({
        where: eq(communications.eventId, eventId),
        columns: {
          email: true,
        },
      })
      return participants.map((p) => p.email)
    }
    case 'confirmed_only': {
      const participants = await db.query.participants.findMany({
        where: eq(communications.eventId, eventId),
      })
      return participants.filter((p) => p.registrationStatus === 'confirmed').map((p) => p.email)
    }
    case 'speakers': {
      const speakers = await db.query.speakers.findMany({
        where: eq(communications.eventId, eventId),
        columns: {
          email: true,
        },
      })
      return speakers.map((s) => s.email)
    }
    case 'sponsors': {
      const sponsors = await db.query.sponsors.findMany({
        where: eq(communications.eventId, eventId),
        columns: {
          email: true,
        },
      })
      return sponsors.map((s) => s.email)
    }
    case 'custom':
      return [] // Custom recipients handled separately
    default:
      return []
  }
}
