// ============================================================================
// DRIZZLE ORM SCHEMA - SPEAKERS TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/speakers.ts
//
// PURPOSE: Defines the database schema for speakers table
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// SPEAKERS TABLE
// ============================================================================

export const speakers = sqliteTable('speakers', {
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
  bio: text('bio'),
  photoUrl: text('photo_url'),

  // Presentation information
  presentationTitle: text('presentation_title'),
  presentationDescription: text('presentation_description'),
  presentationDuration: integer('presentation_duration'), // in minutes
  presentationDate: integer('presentation_date', { mode: 'timestamp' }),
  presentationSlot: text('presentation_slot'), // e.g., "morning", "afternoon"

  // Status information
  status: text('status', {
    enum: ['invited', 'confirmed', 'cancelled', 'attended'],
  })
    .default('invited')
    .notNull(),

  // Additional information
  notes: text('notes'),
  travelArrangements: text('travel_arrangements'),
  accommodationNeeds: text('accommodation_needs'),
  dietaryRequirements: text('dietary_requirements'),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const speakersEventIdIndex = index('speakers_event_id_idx').on(speakers.eventId)
export const speakersEmailIndex = index('speakers_email_idx').on(speakers.email)
export const speakersStatusIndex = index('speakers_status_idx').on(speakers.status)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Speaker = typeof speakers.$inferSelect
export type NewSpeaker = typeof speakers.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createSpeakerSchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  firstName: z.string().min(1, 'Nome richiesto').max(100),
  lastName: z.string().min(1, 'Cognome richiesto').max(100),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url('URL non valido').optional(),
  presentationTitle: z.string().optional(),
  presentationDescription: z.string().optional(),
  presentationDuration: z.number().int().positive().optional(),
  presentationDate: z.coerce.date().optional(),
  presentationSlot: z.string().optional(),
  status: z.enum(['invited', 'confirmed', 'cancelled', 'attended']).default('invited'),
  notes: z.string().optional(),
  travelArrangements: z.string().optional(),
  accommodationNeeds: z.string().optional(),
  dietaryRequirements: z.string().optional(),
})

export const updateSpeakerSchema = createSpeakerSchema.partial()

export const updateSpeakerStatusSchema = z.object({
  status: z.enum(['invited', 'confirmed', 'cancelled', 'attended']),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateSpeakerInput = z.infer<typeof createSpeakerSchema>
export type UpdateSpeakerInput = z.infer<typeof updateSpeakerSchema>
export type UpdateSpeakerStatusInput = z.infer<typeof updateSpeakerStatusSchema>
