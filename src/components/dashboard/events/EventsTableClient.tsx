// ============================================================================
// EVENTS TABLE CLIENT COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventsTableClient.tsx
//
// PURPOSE: Client component for the events table with interactive features
// ============================================================================

'use client'

import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteEvent } from '@/app/actions/events'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import type { Event } from '@/db/libsql-schemas/events'

type EventsTableClientProps = {
  events: Event[]
}

export function EventsTableClient({ events }: EventsTableClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Status badge colors
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  // Status display names
  const statusNames: Record<string, string> = {
    draft: 'Bozza',
    upcoming: 'In arrivo',
    active: 'Attivo',
    completed: 'Completato',
    cancelled: 'Annullato',
  }

  // Event type display names
  const typeNames: Record<string, string> = {
    congresso_medico: 'Congresso Medico',
    conferenza_aziendale: 'Conferenza Aziendale',
    workshop: 'Workshop',
    fiera: 'Fiera',
  }

  // Handle delete event
  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      const result = await deleteEvent(id)

      if (result.success) {
        toast({
          title: 'Evento eliminato',
          description: "L'evento è stato eliminato con successo",
        })
        router.refresh()
      } else {
        toast({
          title: 'Errore',
          description:
            result.error || "Si è verificato un errore durante l'eliminazione dell'evento",
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Errore',
        description: "Si è verificato un errore durante l'eliminazione dell'evento",
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Luogo</TableHead>
            <TableHead>Partecipanti</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                Nessun evento trovato
              </TableCell>
            </TableRow>
          )}

          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">
                <Link href={`/eventi/${event.id}`} className="hover:underline">
                  {event.name}
                </Link>
              </TableCell>
              <TableCell>{typeNames[event.type] || event.type}</TableCell>
              <TableCell>
                {format(new Date(event.startDate), 'dd MMM yyyy', { locale: it })}
              </TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>
                {event.registeredCount} / {event.capacity}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[event.status]}>
                  {statusNames[event.status] || event.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Azioni</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/eventi/${event.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizza
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/eventi/${event.id}/modifica`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifica
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(event.id)}
                      disabled={isDeleting === event.id}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting === event.id ? 'Eliminazione...' : 'Elimina'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
