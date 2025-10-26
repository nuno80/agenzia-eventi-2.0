// ============================================================================
// EVENT HEADER COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventHeader.tsx
//
// PURPOSE: Header component for event detail page
// FEATURES:
// - Event title and key information
// - Status badge
// - Action buttons
// ============================================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, MapPinIcon, UsersIcon, PencilIcon, TrashIcon } from 'lucide-react'
import type { Event } from '@/db/libsql-schemas/events'
import { deleteEvent, updateEventStatus } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'

type EventHeaderProps = {
  event: Event
}

export function EventHeader({ event }: EventHeaderProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Status badge color mapping
  const statusColors = {
    draft: 'bg-gray-200 text-gray-800',
    published: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }

  // Status text mapping
  const statusText = {
    draft: 'Bozza',
    published: 'Pubblicato',
    cancelled: 'Annullato',
    completed: 'Completato',
  }

  // Handle event deletion
  const handleDelete = async () => {
    try {
      await deleteEvent({ id: event.id })
      toast({
        title: 'Evento eliminato',
        description: "L'evento è stato eliminato con successo.",
      })
      router.push('/eventi')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Errore',
        description: "Si è verificato un errore durante l'eliminazione dell'evento.",
        variant: 'destructive',
      })
    }
  }

  // Handle status update
  const handleStatusUpdate = async (
    newStatus: 'draft' | 'published' | 'cancelled' | 'completed'
  ) => {
    setIsUpdatingStatus(true)
    try {
      await updateEventStatus({ id: event.id, status: newStatus })
      toast({
        title: 'Stato aggiornato',
        description: `L'evento è stato impostato come "${statusText[newStatus]}".`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Errore',
        description: "Si è verificato un errore durante l'aggiornamento dello stato.",
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="bg-white border-b pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <Badge className={statusColors[event.status as keyof typeof statusColors]}>
              {statusText[event.status as keyof typeof statusText]}
            </Badge>
          </div>

          <p className="text-gray-500 mt-1">{event.type}</p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                {format(new Date(event.startDate), 'PPP', { locale: it })}
                {event.endDate &&
                  event.endDate !== event.startDate &&
                  ` - ${format(new Date(event.endDate), 'PPP', { locale: it })}`}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
                <span>{event.location}</span>
              </div>
            )}

            {event.capacity && (
              <div className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {event.participantCount || 0} / {event.capacity}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isUpdatingStatus}>
              <Button variant="outline">
                {isUpdatingStatus ? 'Aggiornamento...' : 'Cambia stato'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(statusText).map(([status, text]) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() =>
                    handleStatusUpdate(status as 'draft' | 'published' | 'cancelled' | 'completed')
                  }
                  disabled={event.status === status}
                >
                  {text}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit button */}
          <Button variant="outline" onClick={() => router.push(`/eventi/${event.id}/modifica`)}>
            <PencilIcon className="h-4 w-4 mr-2" />
            Modifica
          </Button>

          {/* Delete button */}
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L'evento verrà eliminato permanentemente dal
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
