// ============================================================================
// EDIT EVENT PAGE
// ============================================================================
// FILE: src/app/(dashboard)/eventi/[id]/modifica/page.tsx
//
// PURPOSE: Edit an existing event
// FEATURES:
// - Pre-filled form with event data
// - Validation with Zod
// - Server Action submission
// ============================================================================

import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { getEventById } from '@/lib/dal/events'
import { EventForm } from '@/components/dashboard/events/EventForm'
import { updateEvent } from '@/app/actions/events'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id)

  if (!event) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Modifica Evento</h1>

      <Card className="p-6">
        <EventForm action={updateEvent} defaultValues={event} isEditing={true} />
      </Card>
    </div>
  )
}
