/**
 * FILE: src/components/dashboard/events/participants/ViewBadgeDialog.tsx
 *
 * COMPONENT: ViewBadgeDialog
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Dialog state management
 * - Trigger button interaction
 *
 * PROPS:
 * - participant: Participant - Participant data
 *
 * FEATURES:
 * - Shows badge preview with QR code
 * - Download badge as PNG
 * - Auto-generates QR if not exists
 *
 * USAGE:
 * <ViewBadgeDialog participant={participant} />
 */

'use client'

import { QrCode } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { generateQRCode } from '@/app/actions/participants'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Participant } from '@/db'
import { QRCodeDisplay } from '../badges/QRCodeDisplay'

interface ViewBadgeDialogProps {
  participant: Participant
}

export function ViewBadgeDialog({ participant }: ViewBadgeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrCode, setQrCode] = useState(participant.qrCode)

  const handleGenerateQR = async () => {
    setIsGenerating(true)

    try {
      const result = await generateQRCode({ participantId: participant.id })

      if (result.success && result.data) {
        setQrCode(result.data.qrCode)
        toast.success('QR code generated successfully')
      } else {
        toast.error(result.error || 'Failed to generate QR code')
      }
    } catch (error) {
      console.error('QR generation error:', error)
      toast.error('Error generating QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <QrCode className="w-4 h-4" />
          Badge
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Badge: {participant.firstName} {participant.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Participant Info Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold mb-1">
              {participant.firstName} {participant.lastName}
            </h3>
            {participant.company && <p className="text-sm text-blue-100">{participant.company}</p>}
            {participant.jobTitle && (
              <p className="text-xs text-blue-100 mt-1">{participant.jobTitle}</p>
            )}
            {participant.ticketType && (
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                  {participant.ticketType}
                </span>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          {qrCode ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <QRCodeDisplay
                qrData={qrCode}
                participantName={`${participant.firstName} ${participant.lastName}`}
                size={250}
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-4">QR code not generated yet</p>
              <Button
                onClick={handleGenerateQR}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </div>
          )}

          {/* Participant Details */}
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{participant.email}</span>
            </div>
            {participant.phone && (
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{participant.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="capitalize">{participant.registrationStatus}</span>
            </div>
            {participant.checkedIn && (
              <div className="flex justify-between text-green-600">
                <span className="font-medium">✓ Checked In</span>
                <span>
                  {participant.checkinTime
                    ? new Date(participant.checkinTime).toLocaleString('it-IT')
                    : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
