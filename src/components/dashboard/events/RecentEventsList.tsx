// ============================================================================
// RECENT EVENTS LIST COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/RecentEventsList.tsx
//
// PURPOSE: Display a list of recent events on the dashboard
// FEATURES:
// - Compact list of recent events
// - Status indicators and key information
// - Links to event details
// ============================================================================

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, ArrowRight } from 'lucide-react'

// In a real app, this would be imported from a data access layer
type Event = {
  id: string
  name: string
  startDate: string
  endDate?: string
  location: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
}

export async function RecentEventsList() {
  // In a real app, this would be fetched from an API or database
  const events: Event[] = [
    {
      id: '1',
      name: 'Congresso Nazionale di Cardiologia',
      startDate: '2023-11-15',
      endDate: '2023-11-17',
      location: 'Milano',
      status: 'published',
    },
    {
      id: '2',
      name: 'Workshop Innovazione Medica',
      startDate: '2023-12-05',
      location: 'Roma',
      status: 'draft',
    },
    {
      id: '3',
      name: 'Conferenza Internazionale di Oncologia',
      startDate: '2023-10-20',
      endDate: '2023-10-22',
      location: 'Firenze',
      status: 'completed',
    },
    {
      id: '4',
      name: 'Simposio di Neurologia',
      startDate: '2023-09-10',
      location: 'Napoli',
      status: 'cancelled',
    },
  ]

  // Status badge component
  const StatusBadge = ({ status }: { status: Event['status'] }) => {
    const statusConfig = {
      draft: { label: 'Bozza', variant: 'secondary' as const },
      published: { label: 'Pubblicato', variant: 'success' as const },
      cancelled: { label: 'Cancellato', variant: 'destructive' as const },
      completed: { label: 'Completato', variant: 'outline' as const },
    }

    const config = statusConfig[status]

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <p className="text-center py-4 text-gray-500">Nessun evento recente</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => {
            const startDate = format(new Date(event.startDate), 'dd MMM yyyy', { locale: it })

            return (
              <li
                key={event.id}
                className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/eventi/${event.id}`} className="font-medium hover:underline">
                      {event.name}
                    </Link>
                    <StatusBadge status={event.status} />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>{startDate}</span>
                    <span>•</span>
                    <span>{event.location}</span>
                  </div>
                </div>

                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/eventi/${event.id}`}>
                    <ArrowRight className="h-4 w-4" />
                    <span className="sr-only">Visualizza evento</span>
                  </Link>
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="pt-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/eventi">Vedi tutti gli eventi</Link>
        </Button>
      </div>
    </div>
  )
}
