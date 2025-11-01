// ============================================================================
// DRIZZLE ORM SCHEMA - PARTICIPANTS TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/participants.ts
//
// PURPOSE: Defines the database schema for participants table
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// PARTICIPANTS TABLE
// ============================================================================

export const participants = sqliteTable('participants', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Personal information
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  jobTitle: text('job_title'),

  // Registration information
  registrationDate: integer('registration_date', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  status: text('status', {
    enum: ['registered', 'confirmed', 'cancelled', 'attended', 'no_show'],
  })
    .default('registered')
    .notNull(),

  // Check-in information
  checkedIn: integer('checked_in', { mode: 'boolean' }).default(false).notNull(),
  checkinTime: integer('checkin_time', { mode: 'timestamp' }),

  // Additional information
  notes: text('notes'),
  dietaryRequirements: text('dietary_requirements'),
  specialNeeds: text('special_needs'),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const participantsEventIdIndex = index('participants_event_id_idx').on(participants.eventId)
export const participantsEmailIndex = index('participants_email_idx').on(participants.email)
export const participantsStatusIndex = index('participants_status_idx').on(participants.status)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createParticipantSchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  firstName: z.string().min(1, 'Nome richiesto').max(100),
  lastName: z.string().min(1, 'Cognome richiesto').max(100),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  status: z
    .enum(['registered', 'confirmed', 'cancelled', 'attended', 'no_show'])
    .default('registered'),
  notes: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  specialNeeds: z.string().optional(),
})

export const updateParticipantSchema = createParticipantSchema.partial()

export const updateParticipantStatusSchema = z.object({
  status: z.enum(['registered', 'confirmed', 'cancelled', 'attended', 'no_show']),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>
export type UpdateParticipantStatusInput = z.infer<typeof updateParticipantStatusSchema>
