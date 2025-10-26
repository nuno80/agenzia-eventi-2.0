// ============================================================================
// NEW EVENT PAGE
// ============================================================================
// FILE: src/app/(dashboard)/eventi/nuovo/page.tsx
//
// PURPOSE: Create a new event
// FEATURES:
// - Form for creating new events
// - Validation with Zod
// - Server Action submission
// ============================================================================

import { EventForm } from '@/components/dashboard/events/EventForm'
import { Card } from '@/components/ui/card'
import { createEvent } from '@/app/actions/events'

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Nuovo Evento</h1>

      <Card className="p-6">
        <EventForm action={createEvent} />
      </Card>
    </div>
  )
}
