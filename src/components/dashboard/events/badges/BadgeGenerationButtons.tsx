/**
 * FILE: src/components/dashboard/events/badges/BadgeGenerationButtons.tsx
 *
 * COMPONENT: BadgeGenerationButtons
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Handles button clicks
 * - Manages loading states
 * - Shows toast notifications
 *
 * PROPS:
 * - eventId: string - Event ID
 * - participantsCount: number - Total participants
 *
 * FEATURES:
 * - Generate all badges button
 * - Loading state during generation
 * - Success/error feedback
 *
 * USAGE:
 * <BadgeGenerationButtons eventId={event.id} participantsCount={100} />
 */

'use client'

import { QrCode } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { generateBulkQRCodes } from '@/app/actions/participants'
import { Button } from '@/components/ui/button'

interface BadgeGenerationButtonsProps {
  eventId: string
  participantsCount: number
}

export function BadgeGenerationButtons({
  eventId,
  participantsCount,
}: BadgeGenerationButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateAll = async () => {
    setIsGenerating(true)

    try {
      const result = await generateBulkQRCodes({ eventId })

      if (result.success && result.data) {
        toast.success(`Generated ${result.data.count} badges successfully!`)
      } else {
        toast.error(result.error || 'Failed to generate badges')
      }
    } catch (error) {
      console.error('Badge generation error:', error)
      toast.error('Error generating badges')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleGenerateAll}
        disabled={isGenerating || participantsCount === 0}
        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <QrCode className="w-4 h-4" />
        {isGenerating ? 'Generating...' : 'Generate All Badges'}
      </Button>

      {participantsCount === 0 && (
        <p className="text-sm text-gray-500 self-center">No participants to generate badges for</p>
      )}
    </div>
  )
}
