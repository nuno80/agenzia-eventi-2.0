/**
 * FILE: src/lib/validations/participants.ts
 *
 * PURPOSE: Zod validation schemas for participant-related operations
 *
 * SCHEMAS:
 * - qrDataSchema: Validate QR code data structure
 * - checkInSchema: Validate check-in requests
 * - generateQRSchema: Validate QR generation requests
 */

import { z } from 'zod'

/**
 * QR Code Data Schema
 * Validates the structure of QR code payload
 */
export const qrDataSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  eventId: z.string().min(1, 'Event ID is required'),
  checksum: z.string().min(1, 'Checksum is required'),
})

/**
 * Check-in Schema
 * Validates check-in requests (manual or QR-based)
 */
export const checkInSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  eventId: z.string().min(1, 'Event ID is required'),
  timestamp: z.date().optional(),
  method: z.enum(['qr', 'manual']).default('manual'),
})

/**
 * Generate QR Code Schema
 * Validates QR generation requests
 */
export const generateQRSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
})

/**
 * Bulk QR Generation Schema
 * Validates bulk QR generation for all event participants
 */
export const bulkGenerateQRSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
})

/**
 * Undo Check-in Schema
 * Validates undo check-in requests (admin only)
 */
export const undoCheckInSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
})

/**
 * Type exports
 */
export type QRData = z.infer<typeof qrDataSchema>
export type CheckInRequest = z.infer<typeof checkInSchema>
export type GenerateQRRequest = z.infer<typeof generateQRSchema>
export type BulkGenerateQRRequest = z.infer<typeof bulkGenerateQRSchema>
export type UndoCheckInRequest = z.infer<typeof undoCheckInSchema>
