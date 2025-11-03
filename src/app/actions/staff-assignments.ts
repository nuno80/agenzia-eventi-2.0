/**
 * FILE: src/app/actions/staffAssignments.ts
 *
 * PURPOSE:
 * - Server Actions for staff assignments and payments
 * - Handle payment status updates
 * - Calculate payment due dates
 * - Manage assignment lifecycle
 *
 * ACTIONS:
 * - createAssignment: Create new staff assignment
 * - updateAssignment: Update existing assignment
 * - deleteAssignment: Delete assignment
 * - markPaid: Mark payment as complete
 * - postponePayment: Change payment due date
 * - cancelPayment: Remove a mistakenly recorded payment
 * - updateAssignmentStatus: Quick status change
 *
 * USAGE:
 * import { createAssignment, markPaid } from '@/app/actions/staffAssignments';
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, staffAssignments } from '@/db'
import { calculatePaymentDueDate, calculatePaymentStatus } from '@/lib/utils'
import {
  createStaffAssignmentSchema,
  markPaidSchema,
  postponePaymentSchema,
  cancelPaymentSchema,
  updateStaffAssignmentSchema,
} from '@/lib/validations/staff-assignments'

type ActionResult = {
  success: boolean
  message: string
  data?: Record<string, unknown>
  errors?: Record<string, string[]>
}

/**
 * Create Staff Assignment Action
 */
export async function createAssignment(
  formData: FormData | Record<string, unknown>
): Promise<ActionResult> {
  try {
    let data: Record<string, unknown>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)

      if (data.paymentAmount) {
        data.paymentAmount = parseFloat(data.paymentAmount as string)
      }
    } else {
      data = formData
    }

    // Validate
    const validated = createStaffAssignmentSchema.parse(data)

    // Calculate payment due date if not custom
    let paymentDueDate = validated.paymentDueDate
    if (validated.paymentTerms !== 'custom' && validated.paymentAmount) {
      paymentDueDate = calculatePaymentDueDate(
        validated.endTime as Date,
        validated.paymentTerms as 'immediate' | '30_days' | '60_days' | '90_days'
      )
    }

    // Calculate initial payment status
    const paymentStatus = calculatePaymentStatus(
      paymentDueDate ?? null,
      null,
      validated.assignmentStatus
    )

    // Insert
    const [newAssignment] = await db
      .insert(staffAssignments)
      .values({
        ...validated,
        paymentDueDate,
        paymentStatus,
      })
      .returning()

    // Revalidate
    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${validated.staffId}`)
    revalidatePath(`/eventi/${validated.eventId}/staff`)

    return {
      success: true,
      message: 'Assegnazione creata con successo',
      data: { id: newAssignment.id },
    }
  } catch (error) {
    console.error('Create assignment error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    return {
      success: false,
      message: "Errore durante la creazione dell'assegnazione",
    }
  }
}

/**
 * Update Staff Assignment Action
 */
export async function updateAssignment(
  assignmentId: string,
  formData: FormData | Record<string, unknown>
): Promise<ActionResult> {
  try {
    let data: Record<string, unknown>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)

      if (data.paymentAmount) {
        data.paymentAmount = parseFloat(data.paymentAmount as string)
      }
    } else {
      data = formData
    }

    // Validate
    const validated = updateStaffAssignmentSchema.parse(data)

    // Get current assignment for eventId/staffId
    const [current] = await db
      .select()
      .from(staffAssignments)
      .where(eq(staffAssignments.id, assignmentId))

    if (!current) {
      return {
        success: false,
        message: 'Assegnazione non trovata',
      }
    }

    // Recalculate payment status if relevant fields changed
    let paymentStatus = current.paymentStatus
    if (validated.assignmentStatus || validated.paymentDueDate) {
      paymentStatus = calculatePaymentStatus(
        validated.paymentDueDate || current.paymentDueDate,
        current.paymentDate,
        validated.assignmentStatus || current.assignmentStatus
      )
    }

    // Update
    await db
      .update(staffAssignments)
      .set({
        ...validated,
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(staffAssignments.id, assignmentId))

    // Revalidate
    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${current.staffId}`)
    revalidatePath(`/eventi/${current.eventId}/staff`)

    return {
      success: true,
      message: 'Assegnazione aggiornata con successo',
    }
  } catch (error) {
    console.error('Update assignment error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    return {
      success: false,
      message: "Errore durante l'aggiornamento",
    }
  }
}

/**
 * Delete Staff Assignment Action
 */
export async function deleteAssignment(assignmentId: string): Promise<ActionResult> {
  try {
    // Get assignment for cache invalidation
    const [assignment] = await db
      .select()
      .from(staffAssignments)
      .where(eq(staffAssignments.id, assignmentId))

    if (!assignment) {
      return {
        success: false,
        message: 'Assegnazione non trovata',
      }
    }

    // Delete
    await db.delete(staffAssignments).where(eq(staffAssignments.id, assignmentId))

    // Revalidate
    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${assignment.staffId}`)
    revalidatePath(`/eventi/${assignment.eventId}/staff`)

    return {
      success: true,
      message: 'Assegnazione eliminata con successo',
    }
  } catch (error) {
    console.error('Delete assignment error:', error)

    return {
      success: false,
      message: "Errore durante l'eliminazione",
    }
  }
}

/**
 * Mark Payment as Paid Action
 */
export async function markPaid(data: FormData | Record<string, unknown>): Promise<ActionResult> {
  try {
    let parsed: Record<string, unknown>

    if (data instanceof FormData) {
      parsed = Object.fromEntries(data)
    } else {
      parsed = data
    }

    // Validate
    const validated = markPaidSchema.parse(parsed)

    // Get assignment
    const [assignment] = await db
      .select()
      .from(staffAssignments)
      .where(eq(staffAssignments.id, validated.assignmentId))

    if (!assignment) {
      return {
        success: false,
        message: 'Assegnazione non trovata',
      }
    }

    // Update
    await db
      .update(staffAssignments)
      .set({
        paymentStatus: 'paid',
        paymentDate: validated.paymentDate,
        paymentNotes: validated.paymentNotes || assignment.paymentNotes,
        invoiceNumber: validated.invoiceNumber || assignment.invoiceNumber,
        invoiceUrl: validated.invoiceUrl || assignment.invoiceUrl,
        updatedAt: new Date(),
      })
      .where(eq(staffAssignments.id, validated.assignmentId))

    // Revalidate
    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${assignment.staffId}`)
    revalidatePath(`/eventi/${assignment.eventId}/staff`)
    revalidatePath('/')

    return {
      success: true,
      message: 'Pagamento registrato con successo',
    }
  } catch (error) {
    console.error('Mark paid error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    return {
      success: false,
      message: 'Errore durante la registrazione del pagamento',
    }
  }
}

/**
 * Postpone Payment Action
 */
export async function postponePayment(
  data: FormData | Record<string, unknown>
): Promise<ActionResult> {
  try {
    let parsed: Record<string, unknown>

    if (data instanceof FormData) {
      parsed = Object.fromEntries(data)
    } else {
      parsed = data
    }

    // Validate
    const validated = postponePaymentSchema.parse(parsed)

    // Get assignment
    const [assignment] = await db
      .select()
      .from(staffAssignments)
      .where(eq(staffAssignments.id, validated.assignmentId))

    if (!assignment) {
      return {
        success: false,
        message: 'Assegnazione non trovata',
      }
    }

    // Calculate new status
    const newStatus = calculatePaymentStatus(
      validated.newDueDate,
      assignment.paymentDate,
      assignment.assignmentStatus
    )

    // Append reason to notes
    const updatedNotes = validated.reason
      ? `${assignment.paymentNotes || ''}\n\nPosticipato al ${validated.newDueDate.toLocaleDateString('it-IT')}: ${validated.reason}`.trim()
      : assignment.paymentNotes

    // Update
    await db
      .update(staffAssignments)
      .set({
        paymentDueDate: validated.newDueDate,
        paymentStatus: newStatus,
        paymentNotes: updatedNotes,
        updatedAt: new Date(),
      })
      .where(eq(staffAssignments.id, validated.assignmentId))

    // Revalidate
    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${assignment.staffId}`)
    revalidatePath(`/eventi/${assignment.eventId}/staff`)

    return {
      success: true,
      message: 'Scadenza pagamento posticipata con successo',
    }
  } catch (error) {
    console.error('Postpone payment error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    return {
      success: false,
      message: 'Errore durante il posticipo del pagamento',
    }
  }
}

/**
 * Cancel Payment Action
 */
export async function cancelPayment(data: FormData | Record<string, unknown>): Promise<ActionResult> {
  try {
    const parsed = data instanceof FormData ? Object.fromEntries(data) : data
    const validated = cancelPaymentSchema.parse(parsed)

    const [assignment] = await db
      .select()
      .from(staffAssignments)
      .where(eq(staffAssignments.id, validated.assignmentId))

    if (!assignment) {
      return { success: false, message: 'Assegnazione non trovata' }
    }

    // Clear payment info and recalculate status based on due date and assignment status
    const newStatus = calculatePaymentStatus(
      assignment.paymentDueDate,
      null,
      assignment.assignmentStatus
    )

    const updatedNotes = validated.reason
      ? `${assignment.paymentNotes || ''}\n\nPagamento cancellato: ${validated.reason}`.trim()
      : assignment.paymentNotes

    await db
      .update(staffAssignments)
      .set({
        paymentStatus: newStatus,
        paymentDate: null,
        invoiceNumber: null,
        invoiceUrl: null,
        paymentNotes: updatedNotes,
        updatedAt: new Date(),
      })
      .where(eq(staffAssignments.id, validated.assignmentId))

    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${assignment.staffId}`)
    revalidatePath(`/eventi/${assignment.eventId}/staff`)
    revalidatePath('/')

    return { success: true, message: 'Pagamento cancellato' }
  } catch (error) {
    console.error('Cancel payment error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: 'Errore durante la cancellazione del pagamento' }
  }
}

/**
 * Update Assignment Status Action
 * Quick action to change only the status
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  status: 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
): Promise<ActionResult> {
  try {
    // Get assignment
    const [assignment] = await db
      .select()
      .from(staffAssignments)
      .where(eq(staffAssignments.id, assignmentId))

    if (!assignment) {
      return {
        success: false,
        message: 'Assegnazione non trovata',
      }
    }

    // Recalculate payment status
    const paymentStatus = calculatePaymentStatus(
      assignment.paymentDueDate,
      assignment.paymentDate,
      status
    )

    // Update
    await db
      .update(staffAssignments)
      .set({
        assignmentStatus: status,
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(staffAssignments.id, assignmentId))

    // Revalidate
    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${assignment.staffId}`)
    revalidatePath(`/eventi/${assignment.eventId}/staff`)

    return {
      success: true,
      message: 'Status aggiornato con successo',
    }
  } catch (error) {
    console.error('Update assignment status error:', error)

    return {
      success: false,
      message: "Errore durante l'aggiornamento dello status",
    }
  }
}
