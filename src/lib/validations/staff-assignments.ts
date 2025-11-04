/**
 * FILE: src/lib/validations/staff-assignments.ts
 * Zod validation schemas for Staff Assignments
 */

import { z } from 'zod'

const cuid = z.string().min(1)

export const assignmentStatusEnum = z.enum([
  'requested',
  'confirmed',
  'declined',
  'completed',
  'cancelled',
])

export const paymentStatusEnum = z.enum(['not_due', 'pending', 'overdue', 'paid'])

export const paymentTermsEnum = z.enum(['custom', 'immediate', '30_days', '60_days', '90_days'])

const nonNegativeMoney = z
  .number()
  .nonnegative("L'importo non può essere negativo")
  .max(1_000_000, 'Importo troppo elevato')
  .nullable()
  .optional()

const optionalUrl = z.string().url('URL non valido').max(500).optional().nullable()
const optionalString = z.string().max(5000).optional().nullable()

// Base schema (senza refine). Evita il problema di extend() su schema raffinato
const staffAssignmentBase = z.object({
  eventId: cuid,
  staffId: cuid,

  startTime: z.coerce.date(),
  endTime: z.coerce.date(),

  assignmentStatus: assignmentStatusEnum.default('requested'),

  paymentAmount: nonNegativeMoney,

  paymentTerms: paymentTermsEnum.default('custom'),
  paymentDueDate: z.coerce.date().optional().nullable(),

  paymentNotes: optionalString,

  invoiceNumber: z.string().max(100).optional().nullable(),
  invoiceUrl: optionalUrl,
})

// Create: aggiunge la validazione endTime >= startTime
export const createStaffAssignmentSchema = staffAssignmentBase.refine(
  (d) => d.endTime >= d.startTime,
  {
    message: 'La data di fine deve essere successiva alla data di inizio',
    path: ['endTime'],
  }
)

// Update: campi opzionali (aggiornamento parziale)
export const updateStaffAssignmentSchema = staffAssignmentBase.partial()

export const markPaidSchema = z.object({
  assignmentId: cuid,
  paymentDate: z.coerce.date(),
  paymentNotes: optionalString,
  invoiceNumber: z.string().max(100).optional().nullable(),
  invoiceUrl: optionalUrl,
})

export const postponePaymentSchema = z.object({
  assignmentId: cuid,
  newDueDate: z.coerce.date(),
  reason: optionalString,
})

export const cancelPaymentSchema = z.object({
  assignmentId: cuid,
  reason: optionalString,
})

export type CreateStaffAssignmentInput = z.infer<typeof createStaffAssignmentSchema>
export type UpdateStaffAssignmentInput = z.infer<typeof updateStaffAssignmentSchema>
export type MarkPaidInput = z.infer<typeof markPaidSchema>
export type PostponePaymentInput = z.infer<typeof postponePaymentSchema>
export type CancelPaymentInput = z.infer<typeof cancelPaymentSchema>

// Batch create assignments
export const createAssignmentsBatchSchema = z.object({
  eventId: cuid,
  staffIds: z.array(cuid).min(1, 'Seleziona almeno un membro dello staff'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  notes: z.string().max(500).optional().nullable(),
  paymentTerms: paymentTermsEnum.default('custom').optional(),
  paymentDueDate: z.coerce.date().optional().nullable(),
  paymentAmount: nonNegativeMoney,
})

export type CreateAssignmentsBatchInput = z.infer<typeof createAssignmentsBatchSchema>
