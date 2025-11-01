// ============================================================================
// DRIZZLE ORM SCHEMA - SERVICES TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/services.ts
//
// PURPOSE: Defines the database schema for event services
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// SERVICES TABLE
// ============================================================================

export const services = sqliteTable('services', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Service information
  name: text('name').notNull(),
  type: text('type', {
    enum: [
      'catering',
      'audio_video',
      'venue',
      'transportation',
      'accommodation',
      'printing',
      'photography',
      'other',
    ],
  }).notNull(),
  description: text('description'),

  // Provider information
  providerName: text('provider_name').notNull(),
  providerContact: text('provider_contact'),
  providerEmail: text('provider_email'),
  providerPhone: text('provider_phone'),

  // Cost information
  cost: real('cost').notNull(),
  isPaid: integer('is_paid', { mode: 'boolean' }).default(false).notNull(),
  paymentDate: integer('payment_date', { mode: 'timestamp' }),
  invoiceNumber: text('invoice_number'),

  // Scheduling information
  scheduledDate: integer('scheduled_date', { mode: 'timestamp' }),
  scheduledStartTime: text('scheduled_start_time'),
  scheduledEndTime: text('scheduled_end_time'),

  // Status information
  status: text('status', {
    enum: ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'],
  })
    .default('requested')
    .notNull(),

  // Additional information
  notes: text('notes'),
  attachments: text('attachments'), // JSON string of attachment URLs

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const servicesEventIdIndex = index('services_event_id_idx').on(services.eventId)
export const servicesTypeIndex = index('services_type_idx').on(services.type)
export const servicesStatusIndex = index('services_status_idx').on(services.status)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Service = typeof services.$inferSelect
export type NewService = typeof services.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createServiceSchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  name: z.string().min(1, 'Nome servizio richiesto').max(200),
  type: z.enum([
    'catering',
    'audio_video',
    'venue',
    'transportation',
    'accommodation',
    'printing',
    'photography',
    'other',
  ]),
  description: z.string().optional(),
  providerName: z.string().min(1, 'Nome fornitore richiesto'),
  providerContact: z.string().optional(),
  providerEmail: z.string().email('Email non valida').optional(),
  providerPhone: z.string().optional(),
  cost: z.number().nonnegative('Costo non può essere negativo'),
  isPaid: z.boolean().default(false),
  paymentDate: z.coerce.date().optional(),
  invoiceNumber: z.string().optional(),
  scheduledDate: z.coerce.date().optional(),
  scheduledStartTime: z.string().optional(),
  scheduledEndTime: z.string().optional(),
  status: z
    .enum(['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .default('requested'),
  notes: z.string().optional(),
  attachments: z.string().optional(),
})

export const updateServiceSchema = createServiceSchema.partial()

export const updateServiceStatusSchema = z.object({
  status: z.enum(['requested', 'confirmed', 'in_progress', 'completed', 'cancelled']),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type UpdateServiceStatusInput = z.infer<typeof updateServiceStatusSchema>
