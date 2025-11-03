'use client'

/**
 * FILE: src/app/(dashboard)/persone/staff/StaffListClient.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: StaffListClient
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Gestisce lo stato dei filtri (useState)
 * - Effettua il filtering/sorting in-memory per UX reattiva
 * - Nessun round-trip al server per i filtri
 *
 * PROPS:
 * - staff: StaffDTO[] - Dati iniziali dello staff dal server
 *
 * FEATURES:
 * - Ricerca testo su nome/cognome/email/specializzazione
 * - Filtri per ruolo, stato attivo/inattivo, tags
 * - Sorting per nome o ruolo
 * - Empty states (nessun membro, nessun risultato)
 *
 * USAGE:
 * <StaffListClient staff={staff} />
 */

import { Plus, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { StaffCard } from '@/components/dashboard/staff/StaffCard'
import { type StaffFilterState, StaffFilters } from '@/components/dashboard/staff/StaffFilters'
import type { StaffDTO } from '@/lib/dal/staff'

interface StaffListClientProps {
  staff: StaffDTO[]
  events: { id: string; title: string; startDate?: Date | string; endDate?: Date | string }[]
}

export function StaffListClient({ staff, events }: StaffListClientProps) {
  const [filters, setFilters] = useState<StaffFilterState>({
    search: '',
    role: 'all',
    isActive: 'all',
    sortBy: 'name-asc',
    tags: [],
  })

  const filteredAndSorted = useMemo(() => {
    let rows = [...staff]

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase()
      rows = rows.filter((s) =>
        [s.firstName, s.lastName, s.email, s.specialization]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(q))
      )
    }

    // Role
    if (filters.role !== 'all') {
      rows = rows.filter((s) => s.role === filters.role)
    }

    // isActive
    if (filters.isActive !== 'all') {
      rows = rows.filter((s) => s.isActive === (filters.isActive === 'active'))
    }

    // Tags (AND)
    if (filters.tags && filters.tags.length > 0) {
      rows = rows.filter((s) => {
        if (!s.tags) return false
        return filters.tags.every((tg) => s.tags?.includes(tg))
      })
    }

    // Sorting
    rows.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
        case 'name-desc':
          return `${b.lastName} ${b.firstName}`.localeCompare(`${a.lastName} ${a.firstName}`)
        case 'role-asc':
          return a.role.localeCompare(b.role)
        case 'role-desc':
          return b.role.localeCompare(a.role)
        default:
          return 0
      }
    })

    return rows
  }, [staff, filters])

  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <UsersRound className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun membro staff</h3>
        <p className="text-sm text-gray-600 mb-6">
          Aggiungi il tuo primo membro per iniziare a gestire i turni.
        </p>
        <Link
          href="#"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg opacity-60 cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          <span>Aggiungi Membro</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtri */}
      <StaffFilters onFilterChange={setFilters} />

      {/* Stats e CTA */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {filteredAndSorted.length === staff.length ? (
            <span>
              Mostrando <span className="font-semibold text-gray-900">{staff.length}</span> membri
            </span>
          ) : (
            <span>
              Mostrando{' '}
              <span className="font-semibold text-gray-900">{filteredAndSorted.length}</span> di{' '}
              <span className="font-semibold text-gray-900">{staff.length}</span> membri
            </span>
          )}
        </div>

        <Link
          href="#"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg opacity-60 cursor-not-allowed text-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuovo Membro</span>
          <span className="sm:hidden">Nuovo</span>
        </Link>
      </div>

      {/* Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UsersRound className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun risultato</h3>
          <button
            onClick={() =>
              setFilters({ search: '', role: 'all', isActive: 'all', sortBy: 'name-asc', tags: [] })
            }
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset filtri
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map((s) => (
            <div key={s.id} className="space-y-2">
              <StaffCard staff={s} events={events} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
