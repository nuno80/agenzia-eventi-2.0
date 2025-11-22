/**
 * Email Templates Schema
 *
 * PURPOSE:
 * - Store reusable email templates for event communications
 * - Support variable substitution (e.g., {{firstName}}, {{eventTitle}})
 * - Categorize templates for easy selection
 *
 * USAGE:
 * - Used by CommunicationsTab for email composition
 * - Templates can be event-specific or global
 */

import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
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
// EMAIL TEMPLATES TABLE
// ============================================================================

export const emailTemplates = sqliteTable('email_templates', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  // Template Info
  name: text('name').notNull(),
  description: text('description'),

  // Email Content
  subject: text('subject').notNull(),
  body: text('body').notNull(), // HTML or plain text

  // Variables
  // JSON array of variable names that can be used in template
  // Example: ["firstName", "lastName", "eventTitle", "eventDate"]
  variables: text('variables'), // JSON array

  // Category
  category: text('category', {
    enum: ['welcome', 'reminder', 'confirmation', 'update', 'thank_you', 'custom'],
  }).default('custom'),

  // Scope
  eventId: text('event_id').references(() => events.id, { onDelete: 'cascade' }), // null = global template
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),

  // Usage Stats
  usageCount: integer('usage_count').default(0),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),

  ...timestamp,
})

// ============================================================================
// RELATIONS
// ============================================================================

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  event: one(events, {
    fields: [emailTemplates.eventId],
    references: [events.id],
  }),
}))

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type EmailTemplate = typeof emailTemplates.$inferSelect
export type NewEmailTemplate = typeof emailTemplates.$inferInsert
