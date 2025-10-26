// ============================================================================
// DRIZZLE ORM SCHEMA - SPONSORS TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/sponsors.ts
//
// PURPOSE: Defines the database schema for sponsors table
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// SPONSORS TABLE
// ============================================================================

export const sponsors = sqliteTable('sponsors', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Company information
  name: text('name').notNull(),
  type: text('type', {
    enum: ['platinum', 'gold', 'silver', 'bronze', 'partner'],
  }).notNull(),
  logoUrl: text('logo_url'),
  website: text('website'),

  // Contact information
  contactName: text('contact_name'),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),

  // Sponsorship details
  amount: real('amount').notNull(), // Sponsorship amount
  benefits: text('benefits'), // JSON string of benefits
  boothLocation: text('booth_location'),
  boothSize: text('booth_size'),

  // Status information
  status: text('status', {
    enum: ['prospect', 'negotiating', 'confirmed', 'paid', 'cancelled'],
  })
    .default('prospect')
    .notNull(),

  // Payment information
  invoiceNumber: text('invoice_number'),
  invoiceDate: integer('invoice_date', { mode: 'timestamp' }),
  paymentDate: integer('payment_date', { mode: 'timestamp' }),
  paymentMethod: text('payment_method'),

  // Additional information
  notes: text('notes'),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
})

// ============================================================================
// INDEXES
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

export const sponsorsEventIdIndex = index('sponsors_event_id_idx').on(sponsors.eventId)
export const sponsorsTypeIndex = index('sponsors_type_idx').on(sponsors.type)
export const sponsorsStatusIndex = index('sponsors_status_idx').on(sponsors.status)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Sponsor = typeof sponsors.$inferSelect
export type NewSponsor = typeof sponsors.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createSponsorSchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  name: z.string().min(1, 'Nome azienda richiesto').max(200),
  type: z.enum(['platinum', 'gold', 'silver', 'bronze', 'partner']),
  logoUrl: z.string().url('URL non valido').optional(),
  website: z.string().url('URL non valido').optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Email non valida'),
  contactPhone: z.string().optional(),
  amount: z.number().positive('Importo deve essere positivo'),
  benefits: z.string().optional(),
  boothLocation: z.string().optional(),
  boothSize: z.string().optional(),
  status: z.enum(['prospect', 'negotiating', 'confirmed', 'paid', 'cancelled']).default('prospect'),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.coerce.date().optional(),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
})

export const updateSponsorSchema = createSponsorSchema.partial()

export const updateSponsorStatusSchema = z.object({
  status: z.enum(['prospect', 'negotiating', 'confirmed', 'paid', 'cancelled']),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateSponsorInput = z.infer<typeof createSponsorSchema>
export type UpdateSponsorInput = z.infer<typeof updateSponsorSchema>
export type UpdateSponsorStatusInput = z.infer<typeof updateSponsorStatusSchema>
