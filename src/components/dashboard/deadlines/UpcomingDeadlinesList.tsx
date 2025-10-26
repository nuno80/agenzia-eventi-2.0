// ============================================================================
// UPCOMING DEADLINES LIST COMPONENT
// ============================================================================
// FILE: src/components/dashboard/deadlines/UpcomingDeadlinesList.tsx
//
// PURPOSE: Display a list of upcoming deadlines on the dashboard
// FEATURES:
// - Compact list of upcoming deadlines
// - Priority indicators and due dates
// - Links to associated events
// ============================================================================

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, isBefore, isToday } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, ArrowRight, AlertCircle } from 'lucide-react'

// In a real app, this would be imported from a data access layer
type Deadline = {
  id: string
  title: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  eventId: string
  eventName: string
}

export async function UpcomingDeadlinesList() {
  // In a real app, this would be fetched from an API or database
  const deadlines: Deadline[] = [
    {
      id: '1',
      title: 'Conferma menu catering',
      dueDate: '2023-10-15',
      priority: 'high',
      eventId: '1',
      eventName: 'Congresso Nazionale di Cardiologia',
    },
    {
      id: '2',
      title: 'Invio materiali promozionali',
      dueDate: '2023-10-20',
      priority: 'medium',
      eventId: '1',
      eventName: 'Congresso Nazionale di Cardiologia',
    },
    {
      id: '3',
      title: 'Chiusura registrazioni',
      dueDate: '2023-10-25',
      priority: 'high',
      eventId: '1',
      eventName: 'Congresso Nazionale di Cardiologia',
    },
    {
      id: '4',
      title: 'Conferma relatori',
      dueDate: '2023-11-01',
      priority: 'high',
      eventId: '2',
      eventName: 'Workshop Innovazione Medica',
    },
  ]

  // Sort deadlines by due date (closest first) and then by priority
  const today = new Date()
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    const dateA = new Date(a.dueDate)
    const dateB = new Date(b.dueDate)

    // First sort by due date
    const dateDiff = dateA.getTime() - dateB.getTime()
    if (dateDiff !== 0) return dateDiff

    // Then sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: Deadline['priority'] }) => {
    const priorityConfig = {
      high: { label: 'Alta', variant: 'destructive' as const },
      medium: { label: 'Media', variant: 'warning' as const },
      low: { label: 'Bassa', variant: 'secondary' as const },
    }

    const config = priorityConfig[priority]

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-4">
      {sortedDeadlines.length === 0 ? (
        <p className="text-center py-4 text-gray-500">Nessuna scadenza imminente</p>
      ) : (
        <ul className="space-y-4">
          {sortedDeadlines.map((deadline) => {
            const dueDate = new Date(deadline.dueDate)
            const formattedDate = format(dueDate, 'dd MMM yyyy', { locale: it })
            const isOverdue = isBefore(dueDate, today) && !isToday(dueDate)

            return (
              <li
                key={deadline.id}
                className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{deadline.title}</span>
                    <PriorityBadge priority={deadline.priority} />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                      {isOverdue && (
                        <AlertCircle className="h-3.5 w-3.5 inline-block mr-1 text-red-500" />
                      )}
                      {formattedDate}
                    </span>
                    <span>•</span>
                    <Link href={`/eventi/${deadline.eventId}`} className="hover:underline">
                      {deadline.eventName}
                    </Link>
                  </div>
                </div>

                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/eventi/${deadline.eventId}`}>
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
          <Link href="/eventi">Vedi tutte le scadenze</Link>
        </Button>
      </div>
    </div>
  )
}
