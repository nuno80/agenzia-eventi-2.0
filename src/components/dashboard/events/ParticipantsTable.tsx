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

'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Mail,
  Phone,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Users as UsersIcon,
  Filter
} from 'lucide-react';
import { formatDate, getRegistrationStatusLabel, getPaymentStatusLabel } from '@/lib/utils';
import type { Participant } from '@/lib/db/schema';

interface ParticipantsTableProps {
  participants: Participant[];
}

export function ParticipantsTable({ participants }: ParticipantsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name-asc');

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = [...participants];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.firstName.toLowerCase().includes(searchLower) ||
        p.lastName.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.company?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.registrationStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(p => p.paymentStatus === paymentFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        case 'name-desc':
          return `${b.lastName} ${b.firstName}`.localeCompare(`${a.lastName} ${a.firstName}`);
        case 'date-desc':
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
        case 'date-asc':
          return new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
        case 'company-asc':
          return (a.company || '').localeCompare(b.company || '');
        case 'company-desc':
          return (b.company || '').localeCompare(a.company || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [participants, search, statusFilter, paymentFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      waitlist: 'bg-blue-100 text-blue-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-red-100 text-red-700',
      free: 'bg-gray-100 text-gray-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

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
              <option value="waitlist">Lista d'attesa</option>
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
          <div className="flex items-center space-x-3">
            <label className="text-sm text-gray-600">Ordina:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name-asc">Nome (A-Z)</option>
              <option value="name-desc">Nome (Z-A)</option>
              <option value="date-desc">Data (più recente)</option>
              <option value="date-asc">Data (meno recente)</option>
              <option value="company-asc">Azienda (A-Z)</option>
              <option value="company-desc">Azienda (Z-A)</option>
            </select>
          </div>

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
            <>Mostrando <strong>{participants.length}</strong> partecipanti</>
          ) : (
            <>Mostrando <strong>{filteredParticipants.length}</strong> di <strong>{participants.length}</strong> partecipanti</>
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
                  Partecipante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contatti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azienda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
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
                  <tr key={participant.id} className="hover:bg-gray-50">
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(participant.registrationStatus)}`}>
                        {getRegistrationStatusLabel(participant.registrationStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(participant.paymentStatus)}`}>
                          {getPaymentStatusLabel(participant.paymentStatus)}
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
                {participant.checkedIn && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
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
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(participant.registrationStatus)}`}>
                  {getRegistrationStatusLabel(participant.registrationStatus)}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(participant.paymentStatus)}`}>
                  {getPaymentStatusLabel(participant.paymentStatus)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
