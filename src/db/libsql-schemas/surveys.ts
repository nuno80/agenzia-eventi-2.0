// ============================================================================
// DRIZZLE ORM SCHEMA - SURVEYS TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/surveys.ts
//
// PURPOSE: Defines the database schema for event surveys and responses
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// SURVEYS TABLE
// ============================================================================

export const surveys = sqliteTable('surveys', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Survey information
  title: text('title').notNull(),
  description: text('description'),
  type: text('type', {
    enum: ['pre_event', 'post_event', 'feedback', 'registration', 'custom'],
  }).notNull(),

  // Status and scheduling
  status: text('status', {
    enum: ['draft', 'active', 'closed', 'archived'],
  })
    .default('draft')
    .notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),

  // Configuration
  isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false).notNull(),
  allowMultipleResponses: integer('allow_multiple_responses', { mode: 'boolean' })
    .default(false)
    .notNull(),
  questions: text('questions').notNull(), // JSON string of questions

  // Statistics
  responseCount: integer('response_count').default(0),
  completionRate: real('completion_rate').default(0),
  averageRating: real('average_rating'),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// SURVEY RESPONSES TABLE
// ============================================================================

export const surveyResponses = sqliteTable('survey_responses', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to surveys
  surveyId: text('survey_id')
    .notNull()
    .references(() => surveys.id, { onDelete: 'cascade' }),

  // Respondent information (optional for anonymous surveys)
  respondentId: text('respondent_id'),
  respondentType: text('respondent_type', {
    enum: ['participant', 'speaker', 'sponsor', 'staff', 'other'],
  }),
  respondentEmail: text('respondent_email'),

  // Response data
  answers: text('answers').notNull(), // JSON string of answers
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),

  // Additional information
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const surveysEventIdIndex = index('surveys_event_id_idx').on(surveys.eventId)
export const surveysStatusIndex = index('surveys_status_idx').on(surveys.status)
export const surveysTypeIndex = index('surveys_type_idx').on(surveys.type)

export const surveyResponsesSurveyIdIndex = index('survey_responses_survey_id_idx').on(
  surveyResponses.surveyId
)
export const surveyResponsesRespondentIdIndex = index('survey_responses_respondent_id_idx').on(
  surveyResponses.respondentId
)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Survey = typeof surveys.$inferSelect
export type NewSurvey = typeof surveys.$inferInsert

export type SurveyResponse = typeof surveyResponses.$inferSelect
export type NewSurveyResponse = typeof surveyResponses.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createSurveySchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  title: z.string().min(1, 'Titolo sondaggio richiesto').max(200),
  description: z.string().optional(),
  type: z.enum(['pre_event', 'post_event', 'feedback', 'registration', 'custom']),
  status: z.enum(['draft', 'active', 'closed', 'archived']).default('draft'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isAnonymous: z.boolean().default(false),
  allowMultipleResponses: z.boolean().default(false),
  questions: z.string().min(1, 'Domande richieste'), // JSON string
})

export const updateSurveySchema = createSurveySchema.partial()

export const updateSurveyStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'closed', 'archived']),
})

export const createSurveyResponseSchema = z.object({
  surveyId: z.string().min(1, 'ID sondaggio richiesto'),
  respondentId: z.string().optional(),
  respondentType: z.enum(['participant', 'speaker', 'sponsor', 'staff', 'other']).optional(),
  respondentEmail: z.string().email('Email non valida').optional(),
  answers: z.string().min(1, 'Risposte richieste'), // JSON string
  completedAt: z.coerce.date().default(() => new Date()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateSurveyInput = z.infer<typeof createSurveySchema>
export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>
export type UpdateSurveyStatusInput = z.infer<typeof updateSurveyStatusSchema>

export type CreateSurveyResponseInput = z.infer<typeof createSurveyResponseSchema>
