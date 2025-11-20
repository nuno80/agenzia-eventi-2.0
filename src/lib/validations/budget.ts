/**
 * VALIDATION SCHEMAS: Budget
 *
 * PURPOSE:
 * - Define Zod schemas for budget category and item validation
 * - Ensure type safety and data integrity
 * - Provide clear error messages for invalid input
 *
 * USAGE:
 * import { createBudgetCategorySchema } from '@/lib/validations/budget';
 * const validated = createBudgetCategorySchema.parse(data);
 */

import { z } from 'zod'

// ============================================================================
// BUDGET CATEGORY SCHEMAS
// ============================================================================

/**
 * Schema for creating a new budget category
 */
export const createBudgetCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome deve contenere almeno 2 caratteri')
    .max(100, 'Il nome non può superare 100 caratteri'),
  description: z.string().max(500, 'La descrizione non può superare 500 caratteri').optional(),
  allocatedAmount: z
    .number()
    .nonnegative("L'importo allocato deve essere positivo o zero")
    .default(0),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Il colore deve essere un codice esadecimale valido (es. #3B82F6)')
    .default('#3B82F6'),
  icon: z.string().max(50, "Il nome dell'icona non può superare 50 caratteri").optional(),
})

/**
 * Schema for updating a budget category
 * All fields are optional
 */
export const updateBudgetCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome deve contenere almeno 2 caratteri')
    .max(100, 'Il nome non può superare 100 caratteri')
    .optional(),
  description: z.string().max(500, 'La descrizione non può superare 500 caratteri').optional(),
  allocatedAmount: z
    .number()
    .nonnegative("L'importo allocato deve essere positivo o zero")
    .optional(),
  spentAmount: z.number().nonnegative("L'importo speso deve essere positivo o zero").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Il colore deve essere un codice esadecimale valido (es. #3B82F6)')
    .optional(),
  icon: z.string().max(50, "Il nome dell'icona non può superare 50 caratteri").optional(),
})

// ============================================================================
// BUDGET ITEM SCHEMAS
// ============================================================================

/**
 * Schema for creating a new budget item
 */
export const createBudgetItemSchema = z.object({
  description: z
    .string()
    .min(3, 'La descrizione deve contenere almeno 3 caratteri')
    .max(500, 'La descrizione non può superare 500 caratteri'),
  estimatedCost: z
    .number()
    .nonnegative('Il costo stimato deve essere positivo o zero')
    .min(0.01, 'Il costo stimato deve essere maggiore di zero'),
  actualCost: z.number().nonnegative('Il costo effettivo deve essere positivo o zero').optional(),
  status: z
    .enum(['planned', 'approved', 'paid', 'invoiced'], {
      errorMap: () => ({
        message: 'Lo stato deve essere uno tra: planned, approved, paid, invoiced',
      }),
    })
    .default('planned'),
  vendor: z.string().max(200, 'Il nome del fornitore non può superare 200 caratteri').optional(),
  invoiceNumber: z
    .string()
    .max(100, 'Il numero di fattura non può superare 100 caratteri')
    .optional(),
  invoiceUrl: z.string().url("L'URL della fattura non è valido").optional().or(z.literal('')),
  paymentDate: z.date().optional(),
  notes: z.string().max(1000, 'Le note non possono superare 1000 caratteri').optional(),
})

/**
 * Schema for updating a budget item
 * All fields are optional
 */
export const updateBudgetItemSchema = z.object({
  description: z
    .string()
    .min(3, 'La descrizione deve contenere almeno 3 caratteri')
    .max(500, 'La descrizione non può superare 500 caratteri')
    .optional(),
  estimatedCost: z.number().nonnegative('Il costo stimato deve essere positivo o zero').optional(),
  actualCost: z.number().nonnegative('Il costo effettivo deve essere positivo o zero').optional(),
  status: z
    .enum(['planned', 'approved', 'paid', 'invoiced'], {
      errorMap: () => ({
        message: 'Lo stato deve essere uno tra: planned, approved, paid, invoiced',
      }),
    })
    .optional(),
  vendor: z.string().max(200, 'Il nome del fornitore non può superare 200 caratteri').optional(),
  invoiceNumber: z
    .string()
    .max(100, 'Il numero di fattura non può superare 100 caratteri')
    .optional(),
  invoiceUrl: z.string().url("L'URL della fattura non è valido").optional().or(z.literal('')),
  paymentDate: z.date().optional(),
  notes: z.string().max(1000, 'Le note non possono superare 1000 caratteri').optional(),
})

/**
 * Schema for updating budget item status
 * Validates status transitions and required fields
 */
export const updateBudgetItemStatusSchema = z
  .object({
    status: z.enum(['planned', 'approved', 'paid', 'invoiced'], {
      errorMap: () => ({
        message: 'Lo stato deve essere uno tra: planned, approved, paid, invoiced',
      }),
    }),
    paymentDate: z.date().optional(),
    actualCost: z.number().nonnegative('Il costo effettivo deve essere positivo o zero').optional(),
  })
  .refine(
    (data) => {
      // WHY: When marking as 'paid', payment date should be provided
      if (data.status === 'paid' && !data.paymentDate) {
        return false
      }
      return true
    },
    {
      message: 'La data di pagamento è obbligatoria quando lo stato è "paid"',
      path: ['paymentDate'],
    }
  )
  .refine(
    (data) => {
      // WHY: When marking as 'paid', actual cost should be provided
      if (data.status === 'paid' && !data.actualCost) {
        return false
      }
      return true
    },
    {
      message: 'Il costo effettivo è obbligatorio quando lo stato è "paid"',
      path: ['actualCost'],
    }
  )

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateBudgetCategoryInput = z.infer<typeof createBudgetCategorySchema>
export type UpdateBudgetCategoryInput = z.infer<typeof updateBudgetCategorySchema>
export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>
export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>
export type UpdateBudgetItemStatusInput = z.infer<typeof updateBudgetItemStatusSchema>
