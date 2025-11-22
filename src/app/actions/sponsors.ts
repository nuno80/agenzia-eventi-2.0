'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { budgetCategories, db, sponsors } from '@/db'
import { createSponsorSchema, updateSponsorSchema } from '@/lib/validations/sponsors'
import { createBudgetItem, deleteBudgetItem, updateBudgetItem } from './budget'

export type ActionResult = {
  success: boolean
  message: string
  data?: Record<string, unknown>
  errors?: Record<string, string[]>
}

/**
 * Ensure "Entrate" (Income) budget category exists for the event
 */
async function ensureIncomeCategory(eventId: string): Promise<string> {
  // Try to find existing category
  const existing = await db.query.budgetCategories.findFirst({
    where: (categories, { and, eq, like }) =>
      and(eq(categories.eventId, eventId), like(categories.name, '%Entrate%')),
  })

  if (existing) return existing.id

  // Create if not exists
  const [newCategory] = await db
    .insert(budgetCategories)
    .values({
      eventId,
      name: 'Entrate',
      description: 'Sponsorizzazioni e vendita biglietti',
      color: '#10B981', // Emerald
      icon: 'wallet',
      allocatedAmount: 0,
      spentAmount: 0,
    })
    .returning()

  return newCategory.id
}

export async function createSponsor(eventId: string, data: unknown): Promise<ActionResult> {
  try {
    const validated = createSponsorSchema.parse(data)

    // 1. Create Sponsor
    const [newSponsor] = await db
      .insert(sponsors)
      .values({
        ...validated,
        eventId,
      })
      .returning()

    // 2. Budget Integration
    // Only if amount > 0
    if (validated.sponsorshipAmount > 0) {
      try {
        const categoryId = await ensureIncomeCategory(eventId)

        const budgetResult = await createBudgetItem(categoryId, eventId, {
          description: `Sponsor: ${validated.companyName}`,
          estimatedCost: validated.sponsorshipAmount, // For income, estimated is expected revenue
          actualCost:
            validated.paymentStatus === 'paid'
              ? validated.sponsorshipAmount
              : validated.paymentStatus === 'partial'
                ? validated.sponsorshipAmount / 2
                : 0, // Rough approx for partial
          status: validated.paymentStatus === 'paid' ? 'paid' : 'planned',
          paymentDate: validated.paymentDate,
          vendor: validated.companyName,
        })

        if (budgetResult.success && budgetResult.data?.id) {
          // Link sponsor to budget item
          await db
            .update(sponsors)
            .set({ budgetItemId: budgetResult.data.id as string })
            .where(eq(sponsors.id, newSponsor.id))
        }
      } catch (err) {
        console.error('Failed to create linked budget item:', err)
        // Don't fail the whole action, just log
      }
    }

    try {
      revalidatePath(`/eventi/${eventId}/persone/sponsor`)
      revalidatePath(`/eventi/${eventId}/budget`)
    } catch (e) {
      console.warn('revalidatePath failed:', e)
    }

    return { success: true, message: 'Sponsor creato con successo' }
  } catch (error) {
    console.error('Create sponsor error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: 'Errore durante la creazione dello sponsor' }
  }
}

export async function updateSponsor(sponsorId: string, data: unknown): Promise<ActionResult> {
  try {
    const validated = updateSponsorSchema.parse(data)

    const [currentSponsor] = await db.select().from(sponsors).where(eq(sponsors.id, sponsorId))
    if (!currentSponsor) return { success: false, message: 'Sponsor non trovato' }

    // 1. Update Sponsor
    await db
      .update(sponsors)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(sponsors.id, sponsorId))

    // 2. Budget Integration
    if (currentSponsor.budgetItemId) {
      // Update existing budget item
      await updateBudgetItem(currentSponsor.budgetItemId, {
        description: `Sponsor: ${validated.companyName ?? currentSponsor.companyName}`,
        estimatedCost: validated.sponsorshipAmount ?? currentSponsor.sponsorshipAmount,
        actualCost:
          (validated.paymentStatus ?? currentSponsor.paymentStatus) === 'paid'
            ? (validated.sponsorshipAmount ?? currentSponsor.sponsorshipAmount)
            : (validated.paymentStatus ?? currentSponsor.paymentStatus) === 'partial'
              ? (validated.sponsorshipAmount ?? currentSponsor.sponsorshipAmount) / 2
              : 0,
        status:
          (validated.paymentStatus ?? currentSponsor.paymentStatus) === 'paid' ? 'paid' : 'planned',
        paymentDate: validated.paymentDate ?? currentSponsor.paymentDate,
        vendor: validated.companyName ?? currentSponsor.companyName,
      })
    } else if ((validated.sponsorshipAmount ?? currentSponsor.sponsorshipAmount) > 0) {
      // Create new budget item if it didn't exist but now we have amount
      try {
        const categoryId = await ensureIncomeCategory(currentSponsor.eventId)
        const amount = validated.sponsorshipAmount ?? currentSponsor.sponsorshipAmount
        const status = validated.paymentStatus ?? currentSponsor.paymentStatus
        const name = validated.companyName ?? currentSponsor.companyName

        const budgetResult = await createBudgetItem(categoryId, currentSponsor.eventId, {
          description: `Sponsor: ${name}`,
          estimatedCost: amount,
          actualCost: status === 'paid' ? amount : status === 'partial' ? amount / 2 : 0,
          status: status === 'paid' ? 'paid' : 'planned',
          paymentDate: validated.paymentDate ?? currentSponsor.paymentDate,
          vendor: name,
        })

        if (budgetResult.success && budgetResult.data?.id) {
          await db
            .update(sponsors)
            .set({ budgetItemId: budgetResult.data.id as string })
            .where(eq(sponsors.id, sponsorId))
        }
      } catch (err) {
        console.error('Failed to create linked budget item on update:', err)
      }
    }

    try {
      revalidatePath(`/eventi/${currentSponsor.eventId}/persone/sponsor`)
      revalidatePath(`/eventi/${currentSponsor.eventId}/budget`)
    } catch (e) {
      console.warn('revalidatePath failed:', e)
    }

    return { success: true, message: 'Sponsor aggiornato con successo' }
  } catch (error) {
    console.error('Update sponsor error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'aggiornamento dello sponsor" }
  }
}

export async function deleteSponsor(sponsorId: string): Promise<ActionResult> {
  try {
    const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, sponsorId))
    if (!sponsor) return { success: false, message: 'Sponsor non trovato' }

    // 1. Delete Budget Item if exists
    if (sponsor.budgetItemId) {
      await deleteBudgetItem(sponsor.budgetItemId)
    }

    // 2. Delete Sponsor
    await db.delete(sponsors).where(eq(sponsors.id, sponsorId))

    try {
      revalidatePath(`/eventi/${sponsor.eventId}/persone/sponsor`)
      revalidatePath(`/eventi/${sponsor.eventId}/budget`)
    } catch (e) {
      console.warn('revalidatePath failed:', e)
    }

    return { success: true, message: 'Sponsor eliminato con successo' }
  } catch (error) {
    console.error('Delete sponsor error:', error)
    return { success: false, message: "Errore durante l'eliminazione dello sponsor" }
  }
}
