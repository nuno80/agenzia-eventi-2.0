/**
 * FILE: src/components/dashboard/home/UpcomingEvents.tsx
 *
 * COMPONENT: UpcomingEvents
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only list component
 * - No interactivity (just links)
 * - Receives data as props
 *
 * PROPS:
 * - events: Array of Event objects (upcoming events)
 *
 * FEATURES:
 * - Shows next 5 upcoming events
 * - Displays date, location, participants count
 * - Status badge
 * - Days until event
 * - Link to event details
 *
 * USAGE:
 * const events = await getUpcomingEvents(5);
 * <UpcomingEvents events={events} />
 */

import { ArrowRight, Calendar, CalendarDays, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDaysUntil, getStatusColor } from '@/lib/utils'

type Event = {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date
  location: string
  venue: string | null
  maxParticipants: number | null
  currentParticipants: number | null
  status: string
  priority: string
}

interface UpcomingEventsProps {
  events: Event[]
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Prossimi Eventi</h2>
        </div>
        <div className="text-center py-8">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Nessun evento in programma</p>
          <Link
            href="/eventi/nuovo"
            className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Crea il tuo primo evento →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Prossimi Eventi</h2>
        <Link
          href="/eventi"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
        >
          <span>Vedi tutti</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual event card component
 */
function EventCard({ event }: { event: Event }) {
  const statusColors = getStatusColor(event.status)
  const occupancyPercentage = event.maxParticipants
    ? Math.round(((event.currentParticipants || 0) / event.maxParticipants) * 100)
    : 0

  return (
    <Link
      href={`/eventi/${event.id}/overview`}
      className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 truncate">{event.title}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusColors.badge}`}>
              {event.status}
            </span>
          </div>

          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-1 mb-2">{event.description}</p>
          )}
        </div>

        <div className="ml-4 flex-shrink-0 text-right">
          <div className="text-sm font-semibold text-blue-600">
            {formatDaysUntil(event.startDate)}
          </div>
        </div>
      </div>

      {/* Event details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        {/* Date */}
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {formatDate(event.startDate, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {event.startDate.toDateString() !== event.endDate.toDateString() && (
              <div className="text-xs text-gray-500">
                fino al {formatDate(event.endDate, { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{event.location}</div>
            {event.venue && <div className="text-xs text-gray-500 truncate">{event.venue}</div>}
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="w-4 h-4 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-gray-900">
              {event.currentParticipants || 0}
              {event.maxParticipants && ` / ${event.maxParticipants}`}
            </div>
            {event.maxParticipants && (
              <div className="text-xs text-gray-500">{occupancyPercentage}% occupazione</div>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar (if has max participants) */}
      {event.maxParticipants && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                occupancyPercentage >= 90
                  ? 'bg-red-500'
                  : occupancyPercentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
