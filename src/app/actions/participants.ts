/**
 * FILE: src/app/actions/participants.ts
 *
 * SERVER ACTIONS: Participant QR Code & Check-in Management
 *
 * ACTIONS:
 * - generateQRCode: Generate QR code for single participant
 * - generateBulkQRCodes: Generate QR codes for all event participants
 * - checkInParticipant: Process QR scan and mark participant as checked-in
 * - manualCheckIn: Manual check-in fallback (no QR required)
 * - undoCheckIn: Undo check-in (admin action)
 *
 * SECURITY:
 * - All actions validate input with Zod
 * - QR codes use checksum to prevent tampering
 * - Check-in validates participant belongs to event
 * - Prevents duplicate check-ins
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db, participants } from '@/db'
import { generateQRData, validateQRData } from '@/lib/utils/qr'
import {
  type BulkGenerateQRRequest,
  bulkGenerateQRSchema,
  type CheckInRequest,
  checkInSchema,
  type GenerateQRRequest,
  generateQRSchema,
  type UndoCheckInRequest,
  undoCheckInSchema,
} from '@/lib/validations/participants'

/**
 * Action Result Type
 */
type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// ============================================================================
// QR CODE GENERATION
// ============================================================================

/**
 * Generate QR code for a single participant
 */
export async function generateQRCode(
  request: GenerateQRRequest
): Promise<ActionResult<{ qrCode: string }>> {
  try {
    // 1. Validate input
    const validated = generateQRSchema.parse(request)

    // 2. Get participant
    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, validated.participantId),
    })

    if (!participant) {
      return {
        success: false,
        error: 'Participant not found',
      }
    }

    // 3. Generate QR data
    const qrData = generateQRData(participant.id, participant.eventId)

    // 4. Update database
    await db
      .update(participants)
      .set({
        qrCode: qrData,
        badgeGenerated: true,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, participant.id))

    // 5. Revalidate cache
    revalidatePath(`/eventi/${participant.eventId}/partecipanti`)
    revalidatePath(`/eventi/${participant.eventId}/checkin`)

    return {
      success: true,
      data: { qrCode: qrData },
    }
  } catch (error) {
    console.error('[generateQRCode] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate QR code',
    }
  }
}

/**
 * Generate QR codes for all participants of an event
 */
export async function generateBulkQRCodes(
  request: BulkGenerateQRRequest
): Promise<ActionResult<{ count: number }>> {
  try {
    // 1. Validate input
    const validated = bulkGenerateQRSchema.parse(request)

    // 2. Get all participants for event
    const eventParticipants = await db.query.participants.findMany({
      where: eq(participants.eventId, validated.eventId),
    })

    if (eventParticipants.length === 0) {
      return {
        success: false,
        error: 'No participants found for this event',
      }
    }

    // 3. Generate QR codes for all participants
    let successCount = 0

    for (const participant of eventParticipants) {
      try {
        const qrData = generateQRData(participant.id, participant.eventId)

        await db
          .update(participants)
          .set({
            qrCode: qrData,
            badgeGenerated: true,
            updatedAt: new Date(),
          })
          .where(eq(participants.id, participant.id))

        successCount++
      } catch (error) {
        console.error(`[generateBulkQRCodes] Failed for participant ${participant.id}:`, error)
        // Continue with next participant
      }
    }

    // 4. Revalidate cache
    revalidatePath(`/eventi/${validated.eventId}/partecipanti`)
    revalidatePath(`/eventi/${validated.eventId}/checkin`)

    return {
      success: true,
      data: { count: successCount },
    }
  } catch (error) {
    console.error('[generateBulkQRCodes] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate QR codes',
    }
  }
}

// ============================================================================
// CHECK-IN MANAGEMENT
// ============================================================================

/**
 * Check-in participant via QR code scan
 */
export async function checkInParticipant(qrCodeData: string): Promise<
  ActionResult<{
    participant: {
      id: string
      firstName: string
      lastName: string
      company: string | null
      ticketType: string | null
    }
  }>
> {
  try {
    // 1. Validate QR data
    const validation = validateQRData(qrCodeData)

    if (!validation.valid || !validation.data) {
      return {
        success: false,
        error: validation.error || 'Invalid QR code',
      }
    }

    const { participantId, eventId } = validation.data

    // 2. Get participant
    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, participantId),
    })

    if (!participant) {
      return {
        success: false,
        error: 'Participant not found',
      }
    }

    // 3. Verify participant belongs to event
    if (participant.eventId !== eventId) {
      return {
        success: false,
        error: 'Participant does not belong to this event',
      }
    }

    // 4. Check if already checked-in
    if (participant.checkedIn) {
      return {
        success: false,
        error: `${participant.firstName} ${participant.lastName} is already checked-in`,
      }
    }

    // 5. Mark as checked-in
    const now = new Date()

    await db
      .update(participants)
      .set({
        checkedIn: true,
        checkinTime: now,
        updatedAt: now,
      })
      .where(eq(participants.id, participantId))

    // 6. Revalidate cache
    revalidatePath(`/eventi/${eventId}/partecipanti`)
    revalidatePath(`/eventi/${eventId}/checkin`)

    return {
      success: true,
      data: {
        participant: {
          id: participant.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          company: participant.company,
          ticketType: participant.ticketType,
        },
      },
    }
  } catch (error) {
    console.error('[checkInParticipant] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Check-in failed',
    }
  }
}

/**
 * Manual check-in (fallback when QR not available)
 */
export async function manualCheckIn(
  request: CheckInRequest
): Promise<ActionResult<{ participantName: string }>> {
  try {
    // 1. Validate input
    const validated = checkInSchema.parse(request)

    // 2. Get participant
    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, validated.participantId),
    })

    if (!participant) {
      return {
        success: false,
        error: 'Participant not found',
      }
    }

    // 3. Verify participant belongs to event
    if (participant.eventId !== validated.eventId) {
      return {
        success: false,
        error: 'Participant does not belong to this event',
      }
    }

    // 4. Check if already checked-in
    if (participant.checkedIn) {
      return {
        success: false,
        error: `${participant.firstName} ${participant.lastName} is already checked-in`,
      }
    }

    // 5. Mark as checked-in
    const now = validated.timestamp || new Date()

    await db
      .update(participants)
      .set({
        checkedIn: true,
        checkinTime: now,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, validated.participantId))

    // 6. Revalidate cache
    revalidatePath(`/eventi/${validated.eventId}/partecipanti`)
    revalidatePath(`/eventi/${validated.eventId}/checkin`)

    return {
      success: true,
      data: {
        participantName: `${participant.firstName} ${participant.lastName}`,
      },
    }
  } catch (error) {
    console.error('[manualCheckIn] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Manual check-in failed',
    }
  }
}

/**
 * Undo check-in (admin action)
 */
export async function undoCheckIn(
  request: UndoCheckInRequest
): Promise<ActionResult<{ participantName: string }>> {
  try {
    // 1. Validate input
    const validated = undoCheckInSchema.parse(request)

    // 2. Get participant
    const participant = await db.query.participants.findFirst({
      where: eq(participants.id, validated.participantId),
    })

    if (!participant) {
      return {
        success: false,
        error: 'Participant not found',
      }
    }

    // 3. Check if not checked-in
    if (!participant.checkedIn) {
      return {
        success: false,
        error: `${participant.firstName} ${participant.lastName} is not checked-in`,
      }
    }

    // 4. Undo check-in
    await db
      .update(participants)
      .set({
        checkedIn: false,
        checkinTime: null,
        updatedAt: new Date(),
      })
      .where(eq(participants.id, validated.participantId))

    // 5. Revalidate cache
    revalidatePath(`/eventi/${participant.eventId}/partecipanti`)
    revalidatePath(`/eventi/${participant.eventId}/checkin`)

    return {
      success: true,
      data: {
        participantName: `${participant.firstName} ${participant.lastName}`,
      },
    }
  } catch (error) {
    console.error('[undoCheckIn] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Undo check-in failed',
    }
  }
}
