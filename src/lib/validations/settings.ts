/**
 * FILE: src/lib/validations/settings.ts
 * TYPE: Zod Validation Schemas
 * WHY: Type-safe validation for settings forms
 */

import { z } from 'zod'

// ============================================================================
// PROFILE SETTINGS
// ============================================================================

export const profileSettingsSchema = z.object({
  organizationName: z.string().min(2, 'Nome organizzazione richiesto').max(100),
  contactEmail: z.string().email('Email non valida'),
  contactPhone: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  timezone: z.string().default('Europe/Rome'),
  language: z.enum(['it', 'en']).default('it'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('Italia'),
  website: z.string().url().optional().or(z.literal('')),
})

export type ProfileSettings = z.infer<typeof profileSettingsSchema>

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  deadlineNotificationDays: z.number().int().min(1).max(30).default(7),
  paymentNotifications: z.boolean().default(true),
  weeklyDigest: z.boolean().default(false),
  digestDay: z.enum(['monday', 'friday']).default('monday'),
  notifyOnRegistration: z.boolean().default(true),
  notifyOnCheckIn: z.boolean().default(false),
  notifyOnSponsorPayment: z.boolean().default(true),
})

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

export const emailTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome template richiesto'),
  subject: z.string().min(1, 'Oggetto richiesto').max(200),
  body: z.string().min(10, 'Corpo email richiesto'),
  variables: z.array(z.string()).optional(),
  isDefault: z.boolean().default(false),
})

export type EmailTemplate = z.infer<typeof emailTemplateSchema>

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const defaultProfileSettings: ProfileSettings = {
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
}

export const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  deadlineNotificationDays: 7,
  paymentNotifications: true,
  weeklyDigest: false,
  digestDay: 'monday',
  notifyOnRegistration: true,
  notifyOnCheckIn: false,
  notifyOnSponsorPayment: true,
}

// ============================================================================
// DEFAULT EMAIL TEMPLATES
// ============================================================================

export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Benvenuto Partecipante',
    subject: 'Benvenuto a {{eventTitle}}!',
    body: `Ciao {{firstName}},

Grazie per esserti registrato a {{eventTitle}}!

Dettagli evento:
- Data: {{eventDate}}
- Luogo: {{eventLocation}}
- Orario: {{eventTime}}

Il tuo badge sarà disponibile all'ingresso.

A presto!
{{organizationName}}`,
    variables: [
      'firstName',
      'eventTitle',
      'eventDate',
      'eventLocation',
      'eventTime',
      'organizationName',
    ],
    isDefault: true,
  },
  {
    id: 'reminder',
    name: 'Promemoria Evento',
    subject: 'Promemoria: {{eventTitle}} è domani!',
    body: `Ciao {{firstName}},

Ti ricordiamo che {{eventTitle}} si terrà domani!

Dettagli:
- Data: {{eventDate}}
- Luogo: {{eventLocation}}
- Orario: {{eventTime}}

Non dimenticare di portare il tuo badge (QR code allegato).

Ci vediamo presto!
{{organizationName}}`,
    variables: [
      'firstName',
      'eventTitle',
      'eventDate',
      'eventLocation',
      'eventTime',
      'organizationName',
    ],
    isDefault: true,
  },
  {
    id: 'thank_you',
    name: 'Ringraziamento Post-Evento',
    subject: 'Grazie per aver partecipato a {{eventTitle}}',
    body: `Ciao {{firstName}},

Grazie per aver partecipato a {{eventTitle}}!

Speriamo che l'evento ti sia piaciuto. Se hai feedback o suggerimenti, rispondi pure a questa email.

A presto per i prossimi eventi!
{{organizationName}}`,
    variables: ['firstName', 'eventTitle', 'organizationName'],
    isDefault: true,
  },
]
