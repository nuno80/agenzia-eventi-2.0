// ============================================================================
// EVENT LIST COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventList.tsx
//
// PURPOSE: Component to display a list of events with filtering and sorting
// FEATURES:
// - Grid or list view of events
// - Filtering by status, type, date
// - Sorting by various fields
// - Pagination
// ============================================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Event } from '@/db/libsql-schemas/events'
import { EventCard } from './EventCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { deleteEvent } from '@/app/actions/events'
import { toast } from '@/components/ui/use-toast'

type EventListProps = {
  events: Event[]
  totalEvents?: number
}

export function EventList({ events, totalEvents = 0 }: EventListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('startDate')

  // Get unique event types for filter dropdown
  const eventTypes = Array.from(new Set(events.map((event) => event.type)))

  // Filter events based on search term and filters
  const filteredEvents = events.filter((event) => {
    // Search term filter
    const matchesSearch =
      searchTerm === '' ||
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))

    // Status filter
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter

    // Type filter
    const matchesType = typeFilter === 'all' || event.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'startDate':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })

  // Handle event deletion
  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      try {
        await deleteEvent({ id })
        toast({
          title: 'Evento eliminato',
          description: "L'evento è stato eliminato con successo.",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: 'Errore',
          description: "Si è verificato un errore durante l'eliminazione dell'evento.",
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and controls */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Cerca eventi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="draft">Bozza</SelectItem>
              <SelectItem value="published">Pubblicato</SelectItem>
              <SelectItem value="cancelled">Annullato</SelectItem>
              <SelectItem value="completed">Completato</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i tipi</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordina per" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startDate">Data (più recenti)</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="status">Stato</SelectItem>
              <SelectItem value="type">Tipo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Visualizzazione di {sortedEvents.length} eventi
        {totalEvents > 0 && ` su ${totalEvents} totali`}
      </div>

      {/* Events grid */}
      {sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun evento trovato</p>
        </div>
      )}
    </div>
  )
}
