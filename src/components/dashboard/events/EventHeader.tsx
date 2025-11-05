/**
 * FILE: src/components/dashboard/events/EventHeader.tsx
 *
 * COMPONENT: EventHeader
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only component showing event header info
 * - No interactivity (links use Next.js Link)
 * - Receives event data as props
 *
 * PROPS:
 * - event: Event object with all fields
 *
 * FEATURES:
 * - Event title, tagline, dates
 * - Status and priority badges
 * - Location info
 * - Quick stats (participants, budget)
 * - Action buttons (Edit, Share, Export)
 * - Back to events list link
 *
 * USAGE:
 * const event = await getEventById(id);
 * <EventHeader event={event} />
 */

import {
  ArrowLeft,
  Calendar,
  Download,
  Edit,
  Euro,
  ExternalLink,
  MapPin,
  Share2,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { DeleteEventButton } from '@/components/dashboard/events/DeleteEventButton'
import type { Event } from '@/db'
import {
  formatCurrency,
  formatDate,
  formatDaysUntil,
  getPriorityColor,
  getStatusColor,
} from '@/lib/utils'

interface EventHeaderProps {
  event: Event
}

export function EventHeader({ event }: EventHeaderProps) {
  const statusColors = getStatusColor(event.status || 'draft')
  const priorityColors = getPriorityColor(event.priority || 'medium')

  const occupancyPercentage = event.maxParticipants
    ? Math.round(((event.currentParticipants || 0) / event.maxParticipants) * 100)
    : 0

  const budgetPercentage = event.totalBudget
    ? Math.round(((event.currentSpent || 0) / event.totalBudget) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Top Section */}
      <div className="p-6 border-b border-gray-200">
        {/* Back Link */}
        <Link
          href="/eventi"
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna agli eventi</span>
        </Link>

        {/* Header Content */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>

            {/* Tagline */}
            {event.tagline && <p className="text-base text-gray-600 mb-3">{event.tagline}</p>}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors.badge}`}
              >
                {event.status}
              </span>
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full ${priorityColors.badge}`}
              >
                {event.priority}
              </span>
              {event.category && (
                <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                  {event.category}
                </span>
              )}
              {event.isPublic && (
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                  Pubblico
                </span>
              )}
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(event.startDate, { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    {formatDaysUntil(event.startDate)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500">Luogo</div>
                  <div className="text-sm font-medium text-gray-900 truncate">{event.location}</div>
                  {event.venue && (
                    <div className="text-xs text-gray-500 truncate">{event.venue}</div>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Partecipanti</div>
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
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Euro className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Budget</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(event.currentSpent || 0)}
                  </div>
                  {event.totalBudget && (
                    <div className="text-xs text-gray-500">
                      su {formatCurrency(event.totalBudget)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 ml-6">
            <Link
              href={`/eventi/${event.id}/edit`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              <span>Modifica</span>
            </Link>

            <button
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              aria-label="Condividi evento"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              aria-label="Esporta"
            >
              <Download className="w-5 h-5" />
            </button>

            {event.websiteUrl && (
              <a
                href={event.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                aria-label="Apri sito evento"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}

            {/* Delete Button (Desktop) */}
            <DeleteEventButton
              eventId={String(event.id)}
              eventTitle={event.title || ''}
              variant="button"
            />
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="lg:hidden p-4 border-t border-gray-200 flex items-center space-x-2">
        <Link
          href={`/eventi/${event.id}/edit`}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          <span>Modifica</span>
        </Link>

        <button
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          aria-label="Condividi evento"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <button
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          aria-label="Esporta"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Delete Button (Mobile icon) */}
        <DeleteEventButton
          eventId={String(event.id)}
          eventTitle={event.title || ''}
          variant="icon"
        />
      </div>

      {/* Progress Bars */}
      {(event.maxParticipants || event.totalBudget) && (
        <div className="p-6 bg-gray-50 space-y-4">
          {/* Participants Progress */}
          {event.maxParticipants && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Iscrizioni</span>
                <span className="text-gray-900 font-semibold">
                  {event.currentParticipants || 0} / {event.maxParticipants} ({occupancyPercentage}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
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
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">Budget utilizzato</span>
                <span className="text-gray-900 font-semibold">
                  {formatCurrency(event.currentSpent || 0)} / {formatCurrency(event.totalBudget)} (
                  {budgetPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
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
      )}
    </div>
  )
}
