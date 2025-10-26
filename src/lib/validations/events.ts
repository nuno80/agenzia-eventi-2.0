import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS (for Server Actions)
// ============================================================================

/**
 * Zod schema for event creation
 * Use this in Server Actions for validation
 */
export const createEventSchema = z
  .object({
    name: z.string().min(3, 'Nome deve essere almeno 3 caratteri').max(200),
    type: z.enum(['congresso_medico', 'conferenza_aziendale', 'workshop', 'fiera']),
    description: z.string().max(2000).optional(),
    location: z.string().min(3, 'Location richiesta').max(200),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    capacity: z.number().int().positive('Capacità deve essere positiva'),
    budget: z.number().positive('Budget deve essere positivo'),
    status: z.enum(['draft', 'upcoming', 'active', 'completed', 'cancelled']).default('draft'),
  })
  .refine(
    (data) => {
      return data.endDate >= data.startDate
    },
    {
      message: 'La data di fine deve essere successiva o uguale alla data di inizio',
      path: ['endDate'],
    }
  )

/**
 * Zod schema for event update
 * Similar to create but all fields are optional
 */
export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().min(1, 'ID richiesto'),
})

/**
 * Zod schema for updating event status only
 */
export const updateEventStatusSchema = z.object({
  id: z.string().min(1, 'ID richiesto'),
  status: z.enum(['draft', 'upcoming', 'active', 'completed', 'cancelled']),
})

/**
 * Zod schema for updating event budget only
 */
export const updateEventBudgetSchema = z.object({
  id: z.string().min(1, 'ID richiesto'),
  budget: z.number().positive('Budget deve essere positivo'),
})

/**
 * Zod schema for updating participant count only
 */
export const updateParticipantCountSchema = z.object({
  id: z.string().min(1, 'ID richiesto'),
  registeredCount: z
    .number()
    .int()
    .nonnegative('Il numero di partecipanti non può essere negativo'),
})

/**
 * Zod schema for bulk updating event status
 */
export const bulkUpdateEventStatusSchema = z.object({
  ids: z.array(z.string()),
  status: z.enum(['draft', 'upcoming', 'active', 'completed', 'cancelled']),
})

/**
 * Zod schema for bulk deleting events
 */
export const bulkDeleteEventsSchema = z.object({
  ids: z.array(z.string()),
})

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>
export type UpdateEventBudgetInput = z.infer<typeof updateEventBudgetSchema>
export type UpdateParticipantCountInput = z.infer<typeof updateParticipantCountSchema>
export type BulkUpdateEventStatusInput = z.infer<typeof bulkUpdateEventStatusSchema>
export type BulkDeleteEventsInput = z.infer<typeof bulkDeleteEventsSchema>
