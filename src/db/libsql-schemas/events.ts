// ============================================================================
// DRIZZLE ORM SCHEMA - EVENTS TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/events.ts
//
// PURPOSE: Defines the database schema for events table
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { nanoid } from 'nanoid'
import { z } from 'zod'

// ============================================================================
// EVENTS TABLE
// ============================================================================

export const events = sqliteTable('events', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()), // Auto-generate CUID

  // Basic information
  name: text('name').notNull(),
  type: text('type', {
    enum: ['congresso_medico', 'conferenza_aziendale', 'workshop', 'fiera'],
  }).notNull(),
  description: text('description'),

  // Location and dates
  location: text('location').notNull(),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),

  // Capacity management
  capacity: integer('capacity').notNull(),
  registeredCount: integer('registered_count').default(0).notNull(),

  // Budget management
  budget: real('budget').notNull(), // Use real for decimal numbers in SQLite
  spent: real('spent').default(0).notNull(),

  // Status tracking
  status: text('status', {
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
  })
    .default('draft')
    .notNull(),

  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),

  // Soft delete (optional)
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
})

// ============================================================================
// RELATIONS (if using Drizzle Relations)
// ============================================================================

import { relations } from 'drizzle-orm'
import { budgetCategories } from './budgetCategories'
import { deadlines } from './deadlines'
import { participants } from './participants' // Import other tables
import { services } from './services'
import { speakers } from './speakers'
import { sponsors } from './sponsors'

export const eventsRelations = relations(events, ({ many }) => ({
  participants: many(participants),
  speakers: many(speakers),
  sponsors: many(sponsors),
  services: many(services),
  budgetCategories: many(budgetCategories),
  deadlines: many(deadlines),
}))

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert

// ============================================================================
// INDEXES (for performance)
// ============================================================================

import { index } from 'drizzle-orm/sqlite-core'

// Add indexes for frequently queried columns
export const eventsStatusIndex = index('events_status_idx').on(events.status)
export const eventsStartDateIndex = index('events_start_date_idx').on(events.startDate)
export const eventsTypeIndex = index('events_type_idx').on(events.type)

// ============================================================================
// SAMPLE SEED DATA (for development)
// ============================================================================

export const sampleEvents: NewEvent[] = [
  {
    name: 'Congresso Nazionale Cardiologia 2025',
    type: 'congresso_medico',
    description: 'Evento annuale dedicato alle innovazioni in cardiologia',
    location: 'Milano, Palazzo Congressi',
    startDate: new Date('2025-11-15'),
    endDate: new Date('2025-11-17'),
    capacity: 150,
    registeredCount: 120,
    budget: 50000,
    spent: 45000,
    status: 'upcoming',
  },
  {
    name: 'Workshop Innovazione Digitale',
    type: 'workshop',
    description: 'Workshop pratico su tecnologie digitali emergenti',
    location: 'Roma, Centro Congressi Frentani',
    startDate: new Date('2025-11-05'),
    endDate: new Date('2025-11-05'),
    capacity: 80,
    registeredCount: 65,
    budget: 15000,
    spent: 14200,
    status: 'upcoming',
  },
  {
    name: 'Conferenza Annuale Enterprise',
    type: 'conferenza_aziendale',
    description: 'Conferenza aziendale con keynote speakers internazionali',
    location: 'Firenze, Grand Hotel',
    startDate: new Date('2025-10-28'),
    endDate: new Date('2025-10-29'),
    capacity: 200,
    registeredCount: 200,
    budget: 75000,
    spent: 72000,
    status: 'active',
  },
]

// ============================================================================
// VALIDATION SCHEMAS (for Server Actions)
// ============================================================================

/**
 * Zod schema for event creation
 * Use this in Server Actions for validation
 */
export const createEventSchema = z
  .object({
    name: z.string().min(3, 'Nome deve essere almeno 3 caratteri').max(200),
    type: z.enum(['congresso_medico', 'conferenza_aziendale', 'workshop', 'fiera']),
    description: z.string().max(2000).optional(),
    location: z.string().min(3, 'Location richiesta').max(200),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    capacity: z.number().int().positive('Capacità deve essere positiva'),
    budget: z.number().positive('Budget deve essere positivo'),
    status: z.enum(['draft', 'upcoming', 'active', 'completed', 'cancelled']).default('draft'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Data fine deve essere dopo data inizio',
    path: ['endDate'],
  })

/**
 * Zod schema for event update
 * Partial schema allows updating only specific fields
 */
export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().min(1, 'ID richiesto'),
})

/**
 * Zod schema for event status update
 */
export const updateEventStatusSchema = z.object({
  id: z.string().min(1, 'ID richiesto'),
  status: z.enum(['draft', 'upcoming', 'active', 'completed', 'cancelled']),
})

// ============================================================================
// HELPER TYPES
// ============================================================================

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>
