/**
 * FILE: src/lib/validations/communications.ts
 *
 * PURPOSE:
 * - Define Zod validation schemas for communications and email templates
 * - Used in Server Actions for input validation
 * - Ensures type safety and data integrity
 *
 * SCHEMAS:
 * - sendEmailSchema: For sending single emails
 * - bulkEmailSchema: For sending emails to multiple recipients
 * - emailTemplateSchema: For creating/updating email templates
 * - deleteTemplateSchema: For deleting templates
 *
 * USAGE:
 * import { sendEmailSchema } from '@/lib/validations/communications';
 * const validated = sendEmailSchema.parse(data);
 */

import { z } from 'zod'

/**
 * Send Email Schema
 * For sending a single email or bulk email
 */
export const sendEmailSchema = z.object({
  // Event context
  eventId: z.string().min(1, 'Event ID è richiesto'),

  // Recipient selection
  recipientType: z.enum(['all_participants', 'confirmed_only', 'speakers', 'sponsors', 'custom'], {
    errorMap: () => ({ message: 'Tipo destinatario non valido' }),
  }),

  // Custom recipients (only for recipientType = 'custom')
  customRecipients: z.array(z.string().email('Email non valida')).optional().nullable(),

  // Email content
  subject: z
    .string()
    .min(3, "L'oggetto deve contenere almeno 3 caratteri")
    .max(200, "L'oggetto non può superare 200 caratteri"),

  body: z
    .string()
    .min(10, 'Il corpo del messaggio deve contenere almeno 10 caratteri')
    .max(50000, 'Il corpo del messaggio non può superare 50.000 caratteri'),

  // Template (optional)
  templateId: z.string().optional().nullable(),

  // Scheduling (optional)
  scheduledDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .optional()
    .nullable(),

  // Notes
  notes: z.string().max(1000, 'Le note non possono superare 1000 caratteri').optional().nullable(),
})

/**
 * Bulk Email Schema
 * Extends sendEmailSchema for bulk operations
 */
export const bulkEmailSchema = sendEmailSchema.extend({
  // Recipient count for validation
  expectedRecipientCount: z
    .number()
    .int()
    .nonnegative('Il numero di destinatari deve essere maggiore o uguale a 0')
    .optional(),
})

/**
 * Email Template Schema
 * For creating/updating email templates
 */
export const emailTemplateSchema = z.object({
  // Template info
  name: z
    .string()
    .min(3, 'Il nome del template deve contenere almeno 3 caratteri')
    .max(100, 'Il nome del template non può superare 100 caratteri'),

  description: z
    .string()
    .max(500, 'La descrizione non può superare 500 caratteri')
    .optional()
    .nullable(),

  // Email content
  subject: z
    .string()
    .min(3, "L'oggetto deve contenere almeno 3 caratteri")
    .max(200, "L'oggetto non può superare 200 caratteri"),

  body: z
    .string()
    .min(10, 'Il corpo del messaggio deve contenere almeno 10 caratteri')
    .max(50000, 'Il corpo del messaggio non può superare 50.000 caratteri'),

  // Variables (JSON array of variable names)
  variables: z
    .array(z.string())
    .max(20, 'Non puoi aggiungere più di 20 variabili')
    .optional()
    .nullable()
    .transform((val) => (val ? JSON.stringify(val) : null)),

  // Category
  category: z
    .enum(['welcome', 'reminder', 'confirmation', 'update', 'thank_you', 'custom'])
    .default('custom'),

  // Scope
  eventId: z.string().optional().nullable(), // null = global template

  isDefault: z.boolean().default(false),
})

/**
 * Update Email Template Schema
 * Partial version for updating existing templates
 */
export const updateEmailTemplateSchema = emailTemplateSchema.partial().extend({
  id: z.string().min(1, 'Template ID è richiesto'),
})

/**
 * Delete Template Schema
 * For validating template deletion
 */
export const deleteTemplateSchema = z.object({
  templateId: z.string().min(1, 'Template ID è richiesto'),
})

/**
 * Delete Communication Schema
 * For validating communication deletion
 */
export const deleteCommunicationSchema = z.object({
  communicationId: z.string().min(1, 'Communication ID è richiesto'),
})

/**
 * Type inference from schemas
 */
export type SendEmailInput = z.infer<typeof sendEmailSchema>
export type BulkEmailInput = z.infer<typeof bulkEmailSchema>
export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>
export type DeleteTemplateInput = z.infer<typeof deleteTemplateSchema>
export type DeleteCommunicationInput = z.infer<typeof deleteCommunicationSchema>
