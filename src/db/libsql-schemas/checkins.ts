// ============================================================================
// DRIZZLE ORM SCHEMA - CHECKINS TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/checkins.ts
//
// PURPOSE: Defines the database schema for event check-ins
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// CHECKINS TABLE
// ============================================================================

export const checkins = sqliteTable('checkins', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Person information
  personId: text('person_id').notNull(),
  personType: text('person_type', {
    enum: ['participant', 'speaker', 'sponsor', 'staff'],
  }).notNull(),
  personName: text('person_name').notNull(),
  personEmail: text('person_email'),

  // Check-in information
  checkedInAt: integer('checked_in_at', { mode: 'timestamp' }).notNull(),
  checkedInBy: text('checked_in_by'),
  checkoutAt: integer('checkout_at', { mode: 'timestamp' }),

  // Status and verification
  status: text('status', {
    enum: ['checked_in', 'checked_out', 'no_show'],
  })
    .default('checked_in')
    .notNull(),
  verificationMethod: text('verification_method', {
    enum: ['qr_code', 'manual', 'facial_recognition', 'other'],
  })
    .default('manual')
    .notNull(),
  verificationCode: text('verification_code'),

  // Additional information
  notes: text('notes'),
  badgePrinted: integer('badge_printed', { mode: 'boolean' }).default(false).notNull(),
  materialsProvided: text('materials_provided'), // JSON string of provided materials

  // Location information (for multi-location events)
  locationId: text('location_id'),
  locationName: text('location_name'),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const checkinsEventIdIndex = index('checkins_event_id_idx').on(checkins.eventId)
export const checkinsPersonIdIndex = index('checkins_person_id_idx').on(checkins.personId)
export const checkinsPersonTypeIndex = index('checkins_person_type_idx').on(checkins.personType)
export const checkinsStatusIndex = index('checkins_status_idx').on(checkins.status)
export const checkinsCheckedInAtIndex = index('checkins_checked_in_at_idx').on(checkins.checkedInAt)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Checkin = typeof checkins.$inferSelect
export type NewCheckin = typeof checkins.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createCheckinSchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  personId: z.string().min(1, 'ID persona richiesto'),
  personType: z.enum(['participant', 'speaker', 'sponsor', 'staff']),
  personName: z.string().min(1, 'Nome persona richiesto'),
  personEmail: z.string().email('Email non valida').optional(),
  checkedInAt: z.coerce.date().default(() => new Date()),
  checkedInBy: z.string().optional(),
  status: z.enum(['checked_in', 'checked_out', 'no_show']).default('checked_in'),
  verificationMethod: z
    .enum(['qr_code', 'manual', 'facial_recognition', 'other'])
    .default('manual'),
  verificationCode: z.string().optional(),
  notes: z.string().optional(),
  badgePrinted: z.boolean().default(false),
  materialsProvided: z.string().optional(), // JSON string
  locationId: z.string().optional(),
  locationName: z.string().optional(),
})

export const updateCheckinSchema = createCheckinSchema.partial()

export const updateCheckinStatusSchema = z.object({
  status: z.enum(['checked_in', 'checked_out', 'no_show']),
  checkoutAt: z.coerce.date().optional(),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateCheckinInput = z.infer<typeof createCheckinSchema>
export type UpdateCheckinInput = z.infer<typeof updateCheckinSchema>
export type UpdateCheckinStatusInput = z.infer<typeof updateCheckinStatusSchema>
