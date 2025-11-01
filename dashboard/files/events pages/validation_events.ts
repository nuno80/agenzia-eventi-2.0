/**
 * FILE: src/lib/validations/events.ts
 *
 * PURPOSE:
 * - Define Zod validation schemas for event data
 * - Used in Server Actions for input validation
 * - Ensures type safety and data integrity
 *
 * SCHEMAS:
 * - createEventSchema: For creating new events
 * - updateEventSchema: For updating existing events (partial)
 *
 * USAGE:
 * import { createEventSchema } from '@/lib/validations/events';
 * const validated = createEventSchema.parse(data);
 */

import { z } from 'zod'

/**
 * Create Event Schema
 * All required fields for creating a new event
 */
export const createEventSchema = z
  .object({
    // Basic Info
    title: z
      .string()
      .min(3, 'Il titolo deve contenere almeno 3 caratteri')
      .max(200, 'Il titolo non può superare 200 caratteri'),

    description: z
      .string()
      .min(10, 'La descrizione deve contenere almeno 10 caratteri')
      .max(5000, 'La descrizione non può superare 5000 caratteri')
      .optional()
      .nullable(),

    tagline: z.string().max(150, 'Il tagline non può superare 150 caratteri').optional().nullable(),

    // Dates
    startDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),

    endDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),

    registrationOpenDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional()
      .nullable(),

    registrationCloseDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val))
      .optional()
      .nullable(),

    // Location
    location: z
      .string()
      .min(2, 'Il luogo deve contenere almeno 2 caratteri')
      .max(200, 'Il luogo non può superare 200 caratteri'),

    venue: z.string().max(200, 'La sede non può superare 200 caratteri').optional().nullable(),

    address: z
      .string()
      .max(300, "L'indirizzo non può superare 300 caratteri")
      .optional()
      .nullable(),

    city: z.string().max(100, 'La città non può superare 100 caratteri').optional().nullable(),

    country: z.string().max(100, 'Il paese non può superare 100 caratteri').default('Italia'),

    // Capacity
    maxParticipants: z
      .number()
      .int('La capacità deve essere un numero intero')
      .positive('La capacità deve essere maggiore di 0')
      .max(1000000, 'La capacità non può superare 1.000.000')
      .optional()
      .nullable(),

    // Status
    status: z
      .enum(['draft', 'planning', 'open', 'ongoing', 'completed', 'cancelled'])
      .default('draft'),

    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),

    // Visibility
    isPublic: z.boolean().default(false),
    requiresApproval: z.boolean().default(false),

    // Media
    imageUrl: z
      .string()
      .url("L'URL dell'immagine non è valido")
      .max(500, "L'URL dell'immagine non può superare 500 caratteri")
      .optional()
      .nullable(),

    websiteUrl: z
      .string()
      .url("L'URL del sito web non è valido")
      .max(500, "L'URL del sito web non può superare 500 caratteri")
      .optional()
      .nullable(),

    // Budget
    totalBudget: z
      .number()
      .nonnegative('Il budget totale non può essere negativo')
      .max(1000000000, 'Il budget totale non può superare 1 miliardo')
      .default(0),

    // Category
    category: z
      .string()
      .max(100, 'La categoria non può superare 100 caratteri')
      .optional()
      .nullable(),

    tags: z
      .array(z.string())
      .max(20, 'Non puoi aggiungere più di 20 tag')
      .optional()
      .nullable()
      .transform((val) => (val ? JSON.stringify(val) : null)),

    // Notes
    notes: z
      .string()
      .max(5000, 'Le note non possono superare 5000 caratteri')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      // Validate end date is after start date
      return new Date(data.endDate) >= new Date(data.startDate)
    },
    {
      message: 'La data di fine deve essere successiva o uguale alla data di inizio',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // Validate registration close is after registration open
      if (data.registrationOpenDate && data.registrationCloseDate) {
        return new Date(data.registrationCloseDate) >= new Date(data.registrationOpenDate)
      }
      return true
    },
    {
      message: "La chiusura iscrizioni deve essere successiva o uguale all'apertura",
      path: ['registrationCloseDate'],
    }
  )

/**
 * Update Event Schema
 * Partial version for updating existing events
 * All fields are optional
 */
export const updateEventSchema = createEventSchema.partial()

/**
 * Type inference from schemas
 */
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>

/**
 * Quick Event Schema
 * Minimal fields for quick event creation
 */
export const quickEventSchema = z
  .object({
    title: z.string().min(3).max(200),
    startDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    endDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    location: z.string().min(2).max(200),
    status: z
      .enum(['draft', 'planning', 'open', 'ongoing', 'completed', 'cancelled'])
      .default('draft'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'La data di fine deve essere successiva o uguale alla data di inizio',
    path: ['endDate'],
  })

export type QuickEventInput = z.infer<typeof quickEventSchema>
