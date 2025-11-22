/**
 * FILE: src/components/dashboard/events/participants/ParticipantActions.tsx
 *
 * COMPONENT: ParticipantActions
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Dropdown menu state
 * - Dialog state management
 * - Server action calls
 *
 * PROPS:
 * - participant: Participant - Participant data
 *
 * FEATURES:
 * - Edit participant dialog
 * - Delete participant confirmation
 * - Dropdown menu with actions
 *
 * USAGE:
 * <ParticipantActions participant={participant} />
 */

'use client'

import { Edit, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteParticipant } from '@/app/actions/participant-crud'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Participant } from '@/db'
import { ParticipantForm } from './ParticipantForm'
import { ViewBadgeDialog } from './ViewBadgeDialog'

interface ParticipantActionsProps {
  participant: Participant
}

export function ParticipantActions({ participant }: ParticipantActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const result = await deleteParticipant({ id: participant.id })

      if (result.success) {
        toast.success('Participant deleted successfully')
        setDeleteOpen(false)
      } else {
        toast.error(result.error || 'Failed to delete participant')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ViewBadgeDialog participant={participant} />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Participant: {participant.firstName} {participant.lastName}
            </DialogTitle>
          </DialogHeader>
          <ParticipantForm
            eventId={participant.eventId}
            participant={participant}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Participant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <strong>
                {participant.firstName} {participant.lastName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
