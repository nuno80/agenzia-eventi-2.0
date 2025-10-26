// ============================================================================
// DRIZZLE ORM SCHEMA - AGENDA TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/agenda.ts
//
// PURPOSE: Defines the database schema for event agenda and sessions
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// AGENDA SESSIONS TABLE
// ============================================================================

export const agendaSessions = sqliteTable('agenda_sessions', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Session information
  title: text('title').notNull(),
  description: text('description'),
  type: text('type', {
    enum: ['keynote', 'presentation', 'workshop', 'panel', 'networking', 'break', 'other'],
  }).notNull(),

  // Scheduling information
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  day: integer('day').notNull(), // 1 = first day, 2 = second day, etc.

  // Location information
  location: text('location'),
  room: text('room'),
  capacity: integer('capacity'),

  // Speaker information
  speakerIds: text('speaker_ids'), // JSON array of speaker IDs
  speakerNames: text('speaker_names'), // JSON array of speaker names

  // Status information
  status: text('status', {
    enum: ['draft', 'confirmed', 'cancelled', 'rescheduled'],
  })
    .default('draft')
    .notNull(),

  // Additional information
  tags: text('tags'), // JSON array of tags
  materials: text('materials'), // JSON object with links to slides, videos, etc.
  isPublic: integer('is_public', { mode: 'boolean' }).default(true).notNull(),
  requiresRegistration: integer('requires_registration', { mode: 'boolean' })
    .default(false)
    .notNull(),
  registrationCount: integer('registration_count').default(0),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// SESSION REGISTRATIONS TABLE
// ============================================================================

export const sessionRegistrations = sqliteTable('session_registrations', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to agenda sessions
  sessionId: text('session_id')
    .notNull()
    .references(() => agendaSessions.id, { onDelete: 'cascade' }),

  // Participant information
  participantId: text('participant_id').notNull(),
  participantName: text('participant_name').notNull(),
  participantEmail: text('participant_email'),

  // Registration information
  registeredAt: integer('registered_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  status: text('status', {
    enum: ['registered', 'waitlisted', 'attended', 'cancelled', 'no_show'],
  })
    .default('registered')
    .notNull(),
  attendedAt: integer('attended_at', { mode: 'timestamp' }),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const agendaSessionsEventIdIndex = index('agenda_sessions_event_id_idx').on(
  agendaSessions.eventId
)
export const agendaSessionsStartTimeIndex = index('agenda_sessions_start_time_idx').on(
  agendaSessions.startTime
)
export const agendaSessionsDayIndex = index('agenda_sessions_day_idx').on(agendaSessions.day)
export const agendaSessionsTypeIndex = index('agenda_sessions_type_idx').on(agendaSessions.type)
export const agendaSessionsStatusIndex = index('agenda_sessions_status_idx').on(
  agendaSessions.status
)

export const sessionRegistrationsSessionIdIndex = index('session_registrations_session_id_idx').on(
  sessionRegistrations.sessionId
)
export const sessionRegistrationsParticipantIdIndex = index(
  'session_registrations_participant_id_idx'
).on(sessionRegistrations.participantId)
export const sessionRegistrationsStatusIndex = index('session_registrations_status_idx').on(
  sessionRegistrations.status
)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type AgendaSession = typeof agendaSessions.$inferSelect
export type NewAgendaSession = typeof agendaSessions.$inferInsert

export type SessionRegistration = typeof sessionRegistrations.$inferSelect
export type NewSessionRegistration = typeof sessionRegistrations.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createAgendaSessionSchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  title: z.string().min(1, 'Titolo sessione richiesto').max(200),
  description: z.string().optional(),
  type: z.enum(['keynote', 'presentation', 'workshop', 'panel', 'networking', 'break', 'other']),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  day: z.number().int().positive('Giorno deve essere un numero positivo'),
  location: z.string().optional(),
  room: z.string().optional(),
  capacity: z.number().int().positive('Capacità deve essere un numero positivo').optional(),
  speakerIds: z.string().optional(), // JSON array
  speakerNames: z.string().optional(), // JSON array
  status: z.enum(['draft', 'confirmed', 'cancelled', 'rescheduled']).default('draft'),
  tags: z.string().optional(), // JSON array
  materials: z.string().optional(), // JSON object
  isPublic: z.boolean().default(true),
  requiresRegistration: z.boolean().default(false),
})

export const updateAgendaSessionSchema = createAgendaSessionSchema.partial()

export const updateAgendaSessionStatusSchema = z.object({
  status: z.enum(['draft', 'confirmed', 'cancelled', 'rescheduled']),
})

export const createSessionRegistrationSchema = z.object({
  sessionId: z.string().min(1, 'ID sessione richiesto'),
  participantId: z.string().min(1, 'ID partecipante richiesto'),
  participantName: z.string().min(1, 'Nome partecipante richiesto'),
  participantEmail: z.string().email('Email non valida').optional(),
  status: z
    .enum(['registered', 'waitlisted', 'attended', 'cancelled', 'no_show'])
    .default('registered'),
  attendedAt: z.coerce.date().optional(),
})

export const updateSessionRegistrationSchema = createSessionRegistrationSchema.partial()

export const updateSessionRegistrationStatusSchema = z.object({
  status: z.enum(['registered', 'waitlisted', 'attended', 'cancelled', 'no_show']),
  attendedAt: z.coerce.date().optional(),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateAgendaSessionInput = z.infer<typeof createAgendaSessionSchema>
export type UpdateAgendaSessionInput = z.infer<typeof updateAgendaSessionSchema>
export type UpdateAgendaSessionStatusInput = z.infer<typeof updateAgendaSessionStatusSchema>

export type CreateSessionRegistrationInput = z.infer<typeof createSessionRegistrationSchema>
export type UpdateSessionRegistrationInput = z.infer<typeof updateSessionRegistrationSchema>
export type UpdateSessionRegistrationStatusInput = z.infer<
  typeof updateSessionRegistrationStatusSchema
>
