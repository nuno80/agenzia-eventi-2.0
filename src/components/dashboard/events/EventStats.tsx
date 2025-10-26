// ============================================================================
// EVENT STATS COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventStats.tsx
//
// PURPOSE: Component to display event statistics on the dashboard
// FEATURES:
// - Summary cards with key metrics
// - Visual indicators for status
// ============================================================================

import { CalendarIcon, UsersIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type EventStatsProps = {
  totalEvents: number
  upcomingEvents: number
  totalParticipants: number
  completedEvents: number
}

export function EventStats({
  totalEvents,
  upcomingEvents,
  totalParticipants,
  completedEvents,
}: EventStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Events Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventi totali</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEvents}</div>
          <p className="text-xs text-muted-foreground">
            {completedEvents} completati, {totalEvents - completedEvents} attivi
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Events Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventi in arrivo</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingEvents}</div>
          <p className="text-xs text-muted-foreground">Nei prossimi 30 giorni</p>
        </CardContent>
      </Card>

      {/* Total Participants Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Partecipanti totali</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalParticipants}</div>
          <p className="text-xs text-muted-foreground">
            {totalEvents > 0
              ? `Media di ${Math.round(totalParticipants / totalEvents)} per evento`
              : 'Nessun evento'}
          </p>
        </CardContent>
      </Card>

      {/* Completed Events Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventi completati</CardTitle>
          <CheckIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedEvents}</div>
          <p className="text-xs text-muted-foreground">
            {totalEvents > 0
              ? `${Math.round((completedEvents / totalEvents) * 100)}% del totale`
              : 'Nessun evento'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
