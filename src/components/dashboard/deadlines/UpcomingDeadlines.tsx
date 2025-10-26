// ============================================================================
// UPCOMING DEADLINES COMPONENT
// ============================================================================
// FILE: src/components/dashboard/deadlines/UpcomingDeadlines.tsx
//
// PURPOSE: Component to display upcoming deadlines on the dashboard
// FEATURES:
// - List of upcoming deadlines with key information
// - Visual indicators for priority
// - Link to deadline details
// ============================================================================

import Link from 'next/link'
import { format, isPast, isToday } from 'date-fns'
import { it } from 'date-fns/locale'
import { ArrowRightIcon } from 'lucide-react'
import type { Deadline } from '@/db/libsql-schemas/deadlines'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type UpcomingDeadlinesProps = {
  deadlines: Deadline[]
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  // Function to determine deadline status
  const getDeadlineStatus = (date: string) => {
    const deadlineDate = new Date(date)
    if (isPast(deadlineDate) && !isToday(deadlineDate)) {
      return 'overdue'
    } else if (isToday(deadlineDate)) {
      return 'today'
    } else {
      return 'upcoming'
    }
  }

  // Status color mapping
  const statusColors = {
    overdue: 'text-red-600',
    today: 'text-amber-600',
    upcoming: 'text-gray-600',
  }

  // Priority color mapping
  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scadenze imminenti</CardTitle>
        <CardDescription>Le prossime scadenze in arrivo</CardDescription>
      </CardHeader>
      <CardContent>
        {deadlines.length > 0 ? (
          <div className="space-y-4">
            {deadlines.map((deadline) => {
              const status = getDeadlineStatus(deadline.dueDate)

              return (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${priorityColors[deadline.priority as keyof typeof priorityColors]}`}
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <Link
                        href={`/scadenze/${deadline.id}`}
                        className="font-medium hover:underline"
                      >
                        {deadline.title}
                      </Link>
                      <div className={`text-sm ${statusColors[status]}`}>
                        {format(new Date(deadline.dueDate), 'PPP', { locale: it })}
                        {status === 'overdue' && ' - In ritardo'}
                        {status === 'today' && ' - Oggi'}
                      </div>
                    </div>
                  </div>
                  <Link href={`/scadenze/${deadline.id}`} passHref>
                    <Button variant="ghost" size="icon">
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">Nessuna scadenza imminente</div>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/scadenze" passHref>
          <Button variant="outline" className="w-full">
            Visualizza tutte le scadenze
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
