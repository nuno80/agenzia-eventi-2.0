/**
 * FILE: src/app/actions/communications.ts
 * PURPOSE: Communications mutations (send email, manage templates) with validation
 */

'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { z } from 'zod'
import { communications, db, emailTemplates, events, participants, speakers, sponsors } from '@/db'
import {
  bulkEmailSchema,
  deleteCommunicationSchema,
  deleteTemplateSchema,
  emailTemplateSchema,
  sendEmailSchema,
  updateEmailTemplateSchema,
} from '@/lib/validations/communications'

const resend = new Resend(process.env.RESEND_API_KEY)

export type ActionResult = {
  success: boolean
  message: string
  data?: Record<string, unknown>
  errors?: Record<string, string[]>
}

// ============================================================================
// EMAIL SENDING ACTIONS
// ============================================================================

/**
 * Send email using Resend
 */

async function sendEmailViaResend(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[RESEND] Missing API Key. Falling back to mock.')
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`)
    return { success: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Event Manager <onboarding@resend.dev>', // Default Resend testing domain
      to: [to],
      subject: subject,
      html: body.replace(/\n/g, '<br>'), // Simple newline to BR conversion
    })

    if (error) {
      console.error('[RESEND] Error sending email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[RESEND] Exception sending email:', error)
    return { success: false, error: "Eccezione durante l'invio" }
  }
}

/**
 * Substitute variables in email content
 * Replaces {{variableName}} with actual values
 */
function substituteVariables(
  content: string,
  variables: Record<string, string | number | Date>
): string {
  let result = content

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    const stringValue = value instanceof Date ? value.toLocaleDateString('it-IT') : String(value)
    result = result.replace(regex, stringValue)
  }

  return result
}

/**
 * Get recipient data for variable substitution
 */
async function getRecipientData(
  eventId: string,
  recipientType: 'all_participants' | 'confirmed_only' | 'speakers' | 'sponsors' | 'custom'
): Promise<Array<{ email: string; firstName: string; lastName: string; company?: string }>> {
  switch (recipientType) {
    case 'all_participants':
    case 'confirmed_only': {
      const allParticipants = await db.query.participants.findMany({
        where: eq(participants.eventId, eventId),
        columns: {
          email: true,
          firstName: true,
          lastName: true,
          company: true,
          registrationStatus: true,
        },
      })

      const filtered =
        recipientType === 'confirmed_only'
          ? allParticipants.filter((p) => p.registrationStatus === 'confirmed')
          : allParticipants

      return filtered.map((p) => ({
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        company: p.company || undefined,
      }))
    }
    case 'speakers': {
      const allSpeakers = await db.query.speakers.findMany({
        where: eq(speakers.eventId, eventId),
        columns: {
          email: true,
          firstName: true,
          lastName: true,
          company: true,
        },
      })
      return allSpeakers.map((s) => ({
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        company: s.company || undefined,
      }))
    }
    case 'sponsors': {
      const allSponsors = await db.query.sponsors.findMany({
        where: eq(sponsors.eventId, eventId),
        columns: {
          email: true,
          companyName: true,
          contactPerson: true,
        },
      })
      return allSponsors.map((s) => ({
        email: s.email,
        firstName: s.contactPerson?.split(' ')[0] || 'Gentile',
        lastName: s.contactPerson?.split(' ').slice(1).join(' ') || 'Cliente',
        company: s.companyName,
      }))
    }
    default:
      return []
  }
}

/**
 * Send Email Action
 * Sends email to selected recipients with optional template
 */
export async function sendEmail(
  formData: FormData | Record<string, unknown>
): Promise<ActionResult> {
  try {
    // Parse form data
    const data = formData instanceof FormData ? Object.fromEntries(formData) : formData

    // Validate input
    const validated = sendEmailSchema.parse(data)

    // Get event data for variable substitution
    const event = await db.query.events.findFirst({
      where: eq(events.id, validated.eventId),
    })

    if (!event) {
      return { success: false, message: 'Evento non trovato' }
    }

    // Get recipients
    const recipients = await getRecipientData(validated.eventId, validated.recipientType)

    if (recipients.length === 0) {
      return { success: false, message: 'Nessun destinatario trovato' }
    }

    // Prepare email content with variable substitution
    const eventVariables = {
      eventTitle: event.title,
      eventDate: event.startDate,
      eventLocation: event.location,
      eventVenue: event.venue || event.location,
    }

    // Send emails
    let successCount = 0
    let lastError = ''

    for (const recipient of recipients) {
      const personalizedSubject = substituteVariables(validated.subject, {
        ...eventVariables,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        company: recipient.company || '',
      })

      const personalizedBody = substituteVariables(validated.body, {
        ...eventVariables,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        company: recipient.company || '',
      })

      const result = await sendEmailViaResend(
        recipient.email,
        personalizedSubject,
        personalizedBody
      )

      // Add delay to respect Resend rate limit (2 req/sec)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (result.success) {
        successCount++
      } else {
        lastError = result.error || 'Errore sconosciuto'
      }
    }

    // If all failed, return error
    if (successCount === 0 && recipients.length > 0) {
      return {
        success: false,
        message: `Invio fallito. Errore: ${lastError}`,
      }
    }

    // Create communication record
    const [communication] = await db
      .insert(communications)
      .values({
        eventId: validated.eventId,
        subject: validated.subject,
        body: validated.body,
        recipientType: validated.recipientType,
        recipientCount: recipients.length, // Total attempted
        status: successCount > 0 ? (validated.scheduledDate ? 'scheduled' : 'sent') : 'failed',
        scheduledDate: validated.scheduledDate || null,
        sentDate: validated.scheduledDate ? null : new Date(),
        templateUsed: validated.templateId || null,
        notes: validated.notes || null,
        openRate: 0,
        clickRate: 0,
      })
      .returning()

    // Update template usage count if template was used
    if (validated.templateId) {
      await db
        .update(emailTemplates)
        .set({
          usageCount: sql`${emailTemplates.usageCount} + 1`,
          lastUsedAt: new Date(),
        })
        .where(eq(emailTemplates.id, validated.templateId))
    }

    revalidatePath(`/eventi/${validated.eventId}/comunicazioni`)
    revalidatePath(`/eventi/${validated.eventId}`)

    const partialSuccessMessage =
      successCount < recipients.length ? ` (Inviate: ${successCount}/${recipients.length})` : ''

    return {
      success: true,
      message: `Email inviata con successo${partialSuccessMessage}`,
      data: { communicationId: communication.id, recipientCount: successCount },
    }
  } catch (error) {
    console.error('Send email error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'invio dell'email" }
  }
}

/**
 * Send Bulk Email Action
 * Same as sendEmail but with additional validation for bulk operations
 */
export async function sendBulkEmail(
  formData: FormData | Record<string, unknown>
): Promise<ActionResult> {
  try {
    const data = formData instanceof FormData ? Object.fromEntries(formData) : formData

    const validated = bulkEmailSchema.parse(data)

    // Use the same logic as sendEmail
    return await sendEmail(validated)
  } catch (error) {
    console.error('Send bulk email error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'invio dell'email" }
  }
}

// ============================================================================
// EMAIL TEMPLATE ACTIONS
// ============================================================================

/**
 * Save Email Template Action
 * Creates or updates an email template
 */
export async function saveEmailTemplate(
  formData: FormData | Record<string, unknown>
): Promise<ActionResult> {
  try {
    const data = formData instanceof FormData ? Object.fromEntries(formData) : formData

    // Check if this is an update (has id) or create (no id)
    const isUpdate = 'id' in data && data.id

    if (isUpdate) {
      const validated = updateEmailTemplateSchema.parse(data)
      const { id, ...updateData } = validated

      await db
        .update(emailTemplates)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(emailTemplates.id, id as string))

      revalidatePath('/eventi')

      return { success: true, message: 'Template aggiornato con successo', data: { id } }
    } else {
      const validated = emailTemplateSchema.parse(data)

      const [template] = await db.insert(emailTemplates).values(validated).returning()

      revalidatePath('/eventi')

      return {
        success: true,
        message: 'Template creato con successo',
        data: { id: template.id },
      }
    }
  } catch (error) {
    console.error('Save template error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: 'Errore durante il salvataggio del template' }
  }
}

/**
 * Delete Email Template Action
 * Deletes an email template
 */
export async function deleteEmailTemplate(templateId: string): Promise<ActionResult> {
  try {
    const validated = deleteTemplateSchema.parse({ templateId })

    // Check if template is in use
    const usageCount = await db.query.communications.findMany({
      where: eq(communications.templateUsed, validated.templateId),
    })

    if (usageCount.length > 0) {
      return {
        success: false,
        message: `Impossibile eliminare: template utilizzato in ${usageCount.length} comunicazioni`,
      }
    }

    await db.delete(emailTemplates).where(eq(emailTemplates.id, validated.templateId))

    revalidatePath('/eventi')

    return { success: true, message: 'Template eliminato con successo' }
  } catch (error) {
    console.error('Delete template error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'eliminazione del template" }
  }
}

// ============================================================================
// COMMUNICATION MANAGEMENT ACTIONS
// ============================================================================

/**
 * Delete Communication Action
 * Deletes a communication record
 */
export async function deleteCommunication(communicationId: string): Promise<ActionResult> {
  try {
    const validated = deleteCommunicationSchema.parse({ communicationId })

    // Get communication to find eventId for revalidation
    const communication = await db.query.communications.findFirst({
      where: eq(communications.id, validated.communicationId),
    })

    if (!communication) {
      return { success: false, message: 'Comunicazione non trovata' }
    }

    await db.delete(communications).where(eq(communications.id, validated.communicationId))

    revalidatePath(`/eventi/${communication.eventId}/comunicazioni`)
    revalidatePath(`/eventi/${communication.eventId}`)

    return { success: true, message: 'Comunicazione eliminata con successo' }
  } catch (error) {
    console.error('Delete communication error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'eliminazione della comunicazione" }
  }
}
