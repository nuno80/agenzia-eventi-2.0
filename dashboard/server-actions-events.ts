// ============================================================================
// SERVER ACTIONS - EVENTS MUTATIONS
// ============================================================================
// FILE: src/app/actions/events.ts
//
// PURPOSE: Handle all event data mutations (create, update, delete)
// BENEFITS:
// - Type-safe mutations
// - Input validation with Zod
// - Automatic cache revalidation
// - Error handling
//
// USAGE:
// In Client Components:
//   import { createEvent } from '@/app/actions/events';
//   const result = await createEvent(formData);
// ============================================================================

'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { events } from '@/lib/db/schema'
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  type CreateEventInput,
  type UpdateEventInput,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Standard action result type
 * Provides consistent response format
 */
export type ActionResult<T = any> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new event
 *
 * VALIDATION: Uses Zod schema for input validation
 * CACHE: Revalidates /eventi and dashboard paths
 *
 * @param formData - FormData or object with event data
 * @returns ActionResult with created event or error
 *
 * @example
 * // In a Client Component form:
 * async function handleSubmit(formData: FormData) {
 *   const result = await createEvent(formData);
 *   if (result.success) {
 *     router.push(`/eventi/${result.data.id}`);
 *   } else {
 *     setError(result.error);
 *   }
 * }
 */
export async function createEvent(
  input: FormData | CreateEventInput
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    // 1. Extract data from FormData or use object directly
    let data: any

    if (input instanceof FormData) {
      data = {
        name: input.get('name') as string,
        type: input.get('type') as string,
        description: input.get('description') as string,
        location: input.get('location') as string,
        startDate: new Date(input.get('startDate') as string),
        endDate: new Date(input.get('endDate') as string),
        capacity: parseInt(input.get('capacity') as string),
        budget: parseFloat(input.get('budget') as string),
        status: (input.get('status') as string) || 'draft',
      }
    } else {
      data = input
    }

    // 2. Validate input with Zod
    const validatedData = createEventSchema.parse(data)

    // 3. Insert into database
    const [newEvent] = await db
      .insert(events)
      .values({
        ...validatedData,
        registeredCount: 0,
        spent: 0,
      })
      .returning()

    // 4. Revalidate cache
    revalidatePath('/eventi')
    revalidatePath('/')
    revalidateTag('events')

    // 5. Return success response
    return {
      success: true,
      data: {
        id: newEvent.id,
        name: newEvent.name,
      },
      message: 'Evento creato con successo',
    }
  } catch (error) {
    console.error('Error creating event:', error)

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any
      return {
        success: false,
        error: 'Errori di validazione',
        fieldErrors: zodError.flatten().fieldErrors,
      }
    }

    // Handle generic errors
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore durante la creazione dell'evento",
    }
  }
}

/**
 * Duplicate an existing event
 *
 * @param eventId - ID of event to duplicate
 * @returns ActionResult with new event ID
 *
 * @example
 * const result = await duplicateEvent('evt_123');
 */
export async function duplicateEvent(eventId: string): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Fetch original event
    const originalEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    })

    if (!originalEvent) {
      return {
        success: false,
        error: 'Evento non trovato',
      }
    }

    // 2. Create duplicate with modified name
    const [duplicatedEvent] = await db
      .insert(events)
      .values({
        name: `${originalEvent.name} (Copia)`,
        type: originalEvent.type,
        description: originalEvent.description,
        location: originalEvent.location,
        startDate: originalEvent.startDate,
        endDate: originalEvent.endDate,
        capacity: originalEvent.capacity,
        budget: originalEvent.budget,
        status: 'draft', // Always start as draft
        registeredCount: 0,
        spent: 0,
      })
      .returning()

    // 3. Revalidate cache
    revalidatePath('/eventi')
    revalidateTag('events')

    return {
      success: true,
      data: { id: duplicatedEvent.id },
      message: 'Evento duplicato con successo',
    }
  } catch (error) {
    console.error('Error duplicating event:', error)
    return {
      success: false,
      error: "Errore durante la duplicazione dell'evento",
    }
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update an existing event
 *
 * VALIDATION: Uses Zod schema
 * CACHE: Revalidates event detail page and lists
 *
 * @param input - FormData or object with event data (must include id)
 * @returns ActionResult with updated event
 *
 * @example
 * const result = await updateEvent({ id: 'evt_123', name: 'New Name' });
 */
export async function updateEvent(
  input: FormData | UpdateEventInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Extract data
    let data: any

    if (input instanceof FormData) {
      data = {
        id: input.get('id') as string,
        name: (input.get('name') as string) || undefined,
        type: (input.get('type') as string) || undefined,
        description: (input.get('description') as string) || undefined,
        location: (input.get('location') as string) || undefined,
        startDate: input.get('startDate') ? new Date(input.get('startDate') as string) : undefined,
        endDate: input.get('endDate') ? new Date(input.get('endDate') as string) : undefined,
        capacity: input.get('capacity') ? parseInt(input.get('capacity') as string) : undefined,
        budget: input.get('budget') ? parseFloat(input.get('budget') as string) : undefined,
        status: (input.get('status') as string) || undefined,
      }

      // Remove undefined values
      Object.keys(data).forEach((key) => data[key] === undefined && delete data[key])
    } else {
      data = input
    }

    // 2. Validate input
    const validatedData = updateEventSchema.parse(data)
    const { id, ...updateData } = validatedData

    // 3. Check if event exists
    const existingEvent = await db.query.events.findFirst({
      where: eq(events.id, id!),
    })

    if (!existingEvent) {
      return {
        success: false,
        error: 'Evento non trovato',
      }
    }

    // 4. Update database
    await db
      .update(events)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id!))

    // 5. Revalidate cache
    revalidatePath(`/eventi/${id}`)
    revalidatePath('/eventi')
    revalidatePath('/')
    revalidateTag('events')

    return {
      success: true,
      data: { id: id! },
      message: 'Evento aggiornato con successo',
    }
  } catch (error) {
    console.error('Error updating event:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      const zodError = error as any
      return {
        success: false,
        error: 'Errori di validazione',
        fieldErrors: zodError.flatten().fieldErrors,
      }
    }

    return {
      success: false,
      error: "Errore durante l'aggiornamento dell'evento",
    }
  }
}

/**
 * Update event status only
 *
 * @param id - Event ID
 * @param status - New status
 * @returns ActionResult
 *
 * @example
 * await updateEventStatus('evt_123', 'active');
 */
export async function updateEventStatus(
  id: string,
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled'
): Promise<ActionResult> {
  try {
    // 1. Validate input
    const validatedData = updateEventStatusSchema.parse({ id, status })

    // 2. Update database
    await db
      .update(events)
      .set({
        status: validatedData.status,
        updatedAt: new Date(),
      })
      .where(eq(events.id, validatedData.id))

    // 3. Revalidate cache
    revalidatePath(`/eventi/${id}`)
    revalidatePath('/eventi')
    revalidatePath('/')
    revalidateTag('events')

    return {
      success: true,
      message: 'Stato evento aggiornato con successo',
    }
  } catch (error) {
    console.error('Error updating event status:', error)
    return {
      success: false,
      error: "Errore durante l'aggiornamento dello stato",
    }
  }
}

/**
 * Update event budget spent amount
 *
 * @param id - Event ID
 * @param spent - Amount spent
 * @returns ActionResult
 *
 * @example
 * await updateEventBudget('evt_123', 45000);
 */
export async function updateEventBudget(id: string, spent: number): Promise<ActionResult> {
  try {
    // 1. Validate spent is non-negative
    if (spent < 0) {
      return {
        success: false,
        error: "L'importo speso non può essere negativo",
      }
    }

    // 2. Update database
    await db
      .update(events)
      .set({
        spent,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))

    // 3. Revalidate cache
    revalidatePath(`/eventi/${id}/budget`)
    revalidatePath('/finance')
    revalidateTag('events')

    return {
      success: true,
      message: 'Budget aggiornato con successo',
    }
  } catch (error) {
    console.error('Error updating event budget:', error)
    return {
      success: false,
      error: "Errore durante l'aggiornamento del budget",
    }
  }
}

/**
 * Update registered participants count
 *
 * @param id - Event ID
 * @param count - New participant count
 * @returns ActionResult
 *
 * @example
 * await updateParticipantCount('evt_123', 125);
 */
export async function updateParticipantCount(id: string, count: number): Promise<ActionResult> {
  try {
    // 1. Validate count is non-negative
    if (count < 0) {
      return {
        success: false,
        error: 'Il numero di partecipanti non può essere negativo',
      }
    }

    // 2. Get event to check capacity
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    })

    if (!event) {
      return {
        success: false,
        error: 'Evento non trovato',
      }
    }

    if (count > event.capacity) {
      return {
        success: false,
        error: `Il numero di partecipanti non può superare la capacità (${event.capacity})`,
      }
    }

    // 3. Update database
    await db
      .update(events)
      .set({
        registeredCount: count,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))

    // 4. Revalidate cache
    revalidatePath(`/eventi/${id}`)
    revalidatePath('/eventi')
    revalidateTag('events')

    return {
      success: true,
      message: 'Numero partecipanti aggiornato con successo',
    }
  } catch (error) {
    console.error('Error updating participant count:', error)
    return {
      success: false,
      error: "Errore durante l'aggiornamento del numero di partecipanti",
    }
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete an event (soft delete)
 *
 * @param id - Event ID to delete
 * @returns ActionResult
 *
 * @example
 * const result = await deleteEvent('evt_123');
 * if (result.success) router.push('/eventi');
 */
export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    // 1. Check if event exists
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    })

    if (!event) {
      return {
        success: false,
        error: 'Evento non trovato',
      }
    }

    // 2. Soft delete (set deletedAt timestamp)
    // If you want hard delete, use: await db.delete(events).where(eq(events.id, id));
    await db
      .update(events)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))

    // 3. Revalidate cache
    revalidatePath('/eventi')
    revalidatePath('/')
    revalidateTag('events')

    return {
      success: true,
      message: 'Evento eliminato con successo',
    }
  } catch (error) {
    console.error('Error deleting event:', error)
    return {
      success: false,
      error: "Errore durante l'eliminazione dell'evento",
    }
  }
}

/**
 * Permanently delete an event (hard delete)
 * Use with caution - this cannot be undone!
 *
 * @param id - Event ID to delete
 * @returns ActionResult
 *
 * @example
 * const result = await permanentlyDeleteEvent('evt_123');
 */
export async function permanentlyDeleteEvent(id: string): Promise<ActionResult> {
  try {
    // 1. Check if event exists
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    })

    if (!event) {
      return {
        success: false,
        error: 'Evento non trovato',
      }
    }

    // 2. Hard delete from database
    await db.delete(events).where(eq(events.id, id))

    // 3. Revalidate cache
    revalidatePath('/eventi')
    revalidatePath('/')
    revalidateTag('events')

    return {
      success: true,
      message: 'Evento eliminato permanentemente',
    }
  } catch (error) {
    console.error('Error permanently deleting event:', error)
    return {
      success: false,
      error: "Errore durante l'eliminazione permanente dell'evento",
    }
  }
}

/**
 * Restore a soft-deleted event
 *
 * @param id - Event ID to restore
 * @returns ActionResult
 *
 * @example
 * const result = await restoreEvent('evt_123');
 */
export async function restoreEvent(id: string): Promise<ActionResult> {
  try {
    // 1. Update deletedAt to null
    await db
      .update(events)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))

    // 2. Revalidate cache
    revalidatePath('/eventi')
    revalidatePath('/')
    revalidateTag('events')

    return {
      success: true,
      message: 'Evento ripristinato con successo',
    }
  } catch (error) {
    console.error('Error restoring event:', error)
    return {
      success: false,
      error: "Errore durante il ripristino dell'evento",
    }
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk update event status
 *
 * @param ids - Array of event IDs
 * @param status - New status
 * @returns ActionResult
 *
 * @example
 * await bulkUpdateStatus(['evt_1', 'evt_2'], 'cancelled');
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled'
): Promise<ActionResult> {
  try {
    if (ids.length === 0) {
      return {
        success: false,
        error: 'Nessun evento selezionato',
      }
    }

    // Update all events with given IDs
    for (const id of ids) {
      await db
        .update(events)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
    }

    // Revalidate cache
    revalidatePath('/eventi')
    revalidatePath('/')
    revalidateTag('events')

    return {
      success: true,
      message: `${ids.length} eventi aggiornati con successo`,
    }
  } catch (error) {
    console.error('Error bulk updating events:', error)
    return {
      success: false,
      error: "Errore durante l'aggiornamento multiplo",
    }
  }
}

/**
 * Bulk delete events
 *
 * @param ids - Array of event IDs
 * @returns ActionResult
 *
 * @example
 * await bulkDeleteEvents(['evt_1', 'evt_2']);
 */
export async function bulkDeleteEvents(ids: string[]): Promise<ActionResult> {
  try {
    if (ids.length === 0) {
      return {
        success: false,
        error: 'Nessun evento selezionato',
      }
    }

    // Soft delete all events
    for (const id of ids) {
      await db
        .update(events)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
    }

    // Revalidate cache
    revalidatePath('/eventi')
    revalidatePath('/')
    revalidateTag('events')

    return {
      success: true,
      message: `${ids.length} eventi eliminati con successo`,
    }
  } catch (error) {
    console.error('Error bulk deleting events:', error)
    return {
      success: false,
      error: "Errore durante l'eliminazione multipla",
    }
  }
}

// ============================================================================
// EXPORT FUNCTIONS (for reports)
// ============================================================================

/**
 * Generate and download event report (Excel)
 *
 * @param id - Event ID
 * @returns ActionResult with download URL
 *
 * @example
 * const result = await exportEventToExcel('evt_123');
 * if (result.success) window.open(result.data.url);
 */
export async function exportEventToExcel(id: string): Promise<ActionResult<{ url: string }>> {
  try {
    // TODO: Implement Excel export logic
    // 1. Fetch event with all related data
    // 2. Generate Excel file using a library like exceljs
    // 3. Upload to blob storage (vercel-blob)
    // 4. Return download URL

    return {
      success: false,
      error: 'Export Excel non ancora implementato',
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return {
      success: false,
      error: "Errore durante l'export",
    }
  }
}

/**
 * Generate and download event report (PDF)
 *
 * @param id - Event ID
 * @returns ActionResult with download URL
 *
 * @example
 * const result = await exportEventToPDF('evt_123');
 */
export async function exportEventToPDF(id: string): Promise<ActionResult<{ url: string }>> {
  try {
    // TODO: Implement PDF export logic
    // 1. Fetch event with all related data
    // 2. Generate PDF using a library like pdfkit or react-pdf
    // 3. Upload to blob storage
    // 4. Return download URL

    return {
      success: false,
      error: 'Export PDF non ancora implementato',
    }
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    return {
      success: false,
      error: "Errore durante l'export",
    }
  }
}

// ============================================================================
// USAGE EXAMPLES IN CLIENT COMPONENTS
// ============================================================================

/*
// Example 1: Create event from form
"use client";
import { createEvent } from '@/app/actions/events';
import { useRouter } from 'next/navigation';

function CreateEventForm() {
  const router = useRouter();
  
  async function handleSubmit(formData: FormData) {
    const result = await createEvent(formData);
    
    if (result.success) {
      router.push(`/eventi/${result.data.id}`);
    } else {
      console.error(result.error);
      // Show error to user
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <button type="submit">Crea</button>
    </form>
  );
}

// Example 2: Update event status with button
"use client";
import { updateEventStatus } from '@/app/actions/events';

function StatusButton({ eventId, currentStatus }) {
  async function handleClick() {
    const result = await updateEventStatus(eventId, 'active');
    if (result.success) {
      // Show success message
    }
  }
  
  return <button onClick={handleClick}>Attiva Evento</button>;
}

// Example 3: Delete with confirmation
"use client";
import { deleteEvent } from '@/app/actions/events';

function DeleteButton({ eventId }) {
  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questo evento?')) return;
    
    const result = await deleteEvent(eventId);
    if (result.success) {
      router.push('/eventi');
    }
  }
  
  return <button onClick={handleDelete}>Elimina</button>;
}
*/
