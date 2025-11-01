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

import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAllEvents } from '@/lib/dal/events'
import { EventsListClient } from './EventsListClient'

export default async function EventsPage() {
  const events = await getAllEvents()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Eventi</h1>

        <Link href="/eventi/nuovo">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuovo Evento
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <Suspense fallback={<div>Caricamento eventi...</div>}>
          <EventsListClient events={events} />
        </Suspense>
      </Card>
    </div>
  )
}
