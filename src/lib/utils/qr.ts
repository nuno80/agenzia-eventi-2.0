/**
 * FILE: src/lib/utils/qr.ts
 *
 * PURPOSE: QR Code generation and validation utilities
 *
 * FEATURES:
 * - Generate QR data payload with checksum
 * - Validate QR data and verify checksum
 * - Security: prevents tampering with participant/event IDs
 *
 * USAGE:
 * import { generateQRData, validateQRData } from '@/lib/utils/qr'
 */

import { createHash } from 'node:crypto'

/**
 * QR Code Data Structure
 */
export interface QRCodeData {
  participantId: string
  eventId: string
  checksum: string
}

/**
 * Secret key for checksum generation
 * In production, this should be an environment variable
 */
const QR_SECRET = process.env.QR_SECRET || 'eventhub-qr-secret-key-change-in-production'

/**
 * Generate checksum for QR data
 * Uses SHA-256 hash of participantId + eventId + secret
 */
export function generateChecksum(participantId: string, eventId: string): string {
  const data = `${participantId}:${eventId}:${QR_SECRET}`
  return createHash('sha256').update(data).digest('hex').substring(0, 16)
}

/**
 * Generate QR code data payload
 * Returns JSON string to be encoded in QR code
 */
export function generateQRData(participantId: string, eventId: string): string {
  const checksum = generateChecksum(participantId, eventId)

  const qrData: QRCodeData = {
    participantId,
    eventId,
    checksum,
  }

  return JSON.stringify(qrData)
}

/**
 * Validate QR code data
 * Verifies checksum and returns parsed data if valid
 */
export function validateQRData(qrString: string): {
  valid: boolean
  data?: QRCodeData
  error?: string
} {
  try {
    // Parse JSON
    const parsed = JSON.parse(qrString) as QRCodeData

    // Verify required fields
    if (!parsed.participantId || !parsed.eventId || !parsed.checksum) {
      return {
        valid: false,
        error: 'Missing required fields in QR data',
      }
    }

    // Verify checksum
    const expectedChecksum = generateChecksum(parsed.participantId, parsed.eventId)

    if (parsed.checksum !== expectedChecksum) {
      return {
        valid: false,
        error: 'Invalid checksum - QR code may be tampered',
      }
    }

    return {
      valid: true,
      data: parsed,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid QR data format',
    }
  }
}

/**
 * Generate QR code as Data URL (base64 PNG)
 * For use in client components
 */
export async function generateQRCodeDataURL(qrData: string): Promise<string> {
  const QRCode = (await import('qrcode')).default

  try {
    const dataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return dataURL
  } catch (error) {
    console.error('Failed to generate QR code:', error)
    throw new Error('QR code generation failed')
  }
}

/**
 * Generate QR code as Buffer (for server-side PDF generation)
 */
export async function generateQRCodeBuffer(qrData: string): Promise<Buffer> {
  const QRCode = (await import('qrcode')).default

  try {
    const buffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
    })

    return buffer
  } catch (error) {
    console.error('Failed to generate QR code buffer:', error)
    throw new Error('QR code generation failed')
  }
}
