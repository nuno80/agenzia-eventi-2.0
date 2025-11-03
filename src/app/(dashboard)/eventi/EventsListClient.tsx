/**
 * FILE: src/app/(dashboard)/eventi/EventsListClient.tsx
 *
 * COMPONENT: EventsListClient
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages filter state with useState
 * - Handles filtering/sorting logic in memory
 * - Interactive UI (no server round-trips for filters)
 *
 * PROPS:
 * - events: Event[] - Initial events data from server
 *
 * FEATURES:
 * - Client-side filtering by search, status, priority
 * - Client-side sorting (date, title, participants)
 * - Grid layout responsive (1/2/3 columns)
 * - Empty states (no events, no results)
 * - Create event CTA button
 *
 * PATTERN:
 * - Receives server data as props
 * - All filtering happens in-memory (fast UX)
 * - No additional server requests for filters
 *
 * USAGE:
 * <EventsListClient events={eventsFromDB} />
 */

'use client'
import { CalendarDays, Plus } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { DuplicateEventModal } from '@/components/dashboard/events/DuplicateEventModal'
import { EventCard } from '@/components/dashboard/events/EventCard'
import { EventsFilters, type FilterState } from '@/components/dashboard/events/EventsFilters'
import type { Event } from '../../../db/libsql-schemas'

interface EventsListClientProps {
  events: Event[]
}

export function EventsListClient({ events }: EventsListClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'date-desc',
  })

  // Filter and sort events in memory
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = [...events]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          event.venue?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((event) => event.status === filters.status)
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter((event) => event.priority === filters.priority)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        case 'date-asc':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'participants-desc':
          return (b.currentParticipants || 0) - (a.currentParticipants || 0)
        case 'participants-asc':
          return (a.currentParticipants || 0) - (b.currentParticipants || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [events, filters])

  // Empty state: no events at all
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun evento ancora</h3>
        <p className="text-sm text-gray-600 mb-6">
          Crea il tuo primo evento per iniziare a gestire partecipanti, speaker e sponsor.
        </p>
        <Link
          href="/eventi/nuovo"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Crea Evento</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <EventsFilters onFilterChange={setFilters} />

      {/* Stats and Create Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {filteredAndSortedEvents.length === events.length ? (
            <span>
              Mostrando <span className="font-semibold text-gray-900">{events.length}</span> eventi
            </span>
          ) : (
            <span>
              Mostrando{' '}
              <span className="font-semibold text-gray-900">{filteredAndSortedEvents.length}</span>{' '}
              di <span className="font-semibold text-gray-900">{events.length}</span> eventi
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/eventi/nuovo"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Nuovo Evento</span>
          </Link>
          <DuplicateEventModal />
        </div>
      </div>

      {/* Events Grid or Empty State */}
      {filteredAndSortedEvents.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun risultato</h3>
          <p className="text-sm text-gray-600 mb-4">
            Nessun evento corrisponde ai filtri selezionati.
          </p>
          <button
            onClick={() =>
              setFilters({
                search: '',
                status: 'all',
                priority: 'all',
                sortBy: 'date-desc',
              })
            }
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset filtri
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
