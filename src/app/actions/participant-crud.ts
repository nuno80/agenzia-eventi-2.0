/**
 * FILE: src/app/actions/participant-crud.ts
 *
 * SERVER ACTIONS: Participant CRUD Operations
 *
 * ACTIONS:
 * - createParticipant: Create new participant
 * - updateParticipant: Update existing participant
 * - deleteParticipant: Delete participant
 *
 * SECURITY:
 * - All actions validate input with Zod
 * - Event existence verification
 * - Automatic cache revalidation
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db, participants } from '@/db'
import {
  type CreateParticipantInput,
  createParticipantSchema,
  type DeleteParticipantInput,
  deleteParticipantSchema,
  type UpdateParticipantInput,
  updateParticipantSchema,
} from '@/lib/validations/participant-crud'

/**
 * Action Result Type
 */
type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// ============================================================================
// CREATE PARTICIPANT
// ============================================================================

/**
 * Create a new participant for an event
 */
export async function createParticipant(
  input: CreateParticipantInput
): Promise<ActionResult<{ participantId: string }>> {
  try {
    // 1. Validate input
    const validated = createParticipantSchema.parse(input)

    // 2. Verify event exists
    const event = await db.query.events.findFirst({
      where: (events, { eq }) => eq(events.id, validated.eventId),
    })

    if (!event) {
      return {
        success: false,
        error: 'Event not found',
      }
    }

    // 3. Create participant
    const [newParticipant] = await db
      .insert(participants)
      .values({
        eventId: validated.eventId,
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        phone: validated.phone || null,
        company: validated.company || null,
        jobTitle: validated.jobTitle || null,
        registrationStatus: validated.registrationStatus,
        ticketType: validated.ticketType || null,
        ticketPrice: validated.ticketPrice,
        paymentStatus: validated.paymentStatus,
        dietaryRequirements: validated.dietaryRequirements || null,
        specialNeeds: validated.specialNeeds || null,
        notes: validated.notes || null,
        registrationDate: new Date(),
      })
      .returning({ id: participants.id })

    // 4. Revalidate cache
    revalidatePath(`/eventi/${validated.eventId}/partecipanti`)
    revalidatePath(`/persone/partecipanti`)

    return {
      success: true,
      data: { participantId: newParticipant.id },
    }
  } catch (error) {
    console.error('[createParticipant] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create participant',
    }
  }
}

// ============================================================================
// UPDATE PARTICIPANT
// ============================================================================

/**
 * Update an existing participant
 */
export async function updateParticipant(
  input: UpdateParticipantInput
): Promise<ActionResult<{ participantId: string }>> {
  try {
    // 1. Validate input
    const validated = updateParticipantSchema.parse(input)

    // 2. Get existing participant
    const existing = await db.query.participants.findFirst({
      where: eq(participants.id, validated.id),
    })

    if (!existing) {
      return {
        success: false,
        error: 'Participant not found',
      }
    }

    // 3. Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (validated.firstName !== undefined) updateData.firstName = validated.firstName
    if (validated.lastName !== undefined) updateData.lastName = validated.lastName
    if (validated.email !== undefined) updateData.email = validated.email
    if (validated.phone !== undefined) updateData.phone = validated.phone
    if (validated.company !== undefined) updateData.company = validated.company
    if (validated.jobTitle !== undefined) updateData.jobTitle = validated.jobTitle
    if (validated.registrationStatus !== undefined)
      updateData.registrationStatus = validated.registrationStatus
    if (validated.ticketType !== undefined) updateData.ticketType = validated.ticketType
    if (validated.ticketPrice !== undefined) updateData.ticketPrice = validated.ticketPrice
    if (validated.paymentStatus !== undefined) updateData.paymentStatus = validated.paymentStatus
    if (validated.dietaryRequirements !== undefined)
      updateData.dietaryRequirements = validated.dietaryRequirements
    if (validated.specialNeeds !== undefined) updateData.specialNeeds = validated.specialNeeds
    if (validated.notes !== undefined) updateData.notes = validated.notes

    // 4. Update participant
    await db.update(participants).set(updateData).where(eq(participants.id, validated.id))

    // 5. Revalidate cache
    revalidatePath(`/eventi/${existing.eventId}/partecipanti`)
    revalidatePath(`/persone/partecipanti`)

    return {
      success: true,
      data: { participantId: validated.id },
    }
  } catch (error) {
    console.error('[updateParticipant] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update participant',
    }
  }
}

// ============================================================================
// DELETE PARTICIPANT
// ============================================================================

/**
 * Delete a participant
 */
export async function deleteParticipant(
  input: DeleteParticipantInput
): Promise<ActionResult<{ participantId: string }>> {
  try {
    // 1. Validate input
    const validated = deleteParticipantSchema.parse(input)

    // 2. Get participant to get eventId for cache revalidation
    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, validated.id),
    })

    if (!participant) {
      return {
        success: false,
        error: 'Participant not found',
      }
    }

    // 3. Delete participant
    await db.delete(participants).where(eq(participants.id, validated.id))

    // 4. Revalidate cache
    revalidatePath(`/eventi/${participant.eventId}/partecipanti`)
    revalidatePath(`/persone/partecipanti`)

    return {
      success: true,
      data: { participantId: validated.id },
    }
  } catch (error) {
    console.error('[deleteParticipant] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete participant',
    }
  }
}
