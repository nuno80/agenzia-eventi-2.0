/**
 * FILE: src/app/(dashboard)/eventi/[id]/edit/page.tsx
 *
 * PAGE: Edit Event
 * TYPE: Server Component (Async content wrapped in Suspense)
 */

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { EventForm } from '@/components/dashboard/events/EventForm'
import { getEventById } from '@/lib/dal/events'

interface PageParams {
  id: string
}
interface EditEventPageProps {
  params: Promise<PageParams>
}

export default function EditEventPage({ params }: EditEventPageProps) {
  return (
    <Suspense fallback={<EditEventSkeleton />}>
      <EditEventContent paramsPromise={params} />
    </Suspense>
  )
}

async function EditEventContent({ paramsPromise }: { paramsPromise: Promise<PageParams> }) {
  const { id } = await paramsPromise

  // Header + link back
  const header = (
    <div>
      <Link
        href={`/eventi/${id}/overview`}
        className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Torna all'evento</span>
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modifica Evento</h1>
        <p className="text-sm text-gray-600 mt-1">Aggiorna i dettagli dell'evento</p>
      </div>
    </div>
  )

  // Fetch event data
  const event = await getEventById(id)
  if (!event) notFound()

  return (
    <div className="space-y-6">
      {header}
      {/* Client form without function props from server */}
      <EventForm mode="edit" initialData={event} />
    </div>
  )
}

function EditEventSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Caricamento dati evento...</p>
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { id } = await params
  const event = await getEventById(id)
  if (!event) {
    return { title: 'Evento non trovato' }
  }
  return {
    title: `Modifica ${event.title} | EventHub Dashboard`,
    description: `Modifica i dettagli di ${event.title}`,
  }
}
