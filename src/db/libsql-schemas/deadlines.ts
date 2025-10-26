// ============================================================================
// DRIZZLE ORM SCHEMA - DEADLINES TABLE
// ============================================================================
// FILE: src/db/libsql-schemas/deadlines.ts
//
// PURPOSE: Defines the database schema for event deadlines and milestones
// USAGE: Import in Drizzle queries and migrations
// ============================================================================

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { events } from './events'

// ============================================================================
// DEADLINES TABLE
// ============================================================================

export const deadlines = sqliteTable('deadlines', {
  // Primary key
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Foreign key to events
  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  // Deadline information
  title: text('title').notNull(),
  description: text('description'),
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),

  // Category and priority
  category: text('category', {
    enum: ['registration', 'payment', 'submission', 'logistics', 'marketing', 'other'],
  }).notNull(),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'critical'],
  })
    .default('medium')
    .notNull(),

  // Status information
  status: text('status', {
    enum: ['pending', 'in_progress', 'completed', 'overdue', 'cancelled'],
  })
    .default('pending')
    .notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  completedBy: text('completed_by'),

  // Notification settings
  reminderDays: integer('reminder_days').default(7),
  notificationSent: integer('notification_sent', { mode: 'boolean' }).default(false).notNull(),

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

export const deadlinesEventIdIndex = index('deadlines_event_id_idx').on(deadlines.eventId)
export const deadlinesDueDateIndex = index('deadlines_due_date_idx').on(deadlines.dueDate)
export const deadlinesStatusIndex = index('deadlines_status_idx').on(deadlines.status)
export const deadlinesPriorityIndex = index('deadlines_priority_idx').on(deadlines.priority)

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Deadline = typeof deadlines.$inferSelect
export type NewDeadline = typeof deadlines.$inferInsert

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createDeadlineSchema = z.object({
  eventId: z.string().min(1, 'ID evento richiesto'),
  title: z.string().min(1, 'Titolo scadenza richiesto').max(200),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  category: z.enum(['registration', 'payment', 'submission', 'logistics', 'marketing', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z
    .enum(['pending', 'in_progress', 'completed', 'overdue', 'cancelled'])
    .default('pending'),
  completedAt: z.coerce.date().optional(),
  completedBy: z.string().optional(),
  reminderDays: z.number().int().nonnegative().default(7),
  notes: z.string().optional(),
  attachments: z.string().optional(),
})

export const updateDeadlineSchema = createDeadlineSchema.partial()

export const updateDeadlineStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue', 'cancelled']),
  completedAt: z.coerce.date().optional(),
  completedBy: z.string().optional(),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>
export type UpdateDeadlineInput = z.infer<typeof updateDeadlineSchema>
export type UpdateDeadlineStatusInput = z.infer<typeof updateDeadlineStatusSchema>
