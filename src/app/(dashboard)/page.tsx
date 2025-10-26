// ============================================================================
// DASHBOARD HOME PAGE
// ============================================================================
// FILE: src/app/(dashboard)/page.tsx
//
// PURPOSE: Main dashboard overview page
// FEATURES:
// - Summary cards with key metrics
// - Recent events list
// - Upcoming deadlines
// ============================================================================

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, UsersIcon, TicketIcon, ClockIcon } from 'lucide-react'
import { getEventStats } from '@/lib/dal/events'
import { getUpcomingDeadlines } from '@/lib/dal/deadlines'
import { RecentEventsList } from '@/components/dashboard/events/RecentEventsList'
import { UpcomingDeadlinesList } from '@/components/dashboard/deadlines/UpcomingDeadlinesList'

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Overview */}
      <Suspense fallback={<div>Caricamento statistiche...</div>}>
        <StatsCards />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventi Recenti</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Caricamento eventi...</div>}>
              <RecentEventsList />
            </Suspense>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Scadenze Imminenti</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Caricamento scadenze...</div>}>
              <UpcomingDeadlinesList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function StatsCards() {
  const stats = await getEventStats()

  const cards = [
    {
      title: 'Eventi Totali',
      value: stats.total,
      icon: CalendarIcon,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Eventi Attivi',
      value: stats.active,
      icon: TicketIcon,
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Partecipanti',
      value: stats.totalParticipants,
      icon: UsersIcon,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Prossimi Eventi',
      value: stats.upcoming,
      icon: ClockIcon,
      color: 'bg-amber-100 text-amber-800',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
              <div className={`p-2 rounded-full ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function RecentEventsList() {
  // This would be replaced with actual data from your DAL
  const events = [
    {
      id: '1',
      name: 'Congresso Nazionale Cardiologia 2025',
      date: '15-17 Nov 2025',
      status: 'upcoming',
    },
    { id: '2', name: 'Workshop Innovazione Digitale', date: '5 Nov 2025', status: 'upcoming' },
    { id: '3', name: 'Conferenza Annuale Enterprise', date: '28-29 Ott 2025', status: 'active' },
  ]

  if (events.length === 0) {
    return <p className="text-gray-500 text-center py-4">Nessun evento recente</p>
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="flex items-center justify-between border-b pb-2">
          <div>
            <p className="font-medium">{event.name}</p>
            <p className="text-sm text-gray-500">{event.date}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              event.status === 'active'
                ? 'bg-green-100 text-green-800'
                : event.status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {event.status === 'active'
              ? 'Attivo'
              : event.status === 'upcoming'
                ? 'In arrivo'
                : 'Completato'}
          </span>
        </li>
      ))}
    </ul>
  )
}

async function UpcomingDeadlinesList() {
  const deadlines = await getUpcomingDeadlines()

  if (deadlines.length === 0) {
    return <p className="text-gray-500 text-center py-4">Nessuna scadenza imminente</p>
  }

  return (
    <ul className="space-y-4">
      {deadlines.map((deadline) => (
        <li key={deadline.id} className="flex items-center justify-between border-b pb-2">
          <div>
            <p className="font-medium">{deadline.title}</p>
            <p className="text-sm text-gray-500">
              {new Date(deadline.dueDate).toLocaleDateString('it-IT')}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              deadline.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : deadline.priority === 'medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            {deadline.priority === 'high'
              ? 'Alta'
              : deadline.priority === 'medium'
                ? 'Media'
                : 'Bassa'}
          </span>
        </li>
      ))}
    </ul>
  )
}
