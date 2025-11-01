/**
 * FILE: src/components/dashboard/events/tabs/OverviewTab.tsx
 *
 * COMPONENT: OverviewTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only content
 * - Receives event data as props
 * - No interactivity needed
 *
 * PROPS:
 * - event: Event object with all fields
 * - participantsCount: Number of participants
 * - speakersCount: Number of speakers
 * - sponsorsCount: Number of sponsors
 *
 * FEATURES:
 * - Event description
 * - Key dates (start, end, registration)
 * - Location details with map link
 * - Quick stats cards
 * - Tags display
 * - Notes section
 *
 * USAGE:
 * const event = await getEventById(id);
 * const stats = await getEventParticipantStats(id);
 * <OverviewTab event={event} participantsCount={stats.total} />
 */

import {
  Calendar,
  MapPin,
  Users,
  Mic,
  Building2,
  Globe,
  Tag,
  FileText,
  Clock,
  DoorOpen,
  DoorClosed
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Event } from '@/lib/db/schema';

interface OverviewTabProps {
  event: Event;
  participantsCount?: number;
  speakersCount?: number;
  sponsorsCount?: number;
}

export function OverviewTab({
  event,
  participantsCount = 0,
  speakersCount = 0,
  sponsorsCount = 0
}: OverviewTabProps) {
  // Parse tags if they exist
  const tags = event.tags ? JSON.parse(event.tags) : [];

  return (
    <div className="space-y-6">
      {/* Description */}
      {event.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Descrizione
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Participants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {participantsCount}
              </div>
              <div className="text-sm text-gray-600">Partecipanti</div>
            </div>
          </div>
        </div>

        {/* Speakers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mic className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {speakersCount}
              </div>
              <div className="text-sm text-gray-600">Relatori</div>
            </div>
          </div>
        </div>

        {/* Sponsors */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Building2 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {sponsorsCount}
              </div>
              <div className="text-sm text-gray-600">Sponsor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dates Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Date Evento</span>
          </h3>

          <div className="space-y-4">
            {/* Start Date */}
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Inizio</div>
                <div className="text-sm text-gray-600">
                  {formatDateTime(event.startDate)}
                </div>
              </div>
            </div>

            {/* End Date */}
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Fine</div>
                <div className="text-sm text-gray-600">
                  {formatDateTime(event.endDate)}
                </div>
              </div>
            </div>

            {/* Registration Open */}
            {event.registrationOpenDate && (
              <div className="flex items-start space-x-3 pt-4 border-t border-gray-200">
                <DoorOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Apertura Iscrizioni
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(event.registrationOpenDate)}
                  </div>
                </div>
              </div>
            )}

            {/* Registration Close */}
            {event.registrationCloseDate && (
              <div className="flex items-start space-x-3">
                <DoorClosed className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Chiusura Iscrizioni
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(event.registrationCloseDate)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Luogo</span>
          </h3>

          <div className="space-y-3">
            {/* Venue */}
            {event.venue && (
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Sede
                </div>
                <div className="text-sm text-gray-600">
                  {event.venue}
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">
                Località
              </div>
              <div className="text-sm text-gray-600">
                {event.location}
              </div>
            </div>

            {/* Address */}
            {event.address && (
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Indirizzo
                </div>
                <div className="text-sm text-gray-600">
                  {event.address}
                  {event.city && `, ${event.city}`}
                  {event.country && `, ${event.country}`}
                </div>
              </div>
            )}

            {/* Map Link */}
            {event.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${event.address}, ${event.city}, ${event.country}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Apri in Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Tag className="w-5 h-5" />
            <span>Tags</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Website Link */}
      {event.websiteUrl && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Sito Web</span>
          </h3>
          <a
            href={event.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
          >
            {event.websiteUrl}
          </a>
        </div>
      )}

      {/* Notes */}
      {event.notes && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Note</span>
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {event.notes}
          </p>
        </div>
      )}

      {/* Event Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Impostazioni
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Public/Private */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Visibilità
            </span>
            <span className={`text-sm font-semibold px-2.5 py-1 rounded ${
              event.isPublic
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {event.isPublic ? 'Pubblico' : 'Privato'}
            </span>
          </div>

          {/* Requires Approval */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Approvazione richiesta
            </span>
            <span className={`text-sm font-semibold px-2.5 py-1 rounded ${
              event.requiresApproval
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-200 text-gray-700'
            }`}>
              {event.requiresApproval ? 'Sì' : 'No'}
            </span>
          </div>

          {/* Max Participants */}
          {event.maxParticipants && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Capacità massima
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {event.maxParticipants} persone
              </span>
            </div>
          )}

          {/* Category */}
          {event.category && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Categoria
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {event.category}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">Creato il:</span>{' '}
            {formatDateTime(event.createdAt)}
          </div>
          <div>
            <span className="font-medium">Ultima modifica:</span>{' '}
            {formatDateTime(event.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
