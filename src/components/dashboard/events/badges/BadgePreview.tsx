/**
 * FILE: src/components/dashboard/events/badges/BadgePreview.tsx
 *
 * COMPONENT: BadgePreview
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches participant and event data
 * - Display-only component
 * - No interactivity needed
 *
 * PROPS:
 * - participantId: string - Participant ID
 *
 * FEATURES:
 * - Event branding
 * - Participant information
 * - QR code display
 * - Print-friendly layout
 *
 * USAGE:
 * <BadgePreview participantId="participant_123" />
 */

import { notFound } from 'next/navigation'
import { getParticipantById } from '@/lib/dal/participants'
import { QRCodeDisplay } from './QRCodeDisplay'

interface BadgePreviewProps {
  participantId: string
}

export async function BadgePreview({ participantId }: BadgePreviewProps) {
  // Fetch participant with event data
  const participant = await getParticipantById(participantId)

  if (!participant || !participant.qrCode) {
    notFound()
  }

  const { event } = participant

  return (
    <div className="max-w-md mx-auto">
      {/* Badge Container */}
      <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg overflow-hidden print:shadow-none">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
          <h2 className="text-2xl font-bold mb-1">{event?.title || 'Event'}</h2>
          {event?.location && <p className="text-sm text-blue-100">{event.location}</p>}
          {event?.startDate && (
            <p className="text-xs text-blue-100 mt-1">
              {new Date(event.startDate).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Participant Info */}
        <div className="p-6 text-center border-b border-gray-200">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {participant.firstName} {participant.lastName}
          </h3>

          {participant.company && (
            <p className="text-lg text-gray-600 mb-1">{participant.company}</p>
          )}

          {participant.jobTitle && <p className="text-sm text-gray-500">{participant.jobTitle}</p>}

          {participant.ticketType && (
            <div className="mt-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {participant.ticketType}
              </span>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="p-6 bg-gray-50">
          <QRCodeDisplay
            qrData={participant.qrCode}
            participantName={`${participant.firstName} ${participant.lastName}`}
            size={250}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-100 text-center text-xs text-gray-500">
          Participant ID: {participant.id.substring(0, 8)}...
        </div>
      </div>

      {/* Print Instructions */}
      <div className="mt-4 text-center text-sm text-gray-500 print:hidden">
        <p>Use your browser's print function (Ctrl+P / Cmd+P) to print this badge</p>
      </div>
    </div>
  )
}
