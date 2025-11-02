/**
 * FILE: src/components/dashboard/events/EventCard.tsx
 *
 * COMPONENT: EventCard
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only component, no interactivity
 * - Just renders event data passed as props
 * - Links use Next.js Link (no client state needed)
 *
 * PROPS:
 * - event: Event object with all fields
 *
 * FEATURES:
 * - Event title, date, location
 * - Status and priority badges
 * - Participant count with progress
 * - Budget overview (spent/total)
 * - Quick actions (View, Edit)
 *
 * USAGE:
 * <EventCard event={event} />
 */

import { ArrowRight, Calendar, Edit, Euro, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { DuplicateEventButton } from '@/components/dashboard/events/DuplicateEventButton'
import type { Event } from '@/db'
import {
  formatCurrency,
  formatDate,
  formatDaysUntil,
  getPriorityColor,
  getStatusColor,
} from '@/lib/utils'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const statusColors = getStatusColor(event.status || 'draft')
  const priorityColors = getPriorityColor(event.priority || 'medium')

  const occupancyPercentage = event.maxParticipants
    ? Math.round(((event.currentParticipants || 0) / event.maxParticipants) * 100)
    : 0

  const budgetPercentage = event.totalBudget
    ? Math.round(((event.currentSpent || 0) / event.totalBudget) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <Link
              href={`/eventi/${event.id}/overview`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
            >
              {event.title}
            </Link>
          </div>

          {event.tagline && <p className="text-sm text-gray-600 mb-2">{event.tagline}</p>}

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded ${statusColors.badge}`}>
              {event.status}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded ${priorityColors.badge}`}>
              {event.priority}
            </span>
            {event.category && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded">
                {event.category}
              </span>
            )}
          </div>
        </div>

        <div className="ml-4 flex-shrink-0 text-right">
          <div className="text-sm font-semibold text-blue-600 mb-1">
            {formatDaysUntil(event.startDate)}
          </div>
          <div className="flex items-center space-x-1">
            <DuplicateEventButton eventId={event.id} eventTitle={event.title} variant="icon" />
            <Link
              href={`/eventi/${event.id}/edit`}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Modifica"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <Link
              href={`/eventi/${event.id}/overview`}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Visualizza"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Date */}
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Date</div>
            <div className="text-sm font-medium text-gray-900">
              {formatDate(event.startDate, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {event.startDate.toDateString() !== event.endDate.toDateString() && (
              <div className="text-xs text-gray-500">
                → {formatDate(event.endDate, { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Luogo</div>
            <div className="text-sm font-medium text-gray-900 truncate">{event.location}</div>
            {event.venue && <div className="text-xs text-gray-500 truncate">{event.venue}</div>}
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Partecipanti</div>
            <div className="text-sm font-medium text-gray-900">
              {event.currentParticipants || 0}
              {event.maxParticipants && ` / ${event.maxParticipants}`}
            </div>
            {event.maxParticipants && (
              <div className="text-xs text-gray-500">{occupancyPercentage}% riempito</div>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Euro className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-0.5">Budget</div>
            <div className="text-sm font-medium text-gray-900">
              {formatCurrency(event.currentSpent || 0)}
            </div>
            {event.totalBudget && (
              <div className="text-xs text-gray-500">
                di {formatCurrency(event.totalBudget)} ({budgetPercentage}%)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2">
        {/* Participants Progress */}
        {event.maxParticipants && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Iscrizioni</span>
              <span>{occupancyPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
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

        {/* Budget Progress */}
        {event.totalBudget && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Budget utilizzato</span>
              <span>{budgetPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  budgetPercentage >= 90
                    ? 'bg-red-500'
                    : budgetPercentage >= 70
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
