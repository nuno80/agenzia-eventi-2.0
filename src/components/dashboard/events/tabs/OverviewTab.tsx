/**
 * FILE: src/components/dashboard/events/tabs/OverviewTab.tsx
 * COMPONENT: OverviewTab
 * TYPE: Server Component
 */

import {
  Building2,
  Calendar,
  Clock,
  DoorClosed,
  DoorOpen,
  MapPin,
  Mic,
  Tag,
  Users,
} from 'lucide-react'
import { PaymentQuickActions, PaymentStatusBadge } from '@/components/dashboard/staff'
import type { Event } from '@/db'
import { getAssignmentsByEvent } from '@/lib/dal/staff-assignments'
import { formatDateTime } from '@/lib/utils'

function safeParseTags(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input as string[]
  try {
    const s = String(input).trim()
    if (!s) return []
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? (parsed as string[]) : []
  } catch {
    return []
  }
}

interface OverviewTabProps {
  event: Event
  participantsCount?: number
  speakersCount?: number
  sponsorsCount?: number
}

export async function OverviewTab({
  event,
  participantsCount = 0,
  speakersCount = 0,
  sponsorsCount = 0,
}: OverviewTabProps) {
  const tags = safeParseTags(event.tags)

  const assignments = await getAssignmentsByEvent(event.id)

  return (
    <div className="space-y-6">
      {event.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrizione</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{event.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{participantsCount}</div>
              <div className="text-sm text-gray-600">Partecipanti</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mic className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{speakersCount}</div>
              <div className="text-sm text-gray-600">Relatori</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Building2 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{sponsorsCount}</div>
              <div className="text-sm text-gray-600">Sponsor</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Date Evento</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Inizio</div>
                <div className="text-sm text-gray-600">{formatDateTime(event.startDate)}</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-900">Fine</div>
                <div className="text-sm text-gray-600">{formatDateTime(event.endDate)}</div>
              </div>
            </div>

            {event.registrationOpenDate && (
              <div className="flex items-start space-x-3 pt-4 border-t border-gray-200">
                <DoorOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Apertura Iscrizioni</div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(event.registrationOpenDate)}
                  </div>
                </div>
              </div>
            )}

            {event.registrationCloseDate && (
              <div className="flex items-start space-x-3">
                <DoorClosed className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Chiusura Iscrizioni</div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(event.registrationCloseDate)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Luogo</span>
          </h3>

          <div className="space-y-3">
            {event.venue && (
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Sede</div>
                <div className="text-sm text-gray-600">{event.venue}</div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">Località</div>
              <div className="text-sm text-gray-600">{event.location}</div>
            </div>

            {event.address && (
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Indirizzo</div>
                <div className="text-sm text-gray-600">
                  {event.address}
                  {event.city && `, ${event.city}`}
                  {event.country && `, ${event.country}`}
                </div>
              </div>
            )}

            {event.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.address}, ${event.city ?? ''}, ${event.country ?? ''}`)}`}
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

      {/* Staff assegnato - anteprima */}
      {assignments && assignments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Staff assegnato</h3>
            <a
              href={`/eventi/${event.id}/staff`}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Vedi tutto
            </a>
          </div>
          <div className="divide-y">
            {assignments.slice(0, 5).map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {a.staff ? `${a.staff.lastName} ${a.staff.firstName}` : 'Membro dello staff'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDateTime(a.startTime)} → {formatDateTime(a.endTime)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentStatusBadge
                    paymentTerms={a.paymentTerms}
                    paymentDueDate={a.paymentDueDate}
                    paymentDate={a.paymentDate}
                    assignmentStatus={a.assignmentStatus}
                    endTime={a.endTime}
                  />
                  <PaymentQuickActions
                    assignmentId={a.id}
                    currentDueDate={a.paymentDueDate}
                    isPaid={a.paymentStatus === 'paid'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
