// ============================================================================
// EVENT DETAIL PAGE
// ============================================================================
// FILE: src/app/(dashboard)/eventi/[id]/page.tsx
//
// PURPOSE: View and manage a specific event
// FEATURES:
// - Event details with edit capability
// - Tabs for different event aspects (participants, speakers, etc.)
// - Actions (delete, duplicate, change status)
// ============================================================================

import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { EventHeader } from '@/components/dashboard/events/EventHeader'
import { BudgetTab } from '@/components/dashboard/events/tabs/BudgetTab'
import { DeadlinesTab } from '@/components/dashboard/events/tabs/DeadlinesTab'
import { EventDetailsTab } from '@/components/dashboard/events/tabs/EventDetailsTab'
import { ParticipantsTab } from '@/components/dashboard/events/tabs/ParticipantsTab'
import { SpeakersTab } from '@/components/dashboard/events/tabs/SpeakersTab'
import { SponsorsTab } from '@/components/dashboard/events/tabs/SponsorsTab'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getEventById } from '@/lib/dal/events'

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id)

  if (!event) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <EventHeader event={event} />

      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="participants">Partecipanti</TabsTrigger>
          <TabsTrigger value="speakers">Relatori</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsor</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="deadlines">Scadenze</TabsTrigger>
        </TabsList>

        <Card className="mt-6 p-6">
          <TabsContent value="details">
            <Suspense fallback={<div>Caricamento dettagli...</div>}>
              <EventDetailsTab event={event} />
            </Suspense>
          </TabsContent>

          <TabsContent value="participants">
            <Suspense fallback={<div>Caricamento partecipanti...</div>}>
              <ParticipantsTab eventId={event.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="speakers">
            <Suspense fallback={<div>Caricamento relatori...</div>}>
              <SpeakersTab eventId={event.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="sponsors">
            <Suspense fallback={<div>Caricamento sponsor...</div>}>
              <SponsorsTab eventId={event.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="budget">
            <Suspense fallback={<div>Caricamento budget...</div>}>
              <BudgetTab eventId={event.id} />
            </Suspense>
          </TabsContent>

          <TabsContent value="deadlines">
            <Suspense fallback={<div>Caricamento scadenze...</div>}>
              <DeadlinesTab eventId={event.id} />
            </Suspense>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  )
}
