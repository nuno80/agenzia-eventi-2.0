/**
 * FILE: src/components/dashboard/events/DeleteEventButton.tsx
 *
 * COMPONENT: DeleteEventButton
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages confirm dialog open/close state
 * - Triggers Server Action with pending state
 * - Shows toast feedback and performs client redirects
 *
 * PROPS:
 * - eventId: string - Event ID to delete
 * - eventTitle?: string - Event title for confirmation context
 * - variant?: 'icon' | 'button' - Display variant
 * - onDeleted?: () => void - Optional callback after successful deletion
 *
 * FEATURES:
 * - Confirmation dialog with clear destructive styling
 * - Calls deleteEvent Server Action and handles errors
 * - Success: toast + redirect to /eventi (or onDeleted callback)
 *
 * USAGE:
 * <DeleteEventButton eventId={event.id} eventTitle={event.title} />
 */

'use client'

import { Loader2, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle?: string
  variant?: 'icon' | 'button'
  onDeleted?: () => void
}

export function DeleteEventButton({
  eventId,
  eventTitle,
  variant = 'button',
  onDeleted,
}: DeleteEventButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [confirmText, setConfirmText] = useState('')

  const canConfirm = confirmText.trim().toUpperCase() === 'ELIMINA'

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEvent(eventId)

      if (result.success) {
        setIsOpen(false)
        toast({
          title: 'Evento eliminato',
          description: "L'evento è stato eliminato con successo.",
        })
        if (onDeleted) {
          onDeleted()
        } else {
          router.push('/eventi')
        }
      } else {
        toast({
          title: 'Errore',
          description: result.message || "Errore durante l'eliminazione dell'evento",
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <>
      {variant === 'icon' ? (
        <Button
          variant="outline"
          size="icon"
          aria-label="Elimina evento"
          title="Elimina evento"
          onClick={() => setIsOpen(true)}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      ) : (
        <Button
          variant="destructive"
          onClick={() => setIsOpen(true)}
          aria-label="Apri conferma eliminazione evento"
        >
          <Trash2 />
          Elimina
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Conferma eliminazione</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isPending}
                aria-label="Chiudi dialog eliminazione"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  Sei sicuro di voler eliminare questo evento?
                  {eventTitle ? (
                    <>
                      {' '}
                      <span className="font-medium">{eventTitle}</span>
                    </>
                  ) : null}
                </p>
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                  Attenzione: l'operazione è irreversibile.
                </p>
              </div>

              {/* Second confirmation */}
              <div className="space-y-2">
                <label htmlFor="confirm-delete" className="text-sm font-medium text-gray-900">
                  Digita{' '}
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">ELIMINA</span> per
                  confermare
                </label>
                <input
                  id="confirm-delete"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="ELIMINA"
                  disabled={isPending}
                  aria-required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-5 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                Annulla
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending || !canConfirm}
                aria-label="Conferma eliminazione evento"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 />
                    Elimina definitivamente
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
