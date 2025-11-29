/**
 * Surveys Module - Database Schema
 * ORM: Drizzle with SQLite (Turso)
 *
 * Tables:
 * - surveys: Event surveys/questionnaires
 * - survey_questions: Questions within surveys
 * - survey_responses: User responses to surveys
 * - survey_answers: Individual answers to questions
 */

import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { events, participants } from './events'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const timestamp = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
}

// ============================================================================
// SURVEYS TABLE
// ============================================================================

export const surveys = sqliteTable('surveys', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Survey Info
  title: text('title').notNull(),
  description: text('description'),

  // Status
  status: text('status', {
    enum: ['draft', 'active', 'closed'],
  })
    .default('draft')
    .notNull(),

  // Settings
  allowAnonymous: integer('allow_anonymous', { mode: 'boolean' }).default(false).notNull(),
  allowMultipleResponses: integer('allow_multiple_responses', { mode: 'boolean' })
    .default(false)
    .notNull(),
  showResults: integer('show_results', { mode: 'boolean' }).default(false).notNull(),

  // Dates
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  closedAt: integer('closed_at', { mode: 'timestamp' }),

  ...timestamp,
})

// ============================================================================
// SURVEY QUESTIONS TABLE
// ============================================================================

export const surveyQuestions = sqliteTable('survey_questions', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  surveyId: text('survey_id')
    .notNull()
    .references(() => surveys.id, { onDelete: 'cascade' }),

  // Question Info
  question: text('question').notNull(),
  description: text('description'),

  // Question Type
  type: text('type', {
    enum: ['multiple_choice', 'checkboxes', 'text', 'textarea', 'rating', 'scale'],
  }).notNull(),

  // Options (for multiple_choice and checkboxes)
  // Stored as JSON array: ["Option 1", "Option 2", ...]
  options: text('options'),

  // Validation
  required: integer('required', { mode: 'boolean' }).default(false).notNull(),

  // Display Order
  order: integer('order').notNull(),

  ...timestamp,
})

// ============================================================================
// SURVEY RESPONSES TABLE
// ============================================================================

export const surveyResponses = sqliteTable('survey_responses', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  surveyId: text('survey_id')
    .notNull()
    .references(() => surveys.id, { onDelete: 'cascade' }),

  // Participant (nullable for anonymous responses)
  participantId: text('participant_id').references(() => participants.id, {
    onDelete: 'set null',
  }),

  // Submission Info
  submittedAt: integer('submitted_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),

  // Metadata
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  // Completion
  isComplete: integer('is_complete', { mode: 'boolean' }).default(true).notNull(),

  ...timestamp,
})

// ============================================================================
// SURVEY ANSWERS TABLE
// ============================================================================

export const surveyAnswers = sqliteTable('survey_answers', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  responseId: text('response_id')
    .notNull()
    .references(() => surveyResponses.id, { onDelete: 'cascade' }),

  questionId: text('question_id')
    .notNull()
    .references(() => surveyQuestions.id, { onDelete: 'cascade' }),

  // Answer
  // For text/textarea: plain text
  // For multiple_choice: single option
  // For checkboxes: JSON array of selected options
  // For rating/scale: numeric value as string
  answer: text('answer').notNull(),

  ...timestamp,
})

// ============================================================================
// RELATIONS
// ============================================================================

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  event: one(events, {
    fields: [surveys.eventId],
    references: [events.id],
  }),
  questions: many(surveyQuestions),
  responses: many(surveyResponses),
}))

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [surveyQuestions.surveyId],
    references: [surveys.id],
  }),
  answers: many(surveyAnswers),
}))

export const surveyResponsesRelations = relations(surveyResponses, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [surveyResponses.surveyId],
    references: [surveys.id],
  }),
  participant: one(participants, {
    fields: [surveyResponses.participantId],
    references: [participants.id],
  }),
  answers: many(surveyAnswers),
}))

export const surveyAnswersRelations = relations(surveyAnswers, ({ one }) => ({
  response: one(surveyResponses, {
    fields: [surveyAnswers.responseId],
    references: [surveyResponses.id],
  }),
  question: one(surveyQuestions, {
    fields: [surveyAnswers.questionId],
    references: [surveyQuestions.id],
  }),
}))

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Survey = typeof surveys.$inferSelect
export type NewSurvey = typeof surveys.$inferInsert

export type SurveyQuestion = typeof surveyQuestions.$inferSelect
export type NewSurveyQuestion = typeof surveyQuestions.$inferInsert

export type SurveyResponse = typeof surveyResponses.$inferSelect
export type NewSurveyResponse = typeof surveyResponses.$inferInsert

export type SurveyAnswer = typeof surveyAnswers.$inferSelect
export type NewSurveyAnswer = typeof surveyAnswers.$inferInsert
