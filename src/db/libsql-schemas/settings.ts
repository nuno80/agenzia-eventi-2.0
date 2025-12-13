/**
 * Organization Settings Schema
 *
 * PURPOSE:
 * - Store organization profile settings (name, contact, logo, etc.)
 * - Store notification preferences
 * - Single-row table (one settings record per organization)
 *
 * USAGE:
 * - Used by /impostazioni page for settings management
 * - Future: support multi-tenant with userId
 */

import { createId } from '@paralleldrive/cuid2'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
// ORGANIZATION SETTINGS TABLE
// ============================================================================

export const organizationSettings = sqliteTable('organization_settings', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),

  // Future multi-tenant support
  userId: text('user_id'), // null = default/global settings

  // =========== Profile Settings ===========
  organizationName: text('organization_name').notNull().default(''),
  contactEmail: text('contact_email').notNull().default(''),
  contactPhone: text('contact_phone').default(''),
  logoUrl: text('logo_url').default(''),
  timezone: text('timezone').notNull().default('Europe/Rome'),
  language: text('language', { enum: ['it', 'en'] })
    .notNull()
    .default('it'),
  address: text('address').default(''),
  city: text('city').default(''),
  country: text('country').notNull().default('Italia'),
  website: text('website').default(''),

  // =========== Notification Settings ===========
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).notNull().default(true),
  deadlineNotificationDays: integer('deadline_notification_days').notNull().default(7),
  paymentNotifications: integer('payment_notifications', { mode: 'boolean' })
    .notNull()
    .default(true),
  weeklyDigest: integer('weekly_digest', { mode: 'boolean' }).notNull().default(false),
  digestDay: text('digest_day', { enum: ['monday', 'friday'] })
    .notNull()
    .default('monday'),
  notifyOnRegistration: integer('notify_on_registration', { mode: 'boolean' })
    .notNull()
    .default(true),
  notifyOnCheckIn: integer('notify_on_check_in', { mode: 'boolean' }).notNull().default(false),
  notifyOnSponsorPayment: integer('notify_on_sponsor_payment', { mode: 'boolean' })
    .notNull()
    .default(true),

  ...timestamp,
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type OrganizationSettings = typeof organizationSettings.$inferSelect
export type NewOrganizationSettings = typeof organizationSettings.$inferInsert
