'use client'

import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Communication } from '@/db/libsql-schemas/events'

interface CommunicationDetailsDialogProps {
  communication: Communication
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommunicationDetailsDialog({
  communication,
  open,
  onOpenChange,
}: CommunicationDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Comunicazione</DialogTitle>
          <DialogDescription>
            Inviata il{' '}
            {communication.sentDate
              ? format(communication.sentDate, "d MMMM yyyy 'alle' HH:mm", { locale: it })
              : 'Data sconosciuta'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Stato:</span>
              <span className="ml-2 capitalize">{communication.status}</span>
            </div>
            <div>
              <span className="font-medium text-gray-500">Destinatari:</span>
              <span className="ml-2">
                {communication.recipientCount} ({communication.recipientType})
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Oggetto</h4>
            <p className="text-gray-900 font-medium">{communication.subject}</p>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Messaggio</h4>
            <div
              className="bg-gray-50 p-4 rounded-md text-sm text-gray-800 whitespace-pre-wrap font-mono"
              dangerouslySetInnerHTML={{ __html: communication.body.replace(/\n/g, '<br>') }}
            />
          </div>

          {communication.notes && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Note</h4>
              <p className="text-sm text-gray-600">{communication.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
