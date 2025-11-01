/**
 * FILE: src/app/actions/events.ts
 *
 * PURPOSE:
 * - Server Actions for event mutations (create, update, delete)
 * - All actions validate input with Zod schemas
 * - Revalidate cache after mutations
 * - Return consistent ActionResult type
 *
 * ACTIONS:
 * - createEvent: Create new event
 * - updateEvent: Update existing event
 * - deleteEvent: Delete event
 * - updateEventStatus: Quick status change
 *
 * USAGE:
 * import { createEvent } from '@/app/actions/events';
 * const result = await createEvent(formData);
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/db'
import { events } from '@/db'
import { createEventSchema, updateEventSchema } from '@/lib/validations/events'

/**
 * Action Result Type
 * Consistent return type for all actions
 */
type ActionResult = {
  success: boolean
  message: string
  data?: any
  errors?: Record<string, string[]>
}

/**
 * Create Event Action
 *
 * @param formData - FormData or plain object with event data
 * @returns ActionResult with new event ID or errors
 */
export async function createEvent(formData: FormData | Record<string, any>): Promise<ActionResult> {
  try {
    // Convert FormData to object if needed
    let data: Record<string, any>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)

      // Handle checkboxes (FormData doesn't include unchecked boxes)
      data.isPublic = formData.has('isPublic')
      data.requiresApproval = formData.has('requiresApproval')

      // Parse numbers
      if (data.maxParticipants) {
        data.maxParticipants = parseInt(data.maxParticipants as string)
      }
      if (data.totalBudget) {
        data.totalBudget = parseFloat(data.totalBudget as string)
      }

      // Parse tags if present
      if (data.tags && typeof data.tags === 'string') {
        try {
          data.tags = JSON.parse(data.tags)
        } catch {
          data.tags = data.tags.split(',').map((t: string) => t.trim())
        }
      }
    } else {
      data = formData
    }

    // Validate with Zod
    const validated = createEventSchema.parse(data)

    // Insert into database
    const [newEvent] = await db
      .insert(events)
      .values({
        ...validated,
        currentParticipants: 0,
        currentSpent: 0,
      })
      .returning()

    // Revalidate cache
    revalidatePath('/eventi')
    revalidatePath('/')

    return {
      success: true,
      message: 'Evento creato con successo',
      data: { id: newEvent.id },
    }
  } catch (error) {
    console.error('Create event error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    return {
      success: false,
      message: "Errore durante la creazione dell'evento",
    }
  }
}

/**
 * Update Event Action
 *
 * @param eventId - Event ID to update
 * @param formData - FormData or plain object with event data
 * @returns ActionResult
 */
export async function updateEvent(
  eventId: string,
  formData: FormData | Record<string, any>
): Promise<ActionResult> {
  try {
    // Convert FormData to object if needed
    let data: Record<string, any>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)

      // Handle checkboxes
      data.isPublic = formData.has('isPublic')
      data.requiresApproval = formData.has('requiresApproval')

      // Parse numbers
      if (data.maxParticipants) {
        data.maxParticipants = parseInt(data.maxParticipants as string)
      }
      if (data.totalBudget) {
        data.totalBudget = parseFloat(data.totalBudget as string)
      }

      // Parse tags if present
      if (data.tags && typeof data.tags === 'string') {
        try {
          data.tags = JSON.parse(data.tags)
        } catch {
          data.tags = data.tags.split(',').map((t: string) => t.trim())
        }
      }
    } else {
      data = formData
    }

    // Validate with Zod (partial schema)
    const validated = updateEventSchema.parse(data)

    // Update in database
    await db
      .update(events)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))

    // Revalidate cache
    revalidatePath('/eventi')
    revalidatePath(`/eventi/${eventId}`)
    revalidatePath('/')

    return {
      success: true,
      message: 'Evento aggiornato con successo',
    }
  } catch (error) {
    console.error('Update event error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    return {
      success: false,
      message: "Errore durante l'aggiornamento dell'evento",
    }
  }
}

/**
 * Delete Event Action
 *
 * @param eventId - Event ID to delete
 * @returns ActionResult
 */
export async function deleteEvent(eventId: string): Promise<ActionResult> {
  try {
    // Delete from database (cascade will delete related records)
    await db.delete(events).where(eq(events.id, eventId))

    // Revalidate cache
    revalidatePath('/eventi')
    revalidatePath('/')

    return {
      success: true,
      message: 'Evento eliminato con successo',
    }
  } catch (error) {
    console.error('Delete event error:', error)

    return {
      success: false,
      message: "Errore durante l'eliminazione dell'evento",
    }
  }
}

/**
 * Update Event Status Action
 * Quick action to change only the status
 *
 * @param eventId - Event ID
 * @param status - New status
 * @returns ActionResult
 */
export async function updateEventStatus(
  eventId: string,
  status: 'draft' | 'planning' | 'open' | 'ongoing' | 'completed' | 'cancelled'
): Promise<ActionResult> {
  try {
    await db
      .update(events)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))

    // Revalidate cache
    revalidatePath('/eventi')
    revalidatePath(`/eventi/${eventId}`)
    revalidatePath('/')

    return {
      success: true,
      message: 'Status aggiornato con successo',
    }
  } catch (error) {
    console.error('Update status error:', error)

    return {
      success: false,
      message: "Errore durante l'aggiornamento dello status",
    }
  }
}

/**
 * Duplicate Event Action
 * Creates a complete copy of an existing event
 * Includes: speakers, sponsors, budget categories/items, services, agenda
 * Excludes: participants (they change every year)
 *
 * @param eventId - Event ID to duplicate
 * @returns ActionResult with new event ID
 */
export async function duplicateEvent(eventId: string): Promise<ActionResult> {
  try {
    // Get original event with all relations
    const [originalEvent] = await db.select().from(events).where(eq(events.id, eventId))

    if (!originalEvent) {
      return {
        success: false,
        message: 'Evento non trovato',
      }
    }

    // Import relations from schema
    const { speakers, sponsors, budgetCategories, budgetItems, services, agenda, deadlines } =
      await import('@/db')

    // Create duplicate event
    const { id, createdAt, updatedAt, currentParticipants, currentSpent, ...eventData } =
      originalEvent

    const [newEvent] = await db
      .insert(events)
      .values({
        ...eventData,
        title: `${eventData.title} (Copia)`,
        status: 'draft',
        currentParticipants: 0,
        currentSpent: 0,
        // Update dates to next year if in the past
        startDate: new Date(
          new Date(eventData.startDate).setFullYear(new Date(eventData.startDate).getFullYear() + 1)
        ),
        endDate: new Date(
          new Date(eventData.endDate).setFullYear(new Date(eventData.endDate).getFullYear() + 1)
        ),
        registrationOpenDate: eventData.registrationOpenDate
          ? new Date(
              new Date(eventData.registrationOpenDate).setFullYear(
                new Date(eventData.registrationOpenDate).getFullYear() + 1
              )
            )
          : null,
        registrationCloseDate: eventData.registrationCloseDate
          ? new Date(
              new Date(eventData.registrationCloseDate).setFullYear(
                new Date(eventData.registrationCloseDate).getFullYear() + 1
              )
            )
          : null,
      })
      .returning()

    // Duplicate speakers
    const originalSpeakers = await db.select().from(speakers).where(eq(speakers.eventId, eventId))

    if (originalSpeakers.length > 0) {
      const speakersToInsert = originalSpeakers.map(
        ({ id, createdAt, updatedAt, eventId: _, ...speakerData }) => ({
          ...speakerData,
          eventId: newEvent.id,
          confirmationStatus: 'invited' as const, // Reset to invited
          presentationUploaded: false,
          presentationUrl: null,
        })
      )
      await db.insert(speakers).values(speakersToInsert)
    }

    // Duplicate sponsors
    const originalSponsors = await db.select().from(sponsors).where(eq(sponsors.eventId, eventId))

    if (originalSponsors.length > 0) {
      const sponsorsToInsert = originalSponsors.map(
        ({ id, createdAt, updatedAt, eventId: _, ...sponsorData }) => ({
          ...sponsorData,
          eventId: newEvent.id,
          contractSigned: false, // Reset contract status
          contractDate: null,
          paymentStatus: 'pending' as const,
          paymentDate: null,
        })
      )
      await db.insert(sponsors).values(sponsorsToInsert)
    }

    // Duplicate budget categories and items
    const originalCategories = await db
      .select()
      .from(budgetCategories)
      .where(eq(budgetCategories.eventId, eventId))

    for (const category of originalCategories) {
      const {
        id: oldCategoryId,
        createdAt,
        updatedAt,
        eventId: _,
        spentAmount,
        ...categoryData
      } = category

      const [newCategory] = await db
        .insert(budgetCategories)
        .values({
          ...categoryData,
          eventId: newEvent.id,
          spentAmount: 0, // Reset spent amount
        })
        .returning()

      // Duplicate items for this category
      const originalItems = await db
        .select()
        .from(budgetItems)
        .where(eq(budgetItems.categoryId, oldCategoryId))

      if (originalItems.length > 0) {
        const itemsToInsert = originalItems.map(
          ({
            id,
            createdAt,
            updatedAt,
            categoryId: _,
            eventId: __,
            actualCost,
            status,
            paymentDate,
            invoiceNumber,
            invoiceUrl,
            ...itemData
          }) => ({
            ...itemData,
            categoryId: newCategory.id,
            eventId: newEvent.id,
            actualCost: null,
            status: 'planned' as const, // Reset to planned
            paymentDate: null,
            invoiceNumber: null,
            invoiceUrl: null,
          })
        )
        await db.insert(budgetItems).values(itemsToInsert)
      }
    }

    // Duplicate services
    const originalServices = await db.select().from(services).where(eq(services.eventId, eventId))

    if (originalServices.length > 0) {
      const servicesToInsert = originalServices.map(
        ({
          id,
          createdAt,
          updatedAt,
          eventId: _,
          contractStatus,
          finalPrice,
          deliveryDate,
          paymentStatus,
          ...serviceData
        }) => ({
          ...serviceData,
          eventId: newEvent.id,
          contractStatus: 'requested' as const, // Reset to requested
          finalPrice: null,
          deliveryDate: null,
          paymentStatus: 'pending' as const,
        })
      )
      await db.insert(services).values(servicesToInsert)
    }

    // Duplicate agenda (update dates to next year)
    const originalAgenda = await db.select().from(agenda).where(eq(agenda.eventId, eventId))

    if (originalAgenda.length > 0) {
      const agendaToInsert = originalAgenda.map(
        ({ id, createdAt, updatedAt, eventId: _, startTime, endTime, status, ...agendaData }) => ({
          ...agendaData,
          eventId: newEvent.id,
          startTime: new Date(
            new Date(startTime).setFullYear(new Date(startTime).getFullYear() + 1)
          ),
          endTime: new Date(new Date(endTime).setFullYear(new Date(endTime).getFullYear() + 1)),
          status: 'scheduled' as const,
        })
      )
      await db.insert(agenda).values(agendaToInsert)
    }

    // Duplicate deadlines (update dates to next year)
    const originalDeadlines = await db
      .select()
      .from(deadlines)
      .where(eq(deadlines.eventId, eventId))

    if (originalDeadlines.length > 0) {
      const deadlinesToInsert = originalDeadlines.map(
        ({
          id,
          createdAt,
          updatedAt,
          eventId: _,
          dueDate,
          status,
          completedDate,
          ...deadlineData
        }) => ({
          ...deadlineData,
          eventId: newEvent.id,
          dueDate: new Date(new Date(dueDate).setFullYear(new Date(dueDate).getFullYear() + 1)),
          status: 'pending' as const,
          completedDate: null,
        })
      )
      await db.insert(deadlines).values(deadlinesToInsert)
    }

    // Revalidate cache
    revalidatePath('/eventi')

    return {
      success: true,
      message: 'Evento duplicato con successo',
      data: { id: newEvent.id },
    }
  } catch (error) {
    console.error('Duplicate event error:', error)

    return {
      success: false,
      message: "Errore durante la duplicazione dell'evento",
    }
  }
}
