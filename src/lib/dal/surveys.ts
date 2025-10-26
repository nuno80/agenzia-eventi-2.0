// ============================================================================
// DATA ACCESS LAYER - SURVEYS
// ============================================================================
// FILE: src/lib/dal/surveys.ts
//
// PURPOSE: Centralizes all database queries related to event surveys
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getSurveyById } from '@/lib/dal/surveys';
//   const survey = await getSurveyById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { surveys, surveyResponses, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql, count } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Survey status enum
 * Represents the status of a survey
 */
export type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived'

/**
 * Survey type enum
 * Represents the type of survey
 */
export type SurveyType = 'feedback' | 'satisfaction' | 'registration' | 'poll' | 'quiz'

/**
 * Filter options for survey queries
 */
export interface SurveyFilters {
  eventId?: string
  status?: SurveyStatus | SurveyStatus[]
  type?: SurveyType | SurveyType[]
  startDateFrom?: Date
  startDateTo?: Date
  endDateFrom?: Date
  endDateTo?: Date
  searchQuery?: string
}

/**
 * Sort options for survey queries
 */
export interface SurveySortOptions {
  field: 'title' | 'startDate' | 'endDate' | 'status' | 'type' | 'responseCount'
  order: 'asc' | 'desc'
}

/**
 * Filter options for survey response queries
 */
export interface SurveyResponseFilters {
  surveyId?: string
  completedFrom?: Date
  completedTo?: Date
  searchQuery?: string
}

/**
 * Sort options for survey response queries
 */
export interface SurveyResponseSortOptions {
  field: 'completedAt' | 'respondentName' | 'respondentEmail'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS (Queries)
// ============================================================================

/**
 * Get a single survey by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Survey detail pages, forms that need survey info
 *
 * @param id - Survey ID
 * @returns Survey object or null if not found
 *
 * @example
 * const survey = await getSurveyById('surv_123');
 * if (!survey) return notFound();
 */
export const getSurveyById = cache(async (id: string) => {
  try {
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, id),
      with: {
        event: true,
      },
    })

    return survey || null
  } catch (error) {
    console.error('Error fetching survey by ID:', error)
    throw new Error('Failed to fetch survey')
  }
})

/**
 * Get all surveys with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Survey list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of surveys
 *
 * @example
 * const surveysList = await getAllSurveys({ status: 'active' }, { field: 'startDate', order: 'desc' });
 */
export const getAllSurveys = cache(
  async (
    filters?: SurveyFilters,
    sort: SurveySortOptions = { field: 'startDate', order: 'desc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(surveys.eventId, filters.eventId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(surveys.status, s))))
        } else {
          conditions.push(eq(surveys.status, filters.status))
        }
      }

      if (filters?.type) {
        if (Array.isArray(filters.type)) {
          conditions.push(or(...filters.type.map((t) => eq(surveys.type, t))))
        } else {
          conditions.push(eq(surveys.type, filters.type))
        }
      }

      if (filters?.startDateFrom) {
        conditions.push(gte(surveys.startDate, filters.startDateFrom))
      }

      if (filters?.startDateTo) {
        conditions.push(lte(surveys.startDate, filters.startDateTo))
      }

      if (filters?.endDateFrom) {
        conditions.push(gte(surveys.endDate, filters.endDateFrom))
      }

      if (filters?.endDateTo) {
        conditions.push(lte(surveys.endDate, filters.endDateTo))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(or(like(surveys.title, searchTerm), like(surveys.description, searchTerm)))
      }

      // Build order by
      const orderByField = surveys[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allSurveys = await db.query.surveys.findMany({
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

      return allSurveys
    } catch (error) {
      console.error('Error fetching all surveys:', error)
      throw new Error('Failed to fetch surveys')
    }
  }
)

/**
 * Get surveys for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, survey management
 *
 * @param eventId - Event ID
 * @param status - Optional status filter
 * @returns Array of surveys for the specified event
 *
 * @example
 * const eventSurveys = await getSurveysByEventId('evt_123');
 */
export const getSurveysByEventId = cache(
  async (eventId: string, status?: SurveyStatus | SurveyStatus[]) => {
    try {
      const conditions = [eq(surveys.eventId, eventId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(surveys.status, s))))
        } else {
          conditions.push(eq(surveys.status, status))
        }
      }

      const eventSurveys = await db.query.surveys.findMany({
        where: and(...conditions),
        orderBy: desc(surveys.startDate),
      })

      return eventSurveys
    } catch (error) {
      console.error('Error fetching surveys by event ID:', error)
      throw new Error('Failed to fetch event surveys')
    }
  }
)

/**
 * Get survey statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, analytics
 *
 * @param eventId - Event ID
 * @returns Object with survey statistics
 *
 * @example
 * const stats = await getSurveyStatsByEventId('evt_123');
 * console.log(`Total surveys: ${stats.totalCount}, Response rate: ${stats.responseRate}%`);
 */
export const getSurveyStatsByEventId = cache(async (eventId: string) => {
  try {
    const eventSurveys = await db.query.surveys.findMany({
      where: eq(surveys.eventId, eventId),
    })

    // Get all survey IDs for this event
    const surveyIds = eventSurveys.map((s) => s.id)

    // Get response counts for each survey
    const responseCounts = {}
    if (surveyIds.length > 0) {
      const responses = await db.query.surveyResponses.findMany({
        where: or(...surveyIds.map((id) => eq(surveyResponses.surveyId, id))),
      })

      // Count responses per survey
      responses.forEach((response) => {
        responseCounts[response.surveyId] = (responseCounts[response.surveyId] || 0) + 1
      })
    }

    // Calculate statistics
    const stats = {
      totalCount: eventSurveys.length,
      draftCount: eventSurveys.filter((s) => s.status === 'draft').length,
      activeCount: eventSurveys.filter((s) => s.status === 'active').length,
      closedCount: eventSurveys.filter((s) => s.status === 'closed').length,
      archivedCount: eventSurveys.filter((s) => s.status === 'archived').length,

      // Count by type
      feedbackCount: eventSurveys.filter((s) => s.type === 'feedback').length,
      satisfactionCount: eventSurveys.filter((s) => s.type === 'satisfaction').length,
      registrationCount: eventSurveys.filter((s) => s.type === 'registration').length,
      pollCount: eventSurveys.filter((s) => s.type === 'poll').length,
      quizCount: eventSurveys.filter((s) => s.type === 'quiz').length,

      // Response metrics
      totalResponses: Object.values(responseCounts).reduce(
        (sum: number, count: number) => sum + count,
        0
      ),
      averageResponsesPerSurvey:
        eventSurveys.length > 0
          ? Math.round(
              Object.values(responseCounts).reduce((sum: number, count: number) => sum + count, 0) /
                eventSurveys.length
            )
          : 0,
      responseRate: 0, // Will be calculated below if possible
    }

    // Calculate response rate if we have target counts
    const totalTargetCount = eventSurveys.reduce((sum, s) => sum + (s.targetResponseCount || 0), 0)
    if (totalTargetCount > 0) {
      stats.responseRate = Math.round((stats.totalResponses / totalTargetCount) * 100)
    }

    return stats
  } catch (error) {
    console.error('Error fetching survey stats:', error)
    throw new Error('Failed to fetch survey statistics')
  }
})

/**
 * Get active surveys
 *
 * CACHE: Uses React cache()
 * USE CASE: Survey collection, active surveys list
 *
 * @param eventId - Event ID
 * @returns Array of active surveys
 *
 * @example
 * const activeSurveys = await getActiveSurveys('evt_123');
 */
export const getActiveSurveys = cache(async (eventId: string) => {
  try {
    const now = new Date()

    const activeSurveys = await db.query.surveys.findMany({
      where: and(
        eq(surveys.eventId, eventId),
        eq(surveys.status, 'active'),
        lte(surveys.startDate, now),
        or(eq(surveys.endDate, null), gte(surveys.endDate, now))
      ),
      orderBy: desc(surveys.startDate),
    })

    return activeSurveys
  } catch (error) {
    console.error('Error fetching active surveys:', error)
    throw new Error('Failed to fetch active surveys')
  }
})

/**
 * Check if survey exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Survey ID to check
 * @returns Boolean indicating if survey exists
 *
 * @example
 * const exists = await surveyExists('surv_123');
 * if (!exists) throw new Error('Survey not found');
 */
export const surveyExists = cache(async (id: string): Promise<boolean> => {
  try {
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!survey
  } catch (error) {
    console.error('Error checking survey existence:', error)
    return false
  }
})

/**
 * Get surveys by type
 *
 * CACHE: Uses React cache()
 * USE CASE: Type-specific views, filtering
 *
 * @param eventId - Event ID
 * @param type - Survey type to filter by
 * @returns Array of surveys of the specified type
 *
 * @example
 * const feedbackSurveys = await getSurveysByType('evt_123', 'feedback');
 */
export const getSurveysByType = cache(async (eventId: string, type: SurveyType) => {
  try {
    const typeSurveys = await db.query.surveys.findMany({
      where: and(eq(surveys.eventId, eventId), eq(surveys.type, type)),
      orderBy: desc(surveys.startDate),
    })

    return typeSurveys
  } catch (error) {
    console.error('Error fetching surveys by type:', error)
    throw new Error('Failed to fetch type surveys')
  }
})

/**
 * Get a survey with its responses
 *
 * CACHE: Uses React cache()
 * USE CASE: Survey results page, analysis
 *
 * @param id - Survey ID
 * @returns Survey with responses
 *
 * @example
 * const surveyWithResponses = await getSurveyWithResponses('surv_123');
 */
export const getSurveyWithResponses = cache(async (id: string) => {
  try {
    const survey = await db.query.surveys.findFirst({
      where: eq(surveys.id, id),
      with: {
        responses: {
          orderBy: desc(surveyResponses.completedAt),
        },
        event: true,
      },
    })

    return survey
  } catch (error) {
    console.error('Error fetching survey with responses:', error)
    throw new Error('Failed to fetch survey with responses')
  }
})

/**
 * Get a single survey response by ID
 *
 * CACHE: Uses React cache()
 * USE CASE: Response detail view
 *
 * @param id - Response ID
 * @returns Survey response or null if not found
 *
 * @example
 * const response = await getSurveyResponseById('resp_123');
 */
export const getSurveyResponseById = cache(async (id: string) => {
  try {
    const response = await db.query.surveyResponses.findFirst({
      where: eq(surveyResponses.id, id),
      with: {
        survey: true,
      },
    })

    return response || null
  } catch (error) {
    console.error('Error fetching survey response by ID:', error)
    throw new Error('Failed to fetch survey response')
  }
})

/**
 * Get all responses for a survey
 *
 * CACHE: Uses React cache()
 * USE CASE: Survey results, data export
 *
 * @param surveyId - Survey ID
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of survey responses
 *
 * @example
 * const responses = await getSurveyResponses('surv_123');
 */
export const getSurveyResponses = cache(
  async (
    surveyId: string,
    filters?: SurveyResponseFilters,
    sort: SurveyResponseSortOptions = { field: 'completedAt', order: 'desc' }
  ) => {
    try {
      // Build where conditions
      const conditions = [eq(surveyResponses.surveyId, surveyId)]

      if (filters?.completedFrom) {
        conditions.push(gte(surveyResponses.completedAt, filters.completedFrom))
      }

      if (filters?.completedTo) {
        conditions.push(lte(surveyResponses.completedAt, filters.completedTo))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(surveyResponses.respondentName, searchTerm),
            like(surveyResponses.respondentEmail, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = surveyResponses[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const responses = await db.query.surveyResponses.findMany({
        where: and(...conditions),
        orderBy: orderFn(orderByField),
      })

      return responses
    } catch (error) {
      console.error('Error fetching survey responses:', error)
      throw new Error('Failed to fetch survey responses')
    }
  }
)

/**
 * Get response count for a survey
 *
 * CACHE: Uses React cache()
 * USE CASE: Progress tracking, dashboard
 *
 * @param surveyId - Survey ID
 * @returns Number of responses
 *
 * @example
 * const responseCount = await getSurveyResponseCount('surv_123');
 */
export const getSurveyResponseCount = cache(async (surveyId: string): Promise<number> => {
  try {
    const result = await db
      .select({ count: count() })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))

    return result[0]?.count || 0
  } catch (error) {
    console.error('Error counting survey responses:', error)
    return 0
  }
})
