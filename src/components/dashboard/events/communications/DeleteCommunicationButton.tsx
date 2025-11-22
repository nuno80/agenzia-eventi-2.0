/**
 * FILE: src/components/dashboard/events/communications/DeleteCommunicationButton.tsx
 *
 * COMPONENT: DeleteCommunicationButton
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Handles button click event
 * - Manages confirmation dialog state
 * - Calls server action
 *
 * PROPS:
 * - communicationId: ID of communication to delete
 * - eventId: Event ID for revalidation
 *
 * USAGE:
 * <DeleteCommunicationButton communicationId={id} eventId={eventId} />
 */

'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteCommunication } from '@/app/actions/communications'

interface DeleteCommunicationButtonProps {
  communicationId: string
}

export function DeleteCommunicationButton({ communicationId }: DeleteCommunicationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa comunicazione?')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteCommunication(communicationId)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error("Errore durante l'eliminazione")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Elimina comunicazione"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
