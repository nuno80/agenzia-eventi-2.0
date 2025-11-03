/**
 * FILE: src/app/actions/events.ts
 * PURPOSE: Event mutations (create, update, delete, duplicate) with robust parsing & normalization
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, events } from '@/db'
import { getEventsForDuplicate } from '@/lib/dal/events'
import { createEventSchema, updateEventSchema } from '@/lib/validations/events'

export type ActionResult = {
  success: boolean
  message: string
  data?: any
  errors?: Record<string, string[]>
}

function normalizeTags(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input as string[]
  const raw = String(input).trim()
  if (!raw) return []
  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      // fallthrough to CSV
    }
  }
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function normalizeEmptyStringsToNull(obj: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    if (Object.hasOwn(obj, key)) {
      const val = obj[key]
      if (typeof val === 'string' && val.trim() === '') {
        obj[key] = null
      }
    }
  }
}

const OPTIONAL_STRING_FIELDS = [
  'description',
  'tagline',
  'venue',
  'address',
  'city',
  'category',
  'imageUrl',
  'websiteUrl',
  'notes',
]

export async function createEvent(formData: FormData | Record<string, any>): Promise<ActionResult> {
  try {
    let data: Record<string, any>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)
      data.isPublic = formData.has('isPublic')
      data.requiresApproval = formData.has('requiresApproval')

      if (data.maxParticipants) data.maxParticipants = parseInt(data.maxParticipants as string, 10)
      if (data.totalBudget) data.totalBudget = parseFloat(data.totalBudget as string)

      // Normalize optional empty strings to null (so url(), max() optional fields pass)
      normalizeEmptyStringsToNull(data, OPTIONAL_STRING_FIELDS)

      if (typeof data.tags === 'string' || Array.isArray(data.tags)) {
        data.tags = normalizeTags(data.tags)
      }
    } else {
      data = { ...formData }
      normalizeEmptyStringsToNull(data, OPTIONAL_STRING_FIELDS)
      if (typeof data.tags === 'string' || Array.isArray(data.tags)) {
        data.tags = normalizeTags(data.tags)
      }
    }

    const validated = createEventSchema.parse(data)

    const [newEvent] = await db
      .insert(events)
      .values({
        ...validated,
        currentParticipants: 0,
        currentSpent: 0,
      })
      .returning()

    revalidatePath('/eventi')
    revalidatePath('/')

    return { success: true, message: 'Evento creato con successo', data: { id: newEvent.id } }
  } catch (error) {
    console.error('Create event error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante la creazione dell'evento" }
  }
}

export async function updateEvent(
  eventId: string,
  formData: FormData | Record<string, any>
): Promise<ActionResult> {
  try {
    let data: Record<string, any>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)
      data.isPublic = formData.has('isPublic')
      data.requiresApproval = formData.has('requiresApproval')

      if (data.maxParticipants) data.maxParticipants = parseInt(data.maxParticipants as string, 10)
      if (data.totalBudget) data.totalBudget = parseFloat(data.totalBudget as string)

      normalizeEmptyStringsToNull(data, OPTIONAL_STRING_FIELDS)

      if (typeof data.tags === 'string' || Array.isArray(data.tags)) {
        data.tags = normalizeTags(data.tags)
      }
    } else {
      data = { ...formData }
      normalizeEmptyStringsToNull(data, OPTIONAL_STRING_FIELDS)
      if (typeof data.tags === 'string' || Array.isArray(data.tags)) {
        data.tags = normalizeTags(data.tags)
      }
    }

    const validated = updateEventSchema.parse(data)

    await db
      .update(events)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))

    revalidatePath('/eventi')
    revalidatePath(`/eventi/${eventId}`)
    revalidatePath('/')

    return { success: true, message: 'Evento aggiornato con successo' }
  } catch (error) {
    console.error('Update event error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'aggiornamento dell'evento" }
  }
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  try {
    await db.delete(events).where(eq(events.id, eventId))
    revalidatePath('/eventi')
    revalidatePath('/')
    return { success: true, message: 'Evento eliminato con successo' }
  } catch (error) {
    console.error('Delete event error:', error)
    return { success: false, message: "Errore durante l'eliminazione dell'evento" }
  }
}

export async function updateEventStatus(
  eventId: string,
  status: 'draft' | 'planning' | 'open' | 'ongoing' | 'completed' | 'cancelled'
): Promise<ActionResult> {
  try {
    await db.update(events).set({ status, updatedAt: new Date() }).where(eq(events.id, eventId))

    revalidatePath('/eventi')
    revalidatePath(`/eventi/${eventId}`)
    revalidatePath('/')

    return { success: true, message: 'Status aggiornato con successo' }
  } catch (error) {
    console.error('Update status error:', error)
    return { success: false, message: "Errore durante l'aggiornamento dello status" }
  }
}

export async function listEventsForDuplicate(params?: { search?: string; year?: number }) {
  // Returns minimal DTO for client selector
  const results = await getEventsForDuplicate(params)
  return results
}

/**
 * Duplicate Event Action
 * Creates a copy of an existing event and duplicates related entities
 */
export async function duplicateEvent(eventId: string): Promise<ActionResult> {
  try {
    // Fetch original event
    const [originalEvent] = await db.select().from(events).where(eq(events.id, eventId))
    if (!originalEvent) {
      return { success: false, message: 'Evento non trovato' }
    }

    // Import related tables lazily to reduce initial bundle
    const { speakers, sponsors, budgetCategories, budgetItems, services, agenda, deadlines } =
      await import('@/db')

    // Prepare new base event data
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
          confirmationStatus: 'invited' as const,
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
          contractSigned: false,
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
        .values({ ...categoryData, eventId: newEvent.id, spentAmount: 0 })
        .returning()

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
            status: 'planned' as const,
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
          contractStatus: 'requested' as const,
          finalPrice: null,
          deliveryDate: null,
          paymentStatus: 'pending' as const,
        })
      )
      await db.insert(services).values(servicesToInsert)
    }

    // Duplicate agenda (shift dates by +1 year)
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

    // Duplicate deadlines (shift dates by +1 year)
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

    revalidatePath('/eventi')

    return { success: true, message: 'Evento duplicato con successo', data: { id: newEvent.id } }
  } catch (error) {
    console.error('Duplicate event error:', error)
    return { success: false, message: "Errore durante la duplicazione dell'evento" }
  }
}
