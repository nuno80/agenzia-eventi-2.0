'use client'

import { Copy, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteCommunication } from '@/app/actions/communications'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Communication } from '@/db/libsql-schemas/events'
import { CommunicationDetailsDialog } from './CommunicationDetailsDialog'
import { useCommunications } from './CommunicationsContext'

interface CommunicationActionsProps {
  communication: Communication
}

export function CommunicationActions({ communication }: CommunicationActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const { setDraft } = useCommunications()

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa comunicazione?')) return

    setIsDeleting(true)
    try {
      const result = await deleteCommunication(communication.id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (_error) {
      toast.error("Errore durante l'eliminazione")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClone = () => {
    setDraft({
      subject: communication.subject,
      body: communication.body,
      recipientType: communication.recipientType || 'all_participants',
      templateId: communication.templateUsed,
    })
    toast.info('Contenuto copiato nel compositore', {
      description: 'Puoi ora modificare e inviare una nuova email basata su questa.',
    })
    // Scroll to top smoothly to show composer
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetails(true)}
                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Vedi dettagli</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClone}
                className="text-gray-500 hover:text-green-600 hover:bg-green-50"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clona / Riusa</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Elimina</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CommunicationDetailsDialog
        communication={communication}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  )
}
