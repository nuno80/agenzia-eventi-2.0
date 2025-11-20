'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { BudgetCategory } from '@/db/libsql-schemas/events'
import type { SpeakerDTO } from '@/lib/dal/speakers'
import SpeakerForm from './SpeakerForm'

interface SpeakerModalProps {
  eventId: string
  speaker?: SpeakerDTO
  budgetCategories: BudgetCategory[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function SpeakerModal({
  eventId,
  speaker,
  budgetCategories,
  open,
  onOpenChange,
  onSuccess,
}: SpeakerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{speaker ? 'Modifica Relatore' : 'Nuovo Relatore'}</DialogTitle>
          <DialogDescription>
            {speaker
              ? 'Modifica i dettagli del relatore esistente.'
              : 'Aggiungi un nuovo relatore per questo evento.'}
          </DialogDescription>
        </DialogHeader>

        <SpeakerForm
          eventId={eventId}
          speaker={speaker}
          budgetCategories={budgetCategories}
          onSuccess={() => {
            onOpenChange(false)
            onSuccess?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
