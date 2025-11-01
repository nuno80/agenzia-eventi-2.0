/**
 * FILE: src/app/(dashboard)/eventi/[id]/edit/page.tsx
 *
 * PAGE: Edit Event
 * TYPE: Server Component (async)
 *
 * WHY SERVER:
 * - Fetches event data from database
 * - Validates event exists (notFound if not)
 * - Passes data to EventForm component
 *
 * ROUTE PARAMS:
 * - id: string - Event ID to edit
 *
 * DATA SOURCES:
 * - getEventById(id): Fetch event data
 *
 * FEATURES:
 * - Page header with breadcrumb
 * - EventForm in edit mode with initialData
 * - Success redirect back to event detail
 * - 404 if event doesn't exist
 *
 * USAGE:
 * Accessible at /eventi/[id]/edit route
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getEventById } from '@/lib/dal/events';
import { EventForm } from '@/components/dashboard/events/EventForm';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Main Edit Event Page
 */
export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        {/* Breadcrumb */}
        <Link
          href={`/eventi/${id}/overview`}
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna all'evento</span>
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifica Evento</h1>
          <p className="text-sm text-gray-600 mt-1">
            Aggiorna i dettagli dell'evento
          </p>
        </div>
      </div>

      {/* Event Form with Suspense */}
      <Suspense fallback={<EditEventSkeleton />}>
        <EditEventContent eventId={id} />
      </Suspense>
    </div>
  );
}

/**
 * Edit Event Content Component
 * Async Server Component that fetches event data
 */
async function EditEventContent({ eventId }: { eventId: string }) {
  // Fetch event data
  const event = await getEventById(eventId);

  // 404 if event not found
  if (!event) {
    notFound();
  }

  return (
    <EventForm
      mode="edit"
      initialData={event}
      onSuccess={(id) => {
        // Success callback will redirect to event detail
        // This is handled in the EventForm component
      }}
    />
  );
}

/**
 * Loading Skeleton
 * Shown while event data is being fetched
 */
function EditEventSkeleton() {
  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Caricamento dati evento...</p>
        </div>
      </div>

      {/* Skeleton form sections */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
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
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: 'Evento non trovato',
    };
  }

  return {
    title: `Modifica ${event.title} | EventHub Dashboard`,
    description: `Modifica i dettagli di ${event.title}`,
  };
}
