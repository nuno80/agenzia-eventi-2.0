/**
 * FILE: src/lib/dal/settings.ts
 * TYPE: Data Access Layer
 *
 * WHY:
 * - Centralized data access for organization settings
 * - Uses React cache() for request deduplication
 * - Handles default settings creation on first access
 *
 * USAGE:
 * - getOrganizationSettings(): Get or create default settings
 * - updateProfileSettings(): Update profile info
 * - updateNotificationSettings(): Update notification preferences
 */

import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/db'
import {
  type NewOrganizationSettings,
  type OrganizationSettings,
  organizationSettings,
} from '@/db/libsql-schemas'
import type { NotificationSettings, ProfileSettings } from '@/lib/validations/settings'

// ============================================================================
// TYPES
// ============================================================================

type SettingsDTO = {
  id: string
  profile: ProfileSettings
  notifications: NotificationSettings
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// HELPERS
// ============================================================================

function mapToDTO(settings: OrganizationSettings): SettingsDTO {
  return {
    id: settings.id,
    profile: {
      organizationName: settings.organizationName,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone ?? '',
      logoUrl: settings.logoUrl ?? '',
      timezone: settings.timezone,
      language: settings.language as 'it' | 'en',
      address: settings.address ?? '',
      city: settings.city ?? '',
      country: settings.country,
      website: settings.website ?? '',
    },
    notifications: {
      emailNotifications: settings.emailNotifications,
      deadlineNotificationDays: settings.deadlineNotificationDays,
      paymentNotifications: settings.paymentNotifications,
      weeklyDigest: settings.weeklyDigest,
      digestDay: settings.digestDay as 'monday' | 'friday',
      notifyOnRegistration: settings.notifyOnRegistration,
      notifyOnCheckIn: settings.notifyOnCheckIn,
      notifyOnSponsorPayment: settings.notifyOnSponsorPayment,
    },
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  }
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get organization settings or create default if none exist
 */
export const getOrganizationSettings = cache(async (): Promise<SettingsDTO> => {
  try {
    // Try to get existing settings
    const existing = await db.query.organizationSettings.findFirst()

    if (existing) {
      return mapToDTO(existing)
    }

    // Create default settings if none exist
    const defaultSettings: NewOrganizationSettings = {
      organizationName: '',
      contactEmail: '',
      contactPhone: '',
      logoUrl: '',
      timezone: 'Europe/Rome',
      language: 'it',
      address: '',
      city: '',
      country: 'Italia',
      website: '',
      emailNotifications: true,
      deadlineNotificationDays: 7,
      paymentNotifications: true,
      weeklyDigest: false,
      digestDay: 'monday',
      notifyOnRegistration: true,
      notifyOnCheckIn: false,
      notifyOnSponsorPayment: true,
    }

    const [created] = await db.insert(organizationSettings).values(defaultSettings).returning()

    return mapToDTO(created)
  } catch (error) {
    console.error('[DAL] Failed to get organization settings:', error)
    throw new Error('Failed to get organization settings')
  }
})

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update profile settings
 */
export async function updateProfileSettings(data: ProfileSettings): Promise<SettingsDTO> {
  try {
    // Get or create settings first
    const current = await getOrganizationSettings()

    const [updated] = await db
      .update(organizationSettings)
      .set({
        organizationName: data.organizationName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone ?? '',
        logoUrl: data.logoUrl ?? '',
        timezone: data.timezone,
        language: data.language,
        address: data.address ?? '',
        city: data.city ?? '',
        country: data.country,
        website: data.website ?? '',
        updatedAt: new Date(),
      })
      .where(eq(organizationSettings.id, current.id))
      .returning()

    return mapToDTO(updated)
  } catch (error) {
    console.error('[DAL] Failed to update profile settings:', error)
    throw new Error('Failed to update profile settings')
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(data: NotificationSettings): Promise<SettingsDTO> {
  try {
    // Get or create settings first
    const current = await getOrganizationSettings()

    const [updated] = await db
      .update(organizationSettings)
      .set({
        emailNotifications: data.emailNotifications,
        deadlineNotificationDays: data.deadlineNotificationDays,
        paymentNotifications: data.paymentNotifications,
        weeklyDigest: data.weeklyDigest,
        digestDay: data.digestDay,
        notifyOnRegistration: data.notifyOnRegistration,
        notifyOnCheckIn: data.notifyOnCheckIn,
        notifyOnSponsorPayment: data.notifyOnSponsorPayment,
        updatedAt: new Date(),
      })
      .where(eq(organizationSettings.id, current.id))
      .returning()

    return mapToDTO(updated)
  } catch (error) {
    console.error('[DAL] Failed to update notification settings:', error)
    throw new Error('Failed to update notification settings')
  }
}
