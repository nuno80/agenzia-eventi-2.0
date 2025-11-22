/**
 * FILE: src/lib/validations/participant-crud.ts
 *
 * PURPOSE: Zod validation schemas for participant CRUD operations
 *
 * SCHEMAS:
 * - createParticipantSchema: Create new participant
 * - updateParticipantSchema: Update existing participant
 * - deleteParticipantSchema: Delete participant
 */

import { z } from 'zod'

/**
 * Create Participant Schema
 */
export const createParticipantSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),

  // Personal Info
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),

  // Professional Info
  company: z.string().optional(),
  jobTitle: z.string().optional(),

  // Registration
  registrationStatus: z.enum(['pending', 'confirmed', 'cancelled', 'waitlist']).default('pending'),

  // Ticket
  ticketType: z.string().optional(),
  ticketPrice: z.coerce.number().min(0).default(0),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'free']).default('pending'),

  // Preferences
  dietaryRequirements: z.string().optional(),
  specialNeeds: z.string().optional(),

  // Notes
  notes: z.string().optional(),
})

/**
 * Update Participant Schema
 * Same as create but with ID and all fields optional except ID
 */
export const updateParticipantSchema = z.object({
  id: z.string().min(1, 'Participant ID is required'),

  // Personal Info
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),

  // Professional Info
  company: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),

  // Registration
  registrationStatus: z.enum(['pending', 'confirmed', 'cancelled', 'waitlist']).optional(),

  // Ticket
  ticketType: z.string().optional().nullable(),
  ticketPrice: z.coerce.number().min(0).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'free']).optional(),

  // Preferences
  dietaryRequirements: z.string().optional().nullable(),
  specialNeeds: z.string().optional().nullable(),

  // Notes
  notes: z.string().optional().nullable(),
})

/**
 * Delete Participant Schema
 */
export const deleteParticipantSchema = z.object({
  id: z.string().min(1, 'Participant ID is required'),
})

/**
 * Type exports
 */
export type CreateParticipantInput = z.infer<typeof createParticipantSchema>
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>
export type DeleteParticipantInput = z.infer<typeof deleteParticipantSchema>
