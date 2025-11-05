/**
 * FILE: src/components/dashboard/events/ParticipantsTable.tsx
 *
 * COMPONENT: ParticipantsTable
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Interactive filters and sorting
 * - Search input with state
 * - Row selection (future: bulk actions)
 * - In-memory filtering for fast UX
 *
 * PROPS:
 * - participants: Participant[] - Array of participants
 *
 * FEATURES:
 * - Search by name, email, company
 * - Filter by registration status, payment status
 * - Sort by name, date, company
 * - Responsive: table desktop, cards mobile
 * - Status badges with colors
 * - Export button (placeholder)
 *
 * USAGE:
 * const participants = await getParticipantsByEvent(eventId);
 * <ParticipantsTable participants={participants} />
 */

'use client'

import {
  Building2,
  CheckCircle,
  Clock,
  Download,
  Mail,
  Phone,
  Search,
  Users as UsersIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Participant } from '@/db'
import { getPaymentStatusLabel, getRegistrationStatusLabel } from '@/lib/utils'

interface ParticipantsTableProps {
  participants: Participant[]
}

export function ParticipantsTable({ participants }: ParticipantsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<'name' | 'company' | 'date'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = [...participants]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower) ||
          p.company?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.registrationStatus === statusFilter)
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((p) => p.paymentStatus === paymentFilter)
    }

    // Sorting
    filtered.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
      } else if (sortKey === 'company') {
        cmp = (a.company || '').localeCompare(b.company || '')
      } else {
        const ad = a.registrationDate ? new Date(a.registrationDate).getTime() : 0
        const bd = b.registrationDate ? new Date(b.registrationDate).getTime() : 0
        cmp = ad - bd
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [participants, search, statusFilter, paymentFilter, sortBy])

  const getStatusBadge = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      waitlist: 'bg-blue-100 text-blue-700',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-red-100 text-red-700',
      free: 'bg-gray-100 text-gray-700',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per nome, email, azienda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Registration Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Tutti gli stati</option>
              <option value="confirmed">Confermati</option>
              <option value="pending">In attesa</option>
              <option value="cancelled">Annullati</option>
              <option value="waitlist">Lista d&apos;attesa</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Tutti i pagamenti</option>
              <option value="paid">Pagati</option>
              <option value="pending">In attesa</option>
              <option value="free">Gratuiti</option>
              <option value="refunded">Rimborsati</option>
            </select>
          </div>
        </div>

        {/* Sort and Actions Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">Usa le intestazioni di colonna per ordinare</div>

          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Esporta</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredParticipants.length === participants.length ? (
            <>
              Mostrando <strong>{participants.length}</strong> partecipanti
            </>
          ) : (
            <>
              Mostrando <strong>{filteredParticipants.length}</strong> di{' '}
              <strong>{participants.length}</strong> partecipanti
            </>
          )}
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 cursor-pointer"
                    title="Ordina per partecipante"
                    onClick={() => {
                      setSortKey('name')
                      setSortDir((d) => (sortKey === 'name' ? (d === 'asc' ? 'desc' : 'asc') : d))
                    }}
                  >
                    Partecipante
                    <span
                      aria-hidden
                      className={sortKey === 'name' ? 'text-gray-700' : 'text-gray-300'}
                    >
                      {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '•'}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contatti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 cursor-pointer"
                    title="Ordina per azienda"
                    onClick={() => {
                      setSortKey('company')
                      setSortDir((d) =>
                        sortKey === 'company' ? (d === 'asc' ? 'desc' : 'asc') : d
                      )
                    }}
                  >
                    Azienda
                    <span
                      aria-hidden
                      className={sortKey === 'company' ? 'text-gray-700' : 'text-gray-300'}
                    >
                      {sortKey === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : '•'}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 cursor-pointer"
                    title="Ordina per data registrazione"
                    onClick={() => {
                      setSortKey('date')
                      setSortDir((d) => (sortKey === 'date' ? (d === 'asc' ? 'desc' : 'asc') : d))
                    }}
                  >
                    Check-in data
                    <span
                      aria-hidden
                      className={sortKey === 'date' ? 'text-gray-700' : 'text-gray-300'}
                    >
                      {sortKey === 'date' ? (sortDir === 'asc' ? '▲' : '▼') : '•'}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Nessun partecipante trovato</p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {participant.firstName} {participant.lastName}
                        </div>
                        {participant.jobTitle && (
                          <div className="text-xs text-gray-500">{participant.jobTitle}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{participant.email}</span>
                        </div>
                        {participant.phone && (
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{participant.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {participant.company ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{participant.company}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(participant.registrationStatus)}`}
                      >
                        {getRegistrationStatusLabel(participant.registrationStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(participant.paymentStatus ?? '')}`}
                        >
                          {getPaymentStatusLabel(participant.paymentStatus ?? '')}
                        </span>
                        {participant.ticketPrice && participant.ticketPrice > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            €{participant.ticketPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {participant.checkedIn ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Fatto</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">In attesa</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredParticipants.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nessun partecipante trovato</p>
          </div>
        ) : (
          filteredParticipants.map((participant) => (
            <div key={participant.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">
                    {participant.firstName} {participant.lastName}
                  </div>
                  {participant.jobTitle && (
                    <div className="text-xs text-gray-500 mt-0.5">{participant.jobTitle}</div>
                  )}
                </div>
                {participant.checkedIn && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{participant.email}</span>
                </div>
                {participant.phone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{participant.phone}</span>
                  </div>
                )}
                {participant.company && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span>{participant.company}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(participant.registrationStatus)}`}
                >
                  {getRegistrationStatusLabel(participant.registrationStatus)}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(participant.paymentStatus ?? '')}`}
                >
                  {getPaymentStatusLabel(participant.paymentStatus ?? '')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
