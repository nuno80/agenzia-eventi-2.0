/**
 * FILE: src/components/dashboard/events/participants/AddParticipantDialog.tsx
 *
 * COMPONENT: AddParticipantDialog
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Dialog state management
 * - Wraps ParticipantForm
 *
 * PROPS:
 * - eventId: string - Event ID
 * - trigger?: React.ReactNode - Custom trigger button
 *
 * USAGE:
 * <AddParticipantDialog eventId={eventId} />
 */

'use client'

import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ParticipantForm } from './ParticipantForm'

interface AddParticipantDialogProps {
  eventId: string
  trigger?: React.ReactNode
}

export function AddParticipantDialog({ eventId, trigger }: AddParticipantDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-4 h-4" />
            Add Participant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Participant</DialogTitle>
        </DialogHeader>
        <ParticipantForm
          eventId={eventId}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
