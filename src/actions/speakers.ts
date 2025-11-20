'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createBudgetItem, deleteBudgetItem, updateBudgetItem } from '@/app/actions/budget'
import { db, speakers } from '@/db'

const speakerSchema = z.object({
  firstName: z.string().min(1, 'Nome richiesto'),
  lastName: z.string().min(1, 'Cognome richiesto'),
  email: z.string().email('Email non valida'),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  photoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterHandle: z.string().optional(),
  sessionTitle: z.string().optional(),
  sessionDescription: z.string().optional(),
  sessionDate: z.string().optional(), // ISO string
  sessionDuration: z.coerce.number().optional(),
  confirmationStatus: z.enum(['invited', 'confirmed', 'declined', 'tentative']),
  travelRequired: z.coerce.boolean().optional(),
  accommodationRequired: z.coerce.boolean().optional(),
  fee: z.coerce.number().optional(),
  notes: z.string().optional(),
  budgetCategoryId: z.string().optional(), // For budget integration
})

export async function createSpeaker(eventId: string, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const validated = speakerSchema.parse(rawData)

    let budgetItemId: string | null = null

    // Budget Integration: Create item if category selected
    if (validated.budgetCategoryId) {
      try {
        const budgetResult = await createBudgetItem(validated.budgetCategoryId, eventId, {
          description: `Fee Relatore: ${validated.lastName} ${validated.firstName}`,
          estimatedCost: validated.fee || 0,
          actualCost: validated.fee || 0,
          vendor: validated.company || `${validated.firstName} ${validated.lastName}`,
          notes: 'Generato automaticamente dal modulo Relatori',
        })
        if (budgetResult.success && budgetResult.data?.id) {
          budgetItemId = budgetResult.data.id as string
        }
      } catch (error) {
        console.error('Failed to create budget item for speaker:', error)
        // Continue creating speaker even if budget fails
      }
    }

    await db.insert(speakers).values({
      eventId,
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone || null,
      title: validated.title || null,
      company: validated.company || null,
      jobTitle: validated.jobTitle || null,
      photoUrl: validated.photoUrl || null,
      websiteUrl: validated.websiteUrl || null,
      linkedinUrl: validated.linkedinUrl || null,
      twitterHandle: validated.twitterHandle || null,
      sessionTitle: validated.sessionTitle || null,
      sessionDescription: validated.sessionDescription || null,
      sessionDate: validated.sessionDate ? new Date(validated.sessionDate) : null,
      sessionDuration: validated.sessionDuration || null,
      confirmationStatus: validated.confirmationStatus,
      travelRequired: validated.travelRequired || false,
      accommodationRequired: validated.accommodationRequired || false,
      fee: validated.fee || 0,
      notes: validated.notes || null,
      budgetItemId: budgetItemId,
    })

    revalidatePath(`/eventi/${eventId}/relatori`)
    revalidatePath(`/eventi/${eventId}/budget`)
    return { success: true }
  } catch (error) {
    console.error('Failed to create speaker:', error)
    return { success: false, error: 'Errore durante la creazione del relatore' }
  }
}

export async function updateSpeaker(eventId: string, speakerId: string, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const validated = speakerSchema.parse(rawData)

    // Fetch existing speaker to check budget link
    const existingSpeaker = await db.query.speakers.findFirst({
      where: eq(speakers.id, speakerId),
    })

    if (!existingSpeaker) {
      return { success: false, error: 'Relatore non trovato' }
    }

    let budgetItemId = existingSpeaker.budgetItemId

    // Budget Integration
    if (budgetItemId) {
      // Update existing budget item
      try {
        await updateBudgetItem(budgetItemId, {
          description: `Fee Relatore: ${validated.lastName} ${validated.firstName}`,
          estimatedCost: validated.fee || 0,
          actualCost: validated.fee || 0,
          vendor: validated.company || `${validated.firstName} ${validated.lastName}`,
        })
      } catch (error) {
        console.error('Failed to update budget item:', error)
      }
    } else if (validated.budgetCategoryId) {
      // Create new budget item if not exists and category selected
      try {
        const budgetResult = await createBudgetItem(validated.budgetCategoryId, eventId, {
          description: `Fee Relatore: ${validated.lastName} ${validated.firstName}`,
          estimatedCost: validated.fee || 0,
          actualCost: validated.fee || 0,
          vendor: validated.company || `${validated.firstName} ${validated.lastName}`,
          notes: 'Generato automaticamente dal modulo Relatori',
        })
        if (budgetResult.success && budgetResult.data?.id) {
          budgetItemId = budgetResult.data.id as string
        }
      } catch (error) {
        console.error('Failed to create budget item for speaker:', error)
      }
    }

    await db
      .update(speakers)
      .set({
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        phone: validated.phone || null,
        title: validated.title || null,
        company: validated.company || null,
        jobTitle: validated.jobTitle || null,
        photoUrl: validated.photoUrl || null,
        websiteUrl: validated.websiteUrl || null,
        linkedinUrl: validated.linkedinUrl || null,
        twitterHandle: validated.twitterHandle || null,
        sessionTitle: validated.sessionTitle || null,
        sessionDescription: validated.sessionDescription || null,
        sessionDate: validated.sessionDate ? new Date(validated.sessionDate) : null,
        sessionDuration: validated.sessionDuration || null,
        confirmationStatus: validated.confirmationStatus,
        travelRequired: validated.travelRequired || false,
        accommodationRequired: validated.accommodationRequired || false,
        fee: validated.fee || 0,
        notes: validated.notes || null,
        budgetItemId: budgetItemId,
      })
      .where(eq(speakers.id, speakerId))

    revalidatePath(`/eventi/${eventId}/relatori`)
    revalidatePath(`/eventi/${eventId}/budget`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update speaker:', error)
    return { success: false, error: "Errore durante l'aggiornamento del relatore" }
  }
}

export async function deleteSpeaker(eventId: string, speakerId: string) {
  try {
    // Fetch existing speaker to check budget link
    const existingSpeaker = await db.query.speakers.findFirst({
      where: eq(speakers.id, speakerId),
    })

    if (existingSpeaker?.budgetItemId) {
      try {
        await deleteBudgetItem(existingSpeaker.budgetItemId)
      } catch (error) {
        console.error('Failed to delete linked budget item:', error)
      }
    }

    await db.delete(speakers).where(eq(speakers.id, speakerId))

    revalidatePath(`/eventi/${eventId}/relatori`)
    revalidatePath(`/eventi/${eventId}/budget`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete speaker:', error)
    return { success: false, error: "Errore durante l'eliminazione del relatore" }
  }
}
