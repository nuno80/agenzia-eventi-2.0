// ============================================================================
// RECENT EVENTS COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/RecentEvents.tsx
//
// PURPOSE: Component to display recent events on the dashboard
// FEATURES:
// - List of recent events with key information
// - Link to event details
// ============================================================================

import Link from 'next/link'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, ArrowRightIcon } from 'lucide-react'
import type { Event } from '@/db/libsql-schemas/events'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type RecentEventsProps = {
  events: Event[]
}

export function RecentEvents({ events }: RecentEventsProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventi recenti</CardTitle>
        <CardDescription>Gli ultimi eventi creati o aggiornati</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/eventi/${event.id}`} className="font-medium hover:underline">
                      {event.name}
                    </Link>
                    <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                      {statusText[event.status as keyof typeof statusText]}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(new Date(event.startDate), 'PPP', { locale: it })}
                  </div>
                </div>
                <Link href={`/eventi/${event.id}`} passHref>
                  <Button variant="ghost" size="icon">
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">Nessun evento recente</div>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/eventi" passHref>
          <Button variant="outline" className="w-full">
            Visualizza tutti gli eventi
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
