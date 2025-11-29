/**
 * FILE: src/components/dashboard/events/surveys/DeleteResponseButton.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: DeleteResponseButton
 * TYPE: Client Component
 *
 * PROPS:
 * - responseId: string
 *
 * FEATURES:
 * - Delete confirmation
 * - Server action call
 * - Toast notification
 */

'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteResponse } from '@/app/actions/surveys'

interface DeleteResponseButtonProps {
  responseId: string
}

export function DeleteResponseButton({ responseId }: DeleteResponseButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa risposta?')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteResponse(responseId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (_error) {
      toast.error("Errore durante l'eliminazione")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Elimina risposta"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
