/**
 * FILE: src/app/(dashboard)/eventi/nuovo/page.tsx
 *
 * PAGE: Create Event
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Simple page that renders Client Component (EventForm)
 * - No data fetching needed for create mode
 * - Provides page structure and metadata
 *
 * FEATURES:
 * - Page header with title
 * - EventForm component in create mode
 * - Breadcrumb navigation
 * - Success redirect to event detail
 *
 * USAGE:
 * Accessible at /eventi/nuovo route
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EventForm } from '@/components/dashboard/events/EventForm';

export const metadata = {
  title: 'Nuovo Evento | EventHub Dashboard',
  description: 'Crea un nuovo evento',
};

export default function CreateEventPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        {/* Breadcrumb */}
        <Link
          href="/eventi"
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna agli eventi</span>
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crea Nuovo Evento</h1>
          <p className="text-sm text-gray-600 mt-1">
            Compila i campi sottostanti per creare un nuovo evento
          </p>
        </div>
      </div>

      {/* Event Form */}
      <EventForm mode="create" />
    </div>
  );
}
