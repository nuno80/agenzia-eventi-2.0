// ============================================================================
// EVENTS LIST PAGE
// ============================================================================
// FILE: src/app/(dashboard)/eventi/page.tsx
//
// PURPOSE: Display and manage all events
// FEATURES:
// - List all events with filtering and sorting
// - Create new event button
// - Bulk actions (delete, change status)
// ============================================================================

import { Suspense } from 'react'
import { Card } from '@/components/ui/card'
import { getAllEvents } from '@/lib/dal/events'
import { EventsListClient } from './EventsListClient'

async function EventsList() {
  const events = await getAllEvents()
  return <EventsListClient events={events} />
}

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eventi</h1>
      </div>

      <Card className="p-6">
        <Suspense fallback={<div>Caricamento eventi...</div>}>
          <EventsList />
        </Suspense>
      </Card>
    </div>
  )
}
