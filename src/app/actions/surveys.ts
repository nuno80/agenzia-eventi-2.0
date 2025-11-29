/**
 * FILE: src/app/actions/surveys.ts
 * PURPOSE: Survey mutations (create, update, delete, publish, submit responses)
 */

'use server'

import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { z } from 'zod'
import {
  db,
  type NewSurvey,
  type NewSurveyAnswer,
  type NewSurveyQuestion,
  type NewSurveyResponse,
  surveyAnswers,
  surveyQuestions,
  surveyResponses,
  surveys,
} from '@/db'
import { getSurveyById, getSurveyWithQuestions, hasParticipantResponded } from '@/lib/dal/surveys'
import {
  responseSchema,
  surveySchema,
  updateSurveySchema,
  validateResponse,
} from '@/lib/validations/surveys'

export type ActionResult = {
  success: boolean
  message: string
  data?: any
  errors?: Record<string, string[]>
}

// ============================================================================
// SURVEY CRUD
// ============================================================================

/**
 * Create a new survey
 */
export async function createSurvey(
  eventId: string,
  formData: FormData | Record<string, any>
): Promise<ActionResult> {
  try {
    let data: Record<string, any>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)
      data.allowAnonymous = formData.has('allowAnonymous')
      data.allowMultipleResponses = formData.has('allowMultipleResponses')
      data.showResults = formData.has('showResults')

      // Parse questions if provided as JSON string
      if (typeof data.questions === 'string') {
        try {
          data.questions = JSON.parse(data.questions)
        } catch {
          data.questions = []
        }
      }
    } else {
      data = { ...formData }
    }

    // Validate survey data
    const validated = surveySchema.parse(data)

    // Create survey
    const [newSurvey] = await db
      .insert(surveys)
      .values({
        eventId,
        title: validated.title,
        description: validated.description,
        status: validated.status,
        allowAnonymous: validated.allowAnonymous,
        allowMultipleResponses: validated.allowMultipleResponses,
        showResults: validated.showResults,
      } as NewSurvey)
      .returning()

    // Create questions if provided
    if (validated.questions && validated.questions.length > 0) {
      const questionsToInsert = validated.questions.map((q, index) => ({
        surveyId: newSurvey.id,
        question: q.question,
        description: q.description,
        type: q.type,
        options: q.options ? JSON.stringify(q.options) : null,
        required: q.required,
        order: q.order ?? index,
      })) as NewSurveyQuestion[]

      await db.insert(surveyQuestions).values(questionsToInsert)
    }

    // Invalidate cache
    updateTag(`surveys-${eventId}`)

    return {
      success: true,
      message: 'Sondaggio creato con successo',
      data: { id: newSurvey.id },
    }
  } catch (error) {
    console.error('Create survey error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: 'Errore durante la creazione del sondaggio' }
  }
}

/**
 * Update an existing survey
 */
export async function updateSurvey(
  surveyId: string,
  formData: FormData | Record<string, any>
): Promise<ActionResult> {
  try {
    let data: Record<string, any>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)
      data.allowAnonymous = formData.has('allowAnonymous')
      data.allowMultipleResponses = formData.has('allowMultipleResponses')
      data.showResults = formData.has('showResults')

      if (typeof data.questions === 'string') {
        try {
          data.questions = JSON.parse(data.questions)
        } catch {
          data.questions = []
        }
      }
    } else {
      data = { ...formData }
    }

    // Get existing survey
    const existingSurvey = await getSurveyById(surveyId)
    if (!existingSurvey) {
      return { success: false, message: 'Sondaggio non trovato' }
    }

    // Validate update data
    const validated = updateSurveySchema.parse({ ...data, id: surveyId })

    // Update survey
    await db
      .update(surveys)
      .set({
        title: validated.title,
        description: validated.description,
        status: validated.status,
        allowAnonymous: validated.allowAnonymous,
        allowMultipleResponses: validated.allowMultipleResponses,
        showResults: validated.showResults,
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, surveyId))

    // Update questions if provided
    if (validated.questions && validated.questions.length > 0) {
      // Delete existing questions
      await db.delete(surveyQuestions).where(eq(surveyQuestions.surveyId, surveyId))

      // Insert new questions
      const questionsToInsert = validated.questions.map((q, index) => ({
        surveyId,
        question: q.question,
        description: q.description,
        type: q.type,
        options: q.options ? JSON.stringify(q.options) : null,
        required: q.required,
        order: q.order ?? index,
      })) as NewSurveyQuestion[]

      await db.insert(surveyQuestions).values(questionsToInsert)
    }

    // Invalidate cache
    updateTag(`surveys-${existingSurvey.eventId}`)
    updateTag(`survey-${surveyId}`)

    return { success: true, message: 'Sondaggio aggiornato con successo' }
  } catch (error) {
    console.error('Update survey error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'aggiornamento del sondaggio" }
  }
}

/**
 * Delete a survey and all its data
 */
export async function deleteSurvey(surveyId: string): Promise<ActionResult> {
  try {
    const survey = await getSurveyById(surveyId)
    if (!survey) {
      return { success: false, message: 'Sondaggio non trovato' }
    }

    // Delete survey (cascade will delete questions, responses, answers)
    await db.delete(surveys).where(eq(surveys.id, surveyId))

    // Invalidate cache
    updateTag(`surveys-${survey.eventId}`)

    return { success: true, message: 'Sondaggio eliminato con successo' }
  } catch (error) {
    console.error('Delete survey error:', error)
    return { success: false, message: "Errore durante l'eliminazione del sondaggio" }
  }
}

// ============================================================================
// SURVEY STATUS MANAGEMENT
// ============================================================================

/**
 * Publish a survey (change status to active)
 */
export async function publishSurvey(surveyId: string): Promise<ActionResult> {
  try {
    const survey = await getSurveyWithQuestions(surveyId)
    if (!survey) {
      return { success: false, message: 'Sondaggio non trovato' }
    }

    // Validate survey has questions
    if (!survey.questions || survey.questions.length === 0) {
      return {
        success: false,
        message: 'Il sondaggio deve contenere almeno una domanda prima di essere pubblicato',
      }
    }

    await db
      .update(surveys)
      .set({
        status: 'active',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, surveyId))

    updateTag(`surveys-${survey.eventId}`)
    updateTag(`survey-${surveyId}`)

    return { success: true, message: 'Sondaggio pubblicato con successo' }
  } catch (error) {
    console.error('Publish survey error:', error)
    return { success: false, message: 'Errore durante la pubblicazione del sondaggio' }
  }
}

/**
 * Close a survey (change status to closed)
 */
export async function closeSurvey(surveyId: string): Promise<ActionResult> {
  try {
    const survey = await getSurveyById(surveyId)
    if (!survey) {
      return { success: false, message: 'Sondaggio non trovato' }
    }

    await db
      .update(surveys)
      .set({
        status: 'closed',
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, surveyId))

    updateTag(`surveys-${survey.eventId}`)
    updateTag(`survey-${surveyId}`)

    return { success: true, message: 'Sondaggio chiuso con successo' }
  } catch (error) {
    console.error('Close survey error:', error)
    return { success: false, message: 'Errore durante la chiusura del sondaggio' }
  }
}

/**
 * Reopen a survey (change status back to active)
 */
export async function reopenSurvey(surveyId: string): Promise<ActionResult> {
  try {
    const survey = await getSurveyById(surveyId)
    if (!survey) {
      return { success: false, message: 'Sondaggio non trovato' }
    }

    await db
      .update(surveys)
      .set({
        status: 'active',
        closedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(surveys.id, surveyId))

    updateTag(`surveys-${survey.eventId}`)
    updateTag(`survey-${surveyId}`)

    return { success: true, message: 'Sondaggio riaperto con successo' }
  } catch (error) {
    console.error('Reopen survey error:', error)
    return { success: false, message: 'Errore durante la riapertura del sondaggio' }
  }
}

// ============================================================================
// RESPONSE SUBMISSION
// ============================================================================

/**
 * Submit a survey response
 */
export async function submitResponse(
  data: Record<string, any>,
  ipAddress?: string
): Promise<ActionResult> {
  try {
    // Validate response data
    const validated = responseSchema.parse(data)

    // Get survey with questions
    const survey = await getSurveyWithQuestions(validated.surveyId)
    if (!survey) {
      return { success: false, message: 'Sondaggio non trovato' }
    }

    // Check if survey is active
    if (survey.status !== 'active') {
      return { success: false, message: 'Il sondaggio non è attualmente attivo' }
    }

    // Check if survey is closed
    if (survey.closedAt && new Date(survey.closedAt) < new Date()) {
      return { success: false, message: 'Il sondaggio è chiuso' }
    }

    // Check if participant has already responded (if not allowing multiple responses)
    if (validated.participantId && !survey.allowMultipleResponses) {
      const hasResponded = await hasParticipantResponded(
        validated.surveyId,
        validated.participantId
      )
      if (hasResponded) {
        return { success: false, message: 'Hai già risposto a questo sondaggio' }
      }
    }

    // Validate answers against questions
    const validation = validateResponse(validated.answers, survey.questions)
    if (!validation.valid) {
      // Convert errors from Record<string, string> to Record<string, string[]>
      const formattedErrors: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(validation.errors)) {
        formattedErrors[key] = [value]
      }
      return {
        success: false,
        message: 'Alcune risposte non sono valide',
        errors: formattedErrors,
      }
    }

    // Create response
    const [newResponse] = await db
      .insert(surveyResponses)
      .values({
        surveyId: validated.surveyId,
        participantId: validated.participantId,
        isComplete: validated.isComplete,
        ipAddress: ipAddress || null,
      } as NewSurveyResponse)
      .returning()

    // Create answers
    const answersToInsert = validated.answers.map(
      (a) =>
        ({
          responseId: newResponse.id,
          questionId: a.questionId,
          answer: a.answer,
        }) as NewSurveyAnswer
    )

    await db.insert(surveyAnswers).values(answersToInsert)

    // Invalidate cache
    updateTag(`survey-responses-${validated.surveyId}`)

    return {
      success: true,
      message: 'Risposta inviata con successo',
      data: { responseId: newResponse.id },
    }
  } catch (error) {
    console.error('Submit response error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'invio della risposta" }
  }
}

// ============================================================================
// UTILITY ACTIONS
// ============================================================================

/**
 * Duplicate a survey
 */
export async function duplicateSurvey(surveyId: string): Promise<ActionResult> {
  try {
    const originalSurvey = await getSurveyWithQuestions(surveyId)
    if (!originalSurvey) {
      return { success: false, message: 'Sondaggio non trovato' }
    }

    // Create new survey
    const [newSurvey] = await db
      .insert(surveys)
      .values({
        eventId: originalSurvey.eventId,
        title: `${originalSurvey.title} (Copia)`,
        description: originalSurvey.description,
        status: 'draft',
        allowAnonymous: originalSurvey.allowAnonymous,
        allowMultipleResponses: originalSurvey.allowMultipleResponses,
        showResults: originalSurvey.showResults,
      } as NewSurvey)
      .returning()

    // Duplicate questions
    if (originalSurvey.questions && originalSurvey.questions.length > 0) {
      const questionsToInsert = originalSurvey.questions.map(
        (q) =>
          ({
            surveyId: newSurvey.id,
            question: q.question,
            description: q.description,
            type: q.type,
            options: q.options,
            required: q.required,
            order: q.order,
          }) as NewSurveyQuestion
      )

      await db.insert(surveyQuestions).values(questionsToInsert)
    }

    updateTag(`surveys-${originalSurvey.eventId}`)

    return {
      success: true,
      message: 'Sondaggio duplicato con successo',
      data: { id: newSurvey.id },
    }
  } catch (error) {
    console.error('Duplicate survey error:', error)
    return { success: false, message: 'Errore durante la duplicazione del sondaggio' }
  }
}

/**
 * Delete a response
 */
export async function deleteResponse(responseId: string): Promise<ActionResult> {
  try {
    // Get response to find survey ID for cache invalidation
    const response = await db.query.surveyResponses.findFirst({
      where: eq(surveyResponses.id, responseId),
      columns: {
        surveyId: true,
      },
    })

    if (!response) {
      return { success: false, message: 'Risposta non trovata' }
    }

    // Delete response (cascade will delete answers)
    await db.delete(surveyResponses).where(eq(surveyResponses.id, responseId))

    updateTag(`survey-responses-${response.surveyId}`)

    return { success: true, message: 'Risposta eliminata con successo' }
  } catch (error) {
    console.error('Delete response error:', error)
    return { success: false, message: "Errore durante l'eliminazione della risposta" }
  }
}
