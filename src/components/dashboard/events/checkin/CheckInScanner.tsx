/**
 * FILE: src/components/dashboard/events/checkin/CheckInScanner.tsx
 *
 * COMPONENT: CheckInScanner
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Uses camera via html5-qrcode
 * - Manages scanner state
 * - Handles real-time scanning
 * - Calls server action on scan
 *
 * PROPS:
 * - eventId: string - Event ID for validation
 * - onSuccess?: (participantName: string) => void
 *
 * FEATURES:
 * - QR code scanner with camera
 * - Success/error feedback
 * - Sound on successful scan
 * - Fallback to manual entry
 *
 * USAGE:
 * <CheckInScanner eventId={event.id} />
 */

'use client'

import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { checkInParticipant } from '@/app/actions/participants'
import { Button } from '@/components/ui/button'

interface CheckInScannerProps {
  onSuccess?: (participantName: string) => void
}

export function CheckInScanner({ onSuccess }: CheckInScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<{
    success: boolean
    message: string
    timestamp: number
  } | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Initialize scanner
  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      scanner
        .start(
          { facingMode: 'environment' }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // Process QR code
            await handleScan(decodedText)
          },
          (_errorMessage) => {
            // Ignore scan errors (too frequent)
          }
        )
        .catch((err) => {
          console.info('Camera not available:', err.message)
          setCameraError(
            'Impossibile accedere alla webcam. Assicurati di avere una webcam installata e di aver concesso i permessi richiesti.'
          )
          setIsScanning(false)
        })
    }

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear()
            scannerRef.current = null
          })
          .catch((err) => console.error('Scanner stop error:', err))
      }
    }
  }, [isScanning])

  // Handle QR scan
  const handleScan = async (qrData: string) => {
    // Prevent duplicate scans within 2 seconds
    if (lastScan && Date.now() - lastScan.timestamp < 2000) {
      return
    }

    try {
      const result = await checkInParticipant(qrData)

      if (result.success && result.data) {
        const participantName = `${result.data.participant.firstName} ${result.data.participant.lastName}`

        setLastScan({
          success: true,
          message: `✓ ${participantName}`,
          timestamp: Date.now(),
        })

        toast.success(`Check-in successful: ${participantName}`)

        // Play success sound
        playSuccessSound()

        // Callback
        onSuccess?.(participantName)
      } else {
        setLastScan({
          success: false,
          message: result.error || 'Check-in failed',
          timestamp: Date.now(),
        })

        toast.error(result.error || 'Check-in failed')
      }
    } catch (error) {
      console.error('Check-in error:', error)
      setLastScan({
        success: false,
        message: 'Error processing QR code',
        timestamp: Date.now(),
      })
      toast.error('Error processing QR code')
    }
  }

  // Play success sound
  const playSuccessSound = () => {
    const audio = new Audio('/sounds/success.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore if sound fails
    })
  }

  // Toggle scanner
  const toggleScanner = () => {
    setIsScanning(!isScanning)
    setCameraError(null)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">QR Scanner</h3>
        <Button onClick={toggleScanner} variant={isScanning ? 'destructive' : 'default'}>
          {isScanning ? (
            <>
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Scanner
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Start Scanner
            </>
          )}
        </Button>
      </div>

      {/* Camera Error */}
      {cameraError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {cameraError}
        </div>
      )}

      {/* Scanner Container */}
      {isScanning && (
        <div className="mb-4">
          <div id="qr-reader" className="rounded-lg overflow-hidden" />
        </div>
      )}

      {/* Last Scan Result */}
      {lastScan && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            lastScan.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {lastScan.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className={`font-medium ${lastScan.success ? 'text-green-900' : 'text-red-900'}`}>
            {lastScan.message}
          </span>
        </div>
      )}

      {/* Instructions */}
      {!isScanning && !lastScan && (
        <div className="text-center py-8 text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">Click "Start Scanner" to begin checking in participants</p>
        </div>
      )}
    </div>
  )
}
