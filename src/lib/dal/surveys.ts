/**
 * DATA ACCESS LAYER: Surveys
 *
 * PURPOSE:
 * - Centralize all database queries for surveys
 * - Use React cache() to deduplicate requests
 * - Provide type-safe data fetching
 *
 * PATTERN:
 * - All functions are wrapped in cache() for automatic deduplication
 * - Used in Server Components and Server Actions
 * - Never call directly from Client Components
 *
 * USAGE:
 * import { getSurveyById } from '@/lib/dal/surveys';
 * const survey = await getSurveyById('survey_123');
 */

import { and, asc, count, desc, eq } from 'drizzle-orm'
import { cache } from 'react'
import {
  db,
  type Survey,
  type SurveyResponse,
  surveyAnswers,
  surveyQuestions,
  surveyResponses,
  surveys,
} from '@/db'

// ============================================================================
// BASIC QUERIES
// ============================================================================

/**
 * Get all surveys for an event
 * Ordered by creation date (newest first)
 */
export const getSurveysByEvent = cache(async (eventId: string) => {
  const eventSurveys = await db.query.surveys.findMany({
    where: eq(surveys.eventId, eventId),
    orderBy: [desc(surveys.createdAt)],
  })

  return eventSurveys
})

/**
 * Get single survey by ID
 * Returns null if not found
 */
export const getSurveyById = cache(async (surveyId: string) => {
  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
  })

  return survey || null
})

/**
 * Get survey with all questions
 * Questions ordered by display order
 */
export const getSurveyWithQuestions = cache(async (surveyId: string) => {
  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
    with: {
      questions: {
        orderBy: [asc(surveyQuestions.order)],
      },
    },
  })

  return survey || null
})

/**
 * Get survey with questions and event details
 */
export const getSurveyComplete = cache(async (surveyId: string) => {
  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.id, surveyId),
    with: {
      event: true,
      questions: {
        orderBy: [asc(surveyQuestions.order)],
      },
    },
  })

  return survey || null
})

// ============================================================================
// RESPONSE QUERIES
// ============================================================================

/**
 * Get all responses for a survey
 * Includes participant information
 */
export const getSurveyResponses = cache(async (surveyId: string) => {
  const responses = await db.query.surveyResponses.findMany({
    where: eq(surveyResponses.surveyId, surveyId),
    with: {
      participant: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      answers: {
        with: {
          question: true,
        },
      },
    },
    orderBy: [desc(surveyResponses.submittedAt)],
  })

  return responses
})

/**
 * Get single response with all answers
 */
export const getResponseById = cache(async (responseId: string) => {
  const response = await db.query.surveyResponses.findFirst({
    where: eq(surveyResponses.id, responseId),
    with: {
      participant: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      answers: {
        with: {
          question: true,
        },
        orderBy: [asc(surveyQuestions.order)],
      },
    },
  })

  return response || null
})

/**
 * Get participant's response to a survey
 * Returns null if participant hasn't responded
 */
export const getParticipantResponse = cache(async (surveyId: string, participantId: string) => {
  const response = await db.query.surveyResponses.findFirst({
    where: and(
      eq(surveyResponses.surveyId, surveyId),
      eq(surveyResponses.participantId, participantId)
    ),
    with: {
      answers: {
        with: {
          question: true,
        },
      },
    },
  })

  return response || null
})

/**
 * Check if participant has already responded to survey
 */
export const hasParticipantResponded = cache(
  async (surveyId: string, participantId: string): Promise<boolean> => {
    const response = await db.query.surveyResponses.findFirst({
      where: and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.participantId, participantId)
      ),
      columns: {
        id: true,
      },
    })

    return !!response
  }
)

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get survey statistics
 * Returns response counts and completion rate
 */
export const getSurveyStats = cache(async (surveyId: string) => {
  // Get survey with questions
  const survey = await getSurveyWithQuestions(surveyId)
  if (!survey) return null

  // Get all responses
  const responses = await db.query.surveyResponses.findMany({
    where: eq(surveyResponses.surveyId, surveyId),
  })

  // Get total participants for this event (for response rate calculation)
  const eventParticipants = await db.query.participants.findMany({
    where: eq(db.participants.eventId, survey.eventId),
    columns: {
      id: true,
    },
  })

  const totalResponses = responses.length
  const completeResponses = responses.filter((r) => r.isComplete).length
  const anonymousResponses = responses.filter((r) => !r.participantId).length
  const totalParticipants = eventParticipants.length

  return {
    surveyId: survey.id,
    title: survey.title,
    status: survey.status,
    totalQuestions: survey.questions.length,
    totalResponses,
    completeResponses,
    incompleteResponses: totalResponses - completeResponses,
    anonymousResponses,
    identifiedResponses: totalResponses - anonymousResponses,
    totalParticipants,
    responseRate: totalParticipants > 0 ? (totalResponses / totalParticipants) * 100 : 0,
    completionRate: totalResponses > 0 ? (completeResponses / totalResponses) * 100 : 100,
  }
})

/**
 * Get aggregated answers for a specific question
 * Returns statistics based on question type
 */
export const getQuestionStats = cache(async (questionId: string) => {
  const question = await db.query.surveyQuestions.findFirst({
    where: eq(surveyQuestions.id, questionId),
  })

  if (!question) return null

  // Get all answers for this question
  const answers = await db.query.surveyAnswers.findMany({
    where: eq(surveyAnswers.questionId, questionId),
  })

  const totalAnswers = answers.length

  // Parse based on question type
  switch (question.type) {
    case 'multiple_choice': {
      // Count occurrences of each option
      const options = question.options ? JSON.parse(question.options) : []
      const counts: Record<string, number> = {}

      for (const option of options) {
        counts[option] = 0
      }

      for (const answer of answers) {
        if (counts[answer.answer] !== undefined) {
          counts[answer.answer]++
        }
      }

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalAnswers,
        distribution: Object.entries(counts).map(([option, count]) => ({
          option,
          count,
          percentage: totalAnswers > 0 ? (count / totalAnswers) * 100 : 0,
        })),
      }
    }

    case 'checkboxes': {
      // Count occurrences of each option (answers are JSON arrays)
      const options = question.options ? JSON.parse(question.options) : []
      const counts: Record<string, number> = {}

      for (const option of options) {
        counts[option] = 0
      }

      for (const answer of answers) {
        try {
          const selected = JSON.parse(answer.answer)
          if (Array.isArray(selected)) {
            for (const option of selected) {
              if (counts[option] !== undefined) {
                counts[option]++
              }
            }
          }
        } catch {
          // Skip invalid JSON
        }
      }

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalAnswers,
        distribution: Object.entries(counts).map(([option, count]) => ({
          option,
          count,
          percentage: totalAnswers > 0 ? (count / totalAnswers) * 100 : 0,
        })),
      }
    }

    case 'rating':
    case 'scale': {
      // Calculate average and distribution
      const values = answers.map((a) => Number.parseFloat(a.answer)).filter((v) => !Number.isNaN(v))

      const sum = values.reduce((acc, val) => acc + val, 0)
      const average = values.length > 0 ? sum / values.length : 0

      // Count distribution
      const distribution: Record<number, number> = {}
      for (const value of values) {
        distribution[value] = (distribution[value] || 0) + 1
      }

      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalAnswers,
        average: Number.parseFloat(average.toFixed(2)),
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        distribution: Object.entries(distribution)
          .map(([value, count]) => ({
            value: Number.parseInt(value, 10),
            count,
            percentage: totalAnswers > 0 ? (count / totalAnswers) * 100 : 0,
          }))
          .sort((a, b) => a.value - b.value),
      }
    }

    case 'text':
    case 'textarea': {
      // Return all text responses
      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalAnswers,
        responses: answers.map((a) => ({
          answer: a.answer,
          createdAt: a.createdAt,
        })),
      }
    }

    default:
      return {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalAnswers,
      }
  }
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if survey is accepting responses
 */
export const isSurveyOpen = (survey: Survey): boolean => {
  if (survey.status !== 'active') return false

  // Check if survey has been closed
  if (survey.closedAt && new Date(survey.closedAt) < new Date()) {
    return false
  }

  return true
}

/**
 * Get survey response rate
 */
export const getSurveyResponseRate = cache(async (surveyId: string): Promise<number> => {
  const stats = await getSurveyStats(surveyId)
  return stats?.responseRate || 0
})

/**
 * Get total response count for a survey
 */
export const getSurveyResponseCount = cache(async (surveyId: string): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(surveyResponses)
    .where(eq(surveyResponses.surveyId, surveyId))

  return result[0]?.count || 0
})

// ============================================================================
// TYPE EXPORTS FOR DTOS
// ============================================================================

export type SurveyDTO = Survey
export type SurveyWithQuestionsDTO = NonNullable<Awaited<ReturnType<typeof getSurveyWithQuestions>>>
export type SurveyResponseDTO = SurveyResponse
export type SurveyStatsDTO = NonNullable<Awaited<ReturnType<typeof getSurveyStats>>>
export type QuestionStatsDTO = NonNullable<Awaited<ReturnType<typeof getQuestionStats>>>
