/**
 * FILE: src/lib/validations/surveys.ts
 *
 * PURPOSE:
 * - Define Zod validation schemas for survey data
 * - Used in Server Actions for input validation
 * - Ensures type safety and data integrity
 *
 * SCHEMAS:
 * - surveySchema: For creating/updating surveys
 * - questionSchema: For survey questions
 * - responseSchema: For survey responses
 * - answerSchema: For individual answers
 *
 * USAGE:
 * import { surveySchema } from '@/lib/validations/surveys';
 * const validated = surveySchema.parse(data);
 */

import { z } from 'zod'

// ============================================================================
// QUESTION TYPES
// ============================================================================

export const questionTypes = [
  'multiple_choice',
  'checkboxes',
  'text',
  'textarea',
  'rating',
  'scale',
] as const

export const questionTypeSchema = z.enum(questionTypes)

// ============================================================================
// SURVEY STATUS
// ============================================================================

export const surveyStatuses = ['draft', 'active', 'closed'] as const

export const surveyStatusSchema = z.enum(surveyStatuses)

// ============================================================================
// QUESTION SCHEMA
// ============================================================================

/**
 * Survey Question Schema
 * Validates question data based on type
 */
export const questionSchema = z
  .object({
    question: z
      .string()
      .min(5, 'La domanda deve contenere almeno 5 caratteri')
      .max(500, 'La domanda non può superare 500 caratteri'),

    description: z
      .string()
      .max(1000, 'La descrizione non può superare 1000 caratteri')
      .optional()
      .nullable(),

    type: questionTypeSchema,

    // Options for multiple_choice and checkboxes
    // Stored as JSON array
    options: z
      .array(z.string().min(1).max(200))
      .min(2, 'Devi fornire almeno 2 opzioni')
      .max(20, 'Non puoi avere più di 20 opzioni')
      .optional()
      .nullable(),

    required: z.boolean().default(false),

    order: z.number().int().nonnegative(),
  })
  .refine(
    (data) => {
      // Multiple choice and checkboxes must have options
      if (data.type === 'multiple_choice' || data.type === 'checkboxes') {
        return data.options && data.options.length >= 2
      }
      return true
    },
    {
      message: 'Le domande a scelta multipla devono avere almeno 2 opzioni',
      path: ['options'],
    }
  )

export type QuestionInput = z.infer<typeof questionSchema>

// ============================================================================
// SURVEY SCHEMA
// ============================================================================

/**
 * Create/Update Survey Schema
 * Includes survey metadata and questions
 */
export const surveySchema = z.object({
  title: z
    .string()
    .min(3, 'Il titolo deve contenere almeno 3 caratteri')
    .max(200, 'Il titolo non può superare 200 caratteri'),

  description: z
    .string()
    .max(2000, 'La descrizione non può superare 2000 caratteri')
    .optional()
    .nullable(),

  status: surveyStatusSchema.default('draft'),

  allowAnonymous: z.boolean().default(false),

  allowMultipleResponses: z.boolean().default(false),

  showResults: z.boolean().default(false),

  // Questions array
  questions: z
    .array(questionSchema)
    .min(1, 'Il sondaggio deve contenere almeno una domanda')
    .max(50, 'Il sondaggio non può contenere più di 50 domande')
    .optional(),
})

export type SurveyInput = z.infer<typeof surveySchema>

/**
 * Update Survey Schema (partial)
 */
export const updateSurveySchema = surveySchema.partial().extend({
  id: z.string(),
})

export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>

// ============================================================================
// ANSWER SCHEMA
// ============================================================================

/**
 * Individual Answer Schema
 * Validates answer based on question type
 */
export const answerSchema = z.object({
  questionId: z.string(),

  // Answer value - format depends on question type:
  // - text/textarea: plain string
  // - multiple_choice: single option string
  // - checkboxes: JSON array of selected options
  // - rating/scale: numeric string
  answer: z.string().min(1, 'La risposta non può essere vuota'),
})

export type AnswerInput = z.infer<typeof answerSchema>

// ============================================================================
// RESPONSE SCHEMA
// ============================================================================

/**
 * Survey Response Schema
 * Validates complete survey submission
 */
export const responseSchema = z.object({
  surveyId: z.string(),

  participantId: z.string().optional().nullable(),

  answers: z
    .array(answerSchema)
    .min(1, 'Devi rispondere ad almeno una domanda')
    .max(50, 'Troppe risposte'),

  isComplete: z.boolean().default(true),
})

export type ResponseInput = z.infer<typeof responseSchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate answer based on question type
 */
export function validateAnswer(
  answer: string,
  questionType: (typeof questionTypes)[number],
  options?: string[] | null,
  required = false
): { valid: boolean; error?: string } {
  // Check if required
  if (required && !answer) {
    return { valid: false, error: 'Questa domanda è obbligatoria' }
  }

  // Allow empty for non-required
  if (!answer && !required) {
    return { valid: true }
  }

  switch (questionType) {
    case 'text':
      if (answer.length > 500) {
        return { valid: false, error: 'La risposta non può superare 500 caratteri' }
      }
      return { valid: true }

    case 'textarea':
      if (answer.length > 5000) {
        return { valid: false, error: 'La risposta non può superare 5000 caratteri' }
      }
      return { valid: true }

    case 'multiple_choice':
      if (!options || !options.includes(answer)) {
        return { valid: false, error: 'Opzione non valida' }
      }
      return { valid: true }

    case 'checkboxes': {
      try {
        const selected = JSON.parse(answer)
        if (!Array.isArray(selected)) {
          return { valid: false, error: 'Formato risposta non valido' }
        }
        if (selected.length === 0 && required) {
          return { valid: false, error: "Seleziona almeno un'opzione" }
        }
        if (options && !selected.every((opt: string) => options.includes(opt))) {
          return { valid: false, error: 'Opzione non valida selezionata' }
        }
        return { valid: true }
      } catch {
        return { valid: false, error: 'Formato risposta non valido' }
      }
    }

    case 'rating': {
      const value = Number.parseFloat(answer)
      if (Number.isNaN(value) || value < 1 || value > 5) {
        return { valid: false, error: 'Il voto deve essere tra 1 e 5' }
      }
      return { valid: true }
    }

    case 'scale': {
      const value = Number.parseFloat(answer)
      if (Number.isNaN(value) || value < 1 || value > 10) {
        return { valid: false, error: 'Il valore deve essere tra 1 e 10' }
      }
      return { valid: true }
    }

    default:
      return { valid: true }
  }
}

/**
 * Validate complete response against survey questions
 */
export function validateResponse(
  answers: AnswerInput[],
  questions: Array<{
    id: string
    type: (typeof questionTypes)[number]
    options?: string | null
    required: boolean
  }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Check all required questions are answered
  for (const question of questions) {
    if (question.required) {
      const answer = answers.find((a) => a.questionId === question.id)
      if (!answer || !answer.answer) {
        errors[question.id] = 'Questa domanda è obbligatoria'
      }
    }
  }

  // Validate each answer
  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) {
      errors[answer.questionId] = 'Domanda non trovata'
      continue
    }

    const options = question.options ? JSON.parse(question.options) : null
    const validation = validateAnswer(answer.answer, question.type, options, question.required)

    if (!validation.valid && validation.error) {
      errors[answer.questionId] = validation.error
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
