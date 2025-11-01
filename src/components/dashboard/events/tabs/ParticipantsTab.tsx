/**
 * FILE: src/components/dashboard/events/tabs/ParticipantsTab.tsx
 *
 * COMPONENT: ParticipantsTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches participant data and stats
 * - Renders stats cards (display only)
 * - Passes data to Client Component (ParticipantsTable)
 *
 * PROPS:
 * - eventId: string - Event ID
 *
 * FEATURES:
 * - Statistics cards (total, confirmed, checked-in, revenue)
 * - Registration status breakdown
 * - Payment status breakdown
 * - Interactive participants table
 *
 * USAGE:
 * <ParticipantsTab eventId={event.id} />
 */

import {
  CheckCircle,
  Clock,
  Euro,
  Hourglass,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react'
import { ParticipantsTable } from '@/components/dashboard/events/ParticipantsTable'
import { getParticipantStats, getParticipantsByEvent } from '@/lib/dal/participants'
import { formatCurrency } from '@/lib/utils'

interface ParticipantsTabProps {
  eventId: string
}

export async function ParticipantsTab({ eventId }: ParticipantsTabProps) {
  // Fetch data in parallel
  const [participants, stats] = await Promise.all([
    getParticipantsByEvent(eventId),
    getParticipantStats(eventId),
  ])

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Participants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Totale</div>
            </div>
          </div>
        </div>

        {/* Confirmed */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confermati</div>
            </div>
          </div>
        </div>

        {/* Checked In */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.checkedIn}</div>
              <div className="text-sm text-gray-600">Check-in</div>
            </div>
          </div>
          {stats.confirmed > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {Math.round((stats.checkedIn / stats.confirmed) * 100)}% dei confermati
            </div>
          )}
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Euro className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Incassato</div>
            </div>
          </div>
          {stats.pendingRevenue > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {formatCurrency(stats.pendingRevenue)} in attesa
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stato Iscrizioni</h3>
          <div className="space-y-3">
            <StatusRow
              icon={<UserCheck className="w-5 h-5 text-green-600" />}
              label="Confermati"
              count={stats.confirmed}
              total={stats.total}
              color="green"
            />
            <StatusRow
              icon={<Hourglass className="w-5 h-5 text-yellow-600" />}
              label="In attesa"
              count={stats.pending}
              total={stats.total}
              color="yellow"
            />
            <StatusRow
              icon={<UserPlus className="w-5 h-5 text-blue-600" />}
              label="Lista d'attesa"
              count={stats.waitlist}
              total={stats.total}
              color="blue"
            />
            <StatusRow
              icon={<UserX className="w-5 h-5 text-red-600" />}
              label="Annullati"
              count={stats.cancelled}
              total={stats.total}
              color="red"
            />
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stato Pagamenti</h3>
          <div className="space-y-3">
            <StatusRow
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Pagati"
              count={stats.paid}
              total={stats.total}
              color="green"
              amount={stats.totalRevenue}
            />
            <StatusRow
              icon={<Clock className="w-5 h-5 text-yellow-600" />}
              label="In attesa"
              count={stats.pendingPayment}
              total={stats.total}
              color="yellow"
              amount={stats.pendingRevenue}
            />
            <StatusRow
              icon={<UserCheck className="w-5 h-5 text-gray-600" />}
              label="Gratuiti"
              count={stats.free}
              total={stats.total}
              color="gray"
            />
            {stats.refunded > 0 && (
              <StatusRow
                icon={<UserX className="w-5 h-5 text-red-600" />}
                label="Rimborsati"
                count={stats.refunded}
                total={stats.total}
                color="red"
              />
            )}
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista Partecipanti</h3>
        <ParticipantsTable participants={participants} />
      </div>
    </div>
  )
}

/**
 * Status Row Component
 * Displays a status metric with progress bar
 */
function StatusRow({
  icon,
  label,
  count,
  total,
  color,
  amount,
}: {
  icon: React.ReactNode
  label: string
  count: number
  total: number
  color: 'green' | 'yellow' | 'blue' | 'red' | 'gray'
  amount?: number
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {count} <span className="text-gray-500 font-normal">({percentage}%)</span>
          </div>
          {amount !== undefined && amount > 0 && (
            <div className="text-xs text-gray-500">{formatCurrency(amount)}</div>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
