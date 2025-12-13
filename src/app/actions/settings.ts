/**
 * FILE: src/app/actions/settings.ts
 * TYPE: Server Actions
 * WHY: Handle settings mutations with database persistence
 */

'use server'

import { revalidatePath } from 'next/cache'
import {
  updateNotificationSettings as dalUpdateNotifications,
  updateProfileSettings as dalUpdateProfile,
} from '@/lib/dal/settings'
import {
  type EmailTemplate,
  emailTemplateSchema,
  type NotificationSettings,
  notificationSettingsSchema,
  type ProfileSettings,
  profileSettingsSchema,
} from '@/lib/validations/settings'

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; errors?: Array<{ path: string[]; message: string }> }

// ============================================================================
// PROFILE SETTINGS
// ============================================================================

export async function updateProfileSettings(
  formData: FormData
): Promise<ActionResult<ProfileSettings>> {
  try {
    const rawData = {
      organizationName: formData.get('organizationName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone') || '',
      logoUrl: formData.get('logoUrl') || '',
      timezone: formData.get('timezone') || 'Europe/Rome',
      language: formData.get('language') || 'it',
      address: formData.get('address') || '',
      city: formData.get('city') || '',
      country: formData.get('country') || 'Italia',
      website: formData.get('website') || '',
    }

    const validated = profileSettingsSchema.parse(rawData)

    // Save to database via DAL
    const result = await dalUpdateProfile(validated)

    revalidatePath('/impostazioni')

    return { success: true, data: result.profile }
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Action] updateProfileSettings error:', error)
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Errore durante il salvataggio delle impostazioni' }
  }
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

export async function updateNotificationSettings(
  formData: FormData
): Promise<ActionResult<NotificationSettings>> {
  try {
    const rawData = {
      emailNotifications: formData.get('emailNotifications') === 'true',
      deadlineNotificationDays: Number(formData.get('deadlineNotificationDays')) || 7,
      paymentNotifications: formData.get('paymentNotifications') === 'true',
      weeklyDigest: formData.get('weeklyDigest') === 'true',
      digestDay: formData.get('digestDay') || 'monday',
      notifyOnRegistration: formData.get('notifyOnRegistration') === 'true',
      notifyOnCheckIn: formData.get('notifyOnCheckIn') === 'true',
      notifyOnSponsorPayment: formData.get('notifyOnSponsorPayment') === 'true',
    }

    const validated = notificationSettingsSchema.parse(rawData)

    // Save to database via DAL
    const result = await dalUpdateNotifications(validated)

    revalidatePath('/impostazioni')

    return { success: true, data: result.notifications }
  } catch (error) {
    if (error instanceof Error) {
      console.error('[Action] updateNotificationSettings error:', error)
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Errore durante il salvataggio delle notifiche' }
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export async function updateEmailTemplate(
  templateId: string,
  formData: FormData
): Promise<ActionResult<EmailTemplate>> {
  try {
    const rawData = {
      id: templateId,
      name: formData.get('name'),
      subject: formData.get('subject'),
      body: formData.get('body'),
      variables: JSON.parse((formData.get('variables') as string) || '[]'),
      isDefault: formData.get('isDefault') === 'true',
    }

    const validated = emailTemplateSchema.parse(rawData)

    // Note: Email templates are stored separately in emailTemplates table
    // For now, keep client-side handling until we implement full template CRUD
    // This action validates and returns the data, client stores in localStorage

    revalidatePath('/impostazioni')

    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Errore durante il salvataggio del template' }
  }
}

export async function resetEmailTemplate(_templateId: string): Promise<ActionResult> {
  try {
    // Note: Email templates reset handled client-side for now
    // Will implement full DB integration in future iteration

    revalidatePath('/impostazioni')

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Errore durante il reset del template' }
  }
}
