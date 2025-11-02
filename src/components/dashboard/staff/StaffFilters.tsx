'use client'
/**
 * FILE: src/components/dashboard/staff/StaffFilters.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: StaffFilters
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Gestisce stato locale dei filtri e notifica il parent
 * - Input e select interattivi
 *
 * PROPS:
 * - onFilterChange: (next: StaffFilterState) => void - Callback a ogni modifica
 *
 * FEATURES:
 * - Campi: ricerca, ruolo, stato, sort
 * - Struttura responsive con grid
 *
 * USAGE:
 * <StaffFilters onFilterChange={setFilters} />
 */

import { useEffect, useMemo, useState } from 'react'

export type StaffFilterState = {
  search: string
  role:
    | 'all'
    | 'hostess'
    | 'steward'
    | 'driver'
    | 'av_tech'
    | 'photographer'
    | 'videographer'
    | 'security'
    | 'catering'
    | 'cleaning'
    | 'other'
  isActive: 'all' | 'active' | 'inactive'
  sortBy: 'name-asc' | 'name-desc' | 'role-asc' | 'role-desc'
  tags: string[]
}

interface StaffFiltersProps {
  onFilterChange: (next: StaffFilterState) => void
}

export function StaffFilters({ onFilterChange }: StaffFiltersProps) {
  const [local, setLocal] = useState<StaffFilterState>({
    search: '',
    role: 'all',
    isActive: 'all',
    sortBy: 'name-asc',
    tags: [],
  })

  useEffect(() => {
    onFilterChange(local)
  }, [local, onFilterChange])

  const roleOptions = useMemo(
    () => [
      { value: 'all', label: 'Tutti i ruoli' },
      { value: 'hostess', label: 'Hostess' },
      { value: 'steward', label: 'Steward' },
      { value: 'driver', label: 'Autista' },
      { value: 'av_tech', label: 'AV Tech' },
      { value: 'photographer', label: 'Fotografo' },
      { value: 'videographer', label: 'Videomaker' },
      { value: 'security', label: 'Sicurezza' },
      { value: 'catering', label: 'Catering' },
      { value: 'cleaning', label: 'Pulizie' },
      { value: 'other', label: 'Altro' },
    ],
    []
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cerca</label>
          <input
            type="text"
            value={local.search}
            onChange={(e) => setLocal((s) => ({ ...s, search: e.target.value }))}
            placeholder="Nome, email, specializzazione..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ruolo</label>
          <select
            value={local.role}
            onChange={(e) =>
              setLocal((s) => ({ ...s, role: e.target.value as StaffFilterState['role'] }))
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stato</label>
          <select
            value={local.isActive}
            onChange={(e) =>
              setLocal((s) => ({ ...s, isActive: e.target.value as StaffFilterState['isActive'] }))
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tutti</option>
            <option value="active">Attivi</option>
            <option value="inactive">Inattivi</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ordina per</label>
          <select
            value={local.sortBy}
            onChange={(e) =>
              setLocal((s) => ({ ...s, sortBy: e.target.value as StaffFilterState['sortBy'] }))
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="name-asc">Nome (A→Z)</option>
            <option value="name-desc">Nome (Z→A)</option>
            <option value="role-asc">Ruolo (A→Z)</option>
            <option value="role-desc">Ruolo (Z→A)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
