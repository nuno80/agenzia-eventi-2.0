/**
 * FILE: src/lib/validations/staff.ts
 *
 * PURPOSE:
 * - Define Zod validation schemas for staff members
 * - Used in Server Actions for input validation
 * - Ensures type safety and data integrity
 *
 * SCHEMAS:
 * - createStaffSchema: For creating new staff members
 * - updateStaffSchema: For updating existing staff (partial)
 *
 * USAGE:
 * import { createStaffSchema } from '@/lib/validations/staff';
 * const validated = createStaffSchema.parse(data);
 */

import { z } from 'zod'

/**
 * Create Staff Schema
 * All required fields for creating a new staff member
 */
export const createStaffSchema = z.object({
  // Personal Info
  firstName: z
    .string()
    .min(2, 'Il nome deve contenere almeno 2 caratteri')
    .max(100, 'Il nome non può superare 100 caratteri'),

  lastName: z
    .string()
    .min(2, 'Il cognome deve contenere almeno 2 caratteri')
    .max(100, 'Il cognome non può superare 100 caratteri'),

  email: z.string().email('Email non valida').max(200, "L'email non può superare 200 caratteri"),

  phone: z.string().max(50, 'Il telefono non può superare 50 caratteri').optional().nullable(),

  // Photo
  photoUrl: z
    .string()
    .url('URL foto non valido')
    .max(500, "L'URL non può superare 500 caratteri")
    .optional()
    .nullable(),

  // Role & Specialization
  role: z.enum([
    'hostess',
    'steward',
    'driver',
    'av_tech',
    'photographer',
    'videographer',
    'security',
    'catering',
    'cleaning',
    'other',
  ]),

  specialization: z
    .string()
    .max(200, 'La specializzazione non può superare 200 caratteri')
    .optional()
    .nullable(),

  // Financial
  hourlyRate: z
    .number()
    .nonnegative('La tariffa oraria non può essere negativa')
    .max(10000, 'La tariffa oraria non può superare €10.000')
    .optional()
    .nullable(),

  preferredPaymentMethod: z
    .string()
    .max(100, 'Il metodo di pagamento non può superare 100 caratteri')
    .optional()
    .nullable(),

  // Status
  isActive: z.boolean().default(true),

  // Tags
  tags: z
    .array(z.string())
    .max(20, 'Non puoi aggiungere più di 20 tag')
    .optional()
    .nullable()
    .transform((val) => (val ? JSON.stringify(val) : null)),

  // Notes
  notes: z.string().max(5000, 'Le note non possono superare 5000 caratteri').optional().nullable(),
})

/**
 * Update Staff Schema
 * Partial version for updating existing staff
 * All fields are optional
 */
export const updateStaffSchema = createStaffSchema.partial()

/**
 * Type inference from schemas
 */
export type CreateStaffInput = z.infer<typeof createStaffSchema>
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>

/**
 * Quick Staff Schema
 * Minimal fields for quick staff creation
 */
export const quickStaffSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional(),
  role: z.enum([
    'hostess',
    'steward',
    'driver',
    'av_tech',
    'photographer',
    'videographer',
    'security',
    'catering',
    'cleaning',
    'other',
  ]),
})

export type QuickStaffInput = z.infer<typeof quickStaffSchema>
