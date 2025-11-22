/**
 * FILE: src/components/dashboard/events/badges/QRCodeDisplay.tsx
 *
 * COMPONENT: QRCodeDisplay
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Uses canvas for QR rendering
 * - Handles download interactions
 * - Manages modal state
 *
 * PROPS:
 * - qrData: string - QR code data payload
 * - participantName: string - For filename
 * - size?: number - QR code size (default: 300)
 *
 * FEATURES:
 * - Renders QR code on canvas
 * - Download as PNG
 * - Copy QR data to clipboard
 *
 * USAGE:
 * <QRCodeDisplay qrData={participant.qrCode} participantName="John Doe" />
 */

'use client'

import { Check, Copy, Download } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface QRCodeDisplayProps {
  qrData: string
  participantName: string
  size?: number
}

export function QRCodeDisplay({ qrData, participantName, size = 300 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  // Generate QR code on mount
  useEffect(() => {
    if (!canvasRef.current) return

    QRCode.toCanvas(
      canvasRef.current,
      qrData,
      {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: size,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      },
      (error) => {
        if (error) {
          console.error('QR Code generation error:', error)
        }
      }
    )
  }, [qrData, size])

  // Download QR as PNG
  const handleDownload = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `badge-${participantName.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = url
    link.click()
  }

  // Copy QR data to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* QR Code Canvas */}
      <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
        <canvas ref={canvasRef} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Download PNG
        </Button>

        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={copied}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Data
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
