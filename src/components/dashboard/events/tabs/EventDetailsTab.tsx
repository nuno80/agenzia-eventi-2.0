// ============================================================================
// EVENT DETAILS TAB COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/tabs/EventDetailsTab.tsx
//
// PURPOSE: Display detailed information about an event
// FEATURES:
// - Event information display
// - Formatted dates and statistics
// - Description with markdown support
// ============================================================================

import type { Event } from '@/db/libsql-schemas/events'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, MapPinIcon, UsersIcon, BanknoteIcon, ClockIcon } from 'lucide-react'

type EventDetailsTabProps = {
  event: Event
}

export function EventDetailsTab({ event }: EventDetailsTabProps) {
  // Format dates
  const startDate = format(new Date(event.startDate), 'dd MMMM yyyy', { locale: it })
  const endDate = event.endDate
    ? format(new Date(event.endDate), 'dd MMMM yyyy', { locale: it })
    : null

  // Calculate event duration in days
  const durationDays = event.endDate
    ? Math.ceil(
        (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 1

  // Format event type for display
  const eventTypeMap: Record<string, string> = {
    congresso_medico: 'Congresso Medico',
    conferenza_aziendale: 'Conferenza Aziendale',
    workshop: 'Workshop',
    fiera: 'Fiera',
  }

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Informazioni Generali</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p>
                  {startDate}
                  {endDate ? ` - ${endDate}` : ''}
                </p>
                <p className="text-sm text-gray-500">
                  {durationDays === 1 ? '1 giorno' : `${durationDays} giorni`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Luogo</p>
                <p>{event.location}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <UsersIcon className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Partecipanti</p>
                <p>
                  {event.registeredCount} / {event.capacity}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round((event.registeredCount / event.capacity) * 100)}% di capacità
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BanknoteIcon className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">Budget</p>
                <p>€{event.budget.toLocaleString('it-IT')}</p>
                <p className="text-sm text-gray-500">
                  Speso: €{event.spent.toLocaleString('it-IT')} (
                  {Math.round((event.spent / event.budget) * 100)}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Type */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Tipo di Evento</h2>
        <p>{eventTypeMap[event.type] || event.type}</p>
      </div>

      {/* Description */}
      {event.description && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Descrizione</h2>
          <div className="prose max-w-none">
            <p>{event.description}</p>
          </div>
        </div>
      )}

      {/* Creation and Update Info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <p>
            Creato il {format(new Date(event.createdAt), 'dd MMM yyyy', { locale: it })}
            {event.updatedAt &&
              event.updatedAt !== event.createdAt &&
              ` · Aggiornato il ${format(new Date(event.updatedAt), 'dd MMM yyyy', { locale: it })}`}
          </p>
        </div>
      </div>
    </div>
  )
}
