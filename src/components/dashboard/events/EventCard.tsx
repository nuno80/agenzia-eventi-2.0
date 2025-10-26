// ============================================================================
// EVENT CARD COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventCard.tsx
//
// PURPOSE: Card component to display event information in a list or grid
// FEATURES:
// - Displays key event information
// - Status badge
// - Action buttons
// - Link to event details
// ============================================================================

import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { Event } from '@/db/libsql-schemas/events'

type EventCardProps = {
  event: Event
  onDelete?: (id: string) => void
}

export function EventCard({ event, onDelete }: EventCardProps) {
  // Status badge color mapping
  const statusColors = {
    draft: 'bg-gray-200 text-gray-800',
    published: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">
            <Link href={`/eventi/${event.id}`} className="hover:underline">
              {event.name}
            </Link>
          </h3>
          <Badge className={statusColors[event.status as keyof typeof statusColors]}>
            {event.status === 'draft' && 'Bozza'}
            {event.status === 'published' && 'Pubblicato'}
            {event.status === 'cancelled' && 'Annullato'}
            {event.status === 'completed' && 'Completato'}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">{event.type}</p>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {format(new Date(event.startDate), 'PPP', { locale: it })}
              {event.endDate &&
                event.endDate !== event.startDate &&
                ` - ${format(new Date(event.endDate), 'PPP', { locale: it })}`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center text-sm">
              <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>{event.location}</span>
            </div>
          )}

          {event.capacity && (
            <div className="flex items-center text-sm">
              <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span>
                {event.participantCount || 0} / {event.capacity}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t">
        <div className="flex justify-between w-full">
          <Link href={`/eventi/${event.id}`} passHref>
            <Button variant="outline" size="sm">
              Dettagli
            </Button>
          </Link>

          <div className="flex gap-2">
            <Link href={`/eventi/${event.id}/modifica`} passHref>
              <Button variant="outline" size="sm">
                Modifica
              </Button>
            </Link>

            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => onDelete(event.id)}
              >
                Elimina
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
