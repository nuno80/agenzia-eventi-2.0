/**
 * FILE: src/components/dashboard/events/EventsFilters.tsx
 *
 * COMPONENT: EventsFilters
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Uses useState for filter state
 * - Needs onChange handlers for inputs
 * - Interactive select dropdowns
 *
 * PROPS:
 * - onFilterChange: (filters: FilterState) => void - Callback when filters change
 *
 * FEATURES:
 * - Search by title/description
 * - Filter by status (all, draft, planning, open, ongoing, completed)
 * - Filter by priority (all, low, medium, high, urgent)
 * - Sort by (date, title, participants)
 * - Clear all filters button
 *
 * USAGE:
 * <EventsFilters onFilterChange={(filters) => setFilters(filters)} />
 */

'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

export interface FilterState {
  search: string
  status: string
  priority: string
  sortBy: string
}

interface EventsFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export function EventsFilters({ onFilterChange }: EventsFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'date-desc',
  })

  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      status: 'all',
      priority: 'all',
      sortBy: 'date-desc',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters =
    filters.search !== '' || filters.status !== 'all' || filters.priority !== 'all'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Search and Toggle Row */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca eventi per titolo, descrizione, luogo..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {hasActiveFilters && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
        </button>
      </div>

      {/* Filters Row (Desktop: always visible, Mobile: toggleable) */}
      <div
        className={`
        mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3
        ${showFilters ? 'block' : 'hidden lg:grid'}
      `}
      >
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Tutti</option>
            <option value="draft">Bozza</option>
            <option value="planning">Pianificazione</option>
            <option value="open">Aperto</option>
            <option value="ongoing">In corso</option>
            <option value="completed">Completato</option>
            <option value="cancelled">Annullato</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Priorità</label>
          <select
            value={filters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Tutte</option>
            <option value="low">Bassa</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ordina per</label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="date-desc">Data (più recente)</option>
            <option value="date-asc">Data (meno recente)</option>
            <option value="title-asc">Titolo (A-Z)</option>
            <option value="title-desc">Titolo (Z-A)</option>
            <option value="participants-desc">Partecipanti (↓)</option>
            <option value="participants-asc">Partecipanti (↑)</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4" />
              <span>Reset Filtri</span>
            </button>
          ) : (
            <div className="w-full px-4 py-2 text-center text-xs text-gray-400">
              Nessun filtro attivo
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Summary (Mobile) */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                <span>Status: {filters.status}</span>
                <button
                  onClick={() => updateFilter('status', 'all')}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.priority !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                <span>Priorità: {filters.priority}</span>
                <button
                  onClick={() => updateFilter('priority', 'all')}
                  className="hover:bg-orange-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                <span>Cerca: "{filters.search}"</span>
                <button
                  onClick={() => updateFilter('search', '')}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
