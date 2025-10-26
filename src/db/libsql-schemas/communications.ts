// ============================================================================
// DRIZZLE ORM SCHEMA - COMMUNICATIONS TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/communications.ts
//
// PURPOSE: Defines the database schema for event communications
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// COMMUNICATIONS TABLE
// ============================================================================

export const communications = sqliteTable('communications', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Communication information
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type', {
    enum: ['email', 'sms', 'push', 'social', 'announcement'],
  }).notNull(),

  // Recipient information
  recipientType: text('recipient_type', {
    enum: ['all', 'participants', 'speakers', 'sponsors', 'staff'],
  }).notNull(),
  recipientFilter: text('recipient_filter'), // JSON string of filter criteria
  recipientCount: integer('recipient_count').default(0),

  // Scheduling information
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  sentAt: integer('sent_at', { mode: 'timestamp' }),

  // Status information
  status: text('status', {
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
  })
    .default('draft')
    .notNull(),

  // Performance metrics
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  bounceCount: integer('bounce_count').default(0),

  // Additional information
  attachments: text('attachments'), // JSON string of attachment URLs
  metadata: text('metadata'), // JSON string of additional metadata

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const communicationsEventIdIndex = index('communications_event_id_idx').on(
  communications.eventId
)
export const communicationsTypeIndex = index('communications_type_idx').on(communications.type)
export const communicationsStatusIndex = index('communications_status_idx').on(
  communications.status
)
export const communicationsScheduledAtIndex = index('communications_scheduled_at_idx').on(
  communications.scheduledAt
)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Communication = typeof communications.$inferSelect
export type NewCommunication = typeof communications.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createCommunicationSchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  title: z.string().min(1, 'Titolo comunicazione richiesto').max(200),
  content: z.string().min(1, 'Contenuto comunicazione richiesto'),
  type: z.enum(['email', 'sms', 'push', 'social', 'announcement']),
  recipientType: z.enum(['all', 'participants', 'speakers', 'sponsors', 'staff']),
  recipientFilter: z.string().optional(), // JSON string
  scheduledAt: z.coerce.date().optional(),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled']).default('draft'),
  attachments: z.string().optional(), // JSON string
  metadata: z.string().optional(), // JSON string
})

export const updateCommunicationSchema = createCommunicationSchema.partial()

export const updateCommunicationStatusSchema = z.object({
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled']),
  sentAt: z.coerce.date().optional(),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>
export type UpdateCommunicationInput = z.infer<typeof updateCommunicationSchema>
export type UpdateCommunicationStatusInput = z.infer<typeof updateCommunicationStatusSchema>
