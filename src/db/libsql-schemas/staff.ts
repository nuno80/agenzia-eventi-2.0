/**
 * FILE: src/db/libsql-schemas/staff.ts
 * Staff and Staff Assignments schema (Drizzle ORM - SQLite)
 */

import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { events } from './events'

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
// STAFF TABLE
// ============================================================================
export const staff = sqliteTable('staff', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  // Personal Info
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),

  // Media
  photoUrl: text('photo_url'),

  // Role & Specialization
  role: text('role', {
    enum: [
      'hostess',
      'steward',
      'driver',
      'av_tech',
      'photographer',
      'videographer',
      'security',
      'catering',
      'cleaning',
      'other',
    ],
  }).notNull(),
  specialization: text('specialization'),

  // Financial
  hourlyRate: real('hourly_rate'),
  preferredPaymentMethod: text('preferred_payment_method'),

  // Status
  isActive: integer('is_active', { mode: 'boolean' }).default(true),

  // Tags & Notes
  tags: text('tags'), // JSON array di stringhe
  notes: text('notes'),

  ...timestamp,
})

// ============================================================================
// STAFF ASSIGNMENTS TABLE
// ============================================================================
export const staffAssignments = sqliteTable('staff_assignments', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  eventId: text('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),

  staffId: text('staff_id')
    .notNull()
    .references(() => staff.id, { onDelete: 'cascade' }),

  // Timing
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),

  // Assignment lifecycle
  assignmentStatus: text('assignment_status', {
    enum: ['requested', 'confirmed', 'declined', 'completed', 'cancelled'],
  })
    .default('requested')
    .notNull(),

  // Payments
  paymentStatus: text('payment_status', {
    enum: ['not_due', 'pending', 'overdue', 'paid'],
  })
    .default('not_due')
    .notNull(),
  paymentTerms: text('payment_terms', {
    enum: ['custom', 'immediate', '30_days', '60_days', '90_days'],
  })
    .default('custom')
    .notNull(),
  paymentAmount: real('payment_amount'),
  paymentDueDate: integer('payment_due_date', { mode: 'timestamp' }),
  paymentDate: integer('payment_date', { mode: 'timestamp' }),
  paymentNotes: text('payment_notes'),

  // Invoicing
  invoiceNumber: text('invoice_number'),
  invoiceUrl: text('invoice_url'),

  // Budget Integration
  budgetItemId: text('budget_item_id'), // Link to auto-created budget item

  ...timestamp,
})

// ============================================================================
// RELATIONS
// ============================================================================
export const staffRelations = relations(staff, ({ many }) => ({
  assignments: many(staffAssignments),
}))

export const staffAssignmentsRelations = relations(staffAssignments, ({ one }) => ({
  staff: one(staff, {
    fields: [staffAssignments.staffId],
    references: [staff.id],
  }),
  event: one(events, {
    fields: [staffAssignments.eventId],
    references: [events.id],
  }),
}))

// ============================================================================
// TYPES
// ============================================================================
export type Staff = typeof staff.$inferSelect
export type NewStaff = typeof staff.$inferInsert

export type StaffAssignment = typeof staffAssignments.$inferSelect
export type NewStaffAssignment = typeof staffAssignments.$inferInsert
