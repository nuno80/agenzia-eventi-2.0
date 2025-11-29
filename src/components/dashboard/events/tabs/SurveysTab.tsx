/**
 * FILE: src/components/dashboard/events/tabs/SurveysTab.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: SurveysTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches surveys data from database
 * - No client-side interactivity needed at this level
 * - Delegates interactive parts to client components
 *
 * PROPS:
 * - eventId: string - Event ID to fetch surveys for
 *
 * FEATURES:
 * - Displays all surveys for an event
 * - Shows survey statistics
 * - Create new survey button
 * - Empty state when no surveys
 *
 * USAGE:
 * <SurveysTab eventId={event.id} />
 */

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getSurveysByEvent } from '@/lib/dal/surveys'
import { SurveyList } from '../surveys/SurveyList'

interface SurveysTabProps {
  eventId: string
}

export async function SurveysTab({ eventId }: SurveysTabProps) {
  const surveys = await getSurveysByEvent(eventId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sondaggi</h2>
          <p className="text-sm text-gray-600 mt-1">
            Crea e gestisci sondaggi per raccogliere feedback dai partecipanti
          </p>
        </div>
        <Link
          href={`/eventi/${eventId}/sondaggi/nuovo`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuovo Sondaggio
        </Link>
      </div>

      {/* Stats Overview */}
      {surveys.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totale Sondaggi</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{surveys.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Sondaggi</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attivi</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {surveys.filter((s) => s.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Attivi</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bozze</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {surveys.filter((s) => s.status === 'draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Bozze</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surveys List */}
      {surveys.length > 0 ? (
        <SurveyList surveys={surveys} eventId={eventId} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Nessun sondaggio</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun sondaggio</h3>
            <p className="text-sm text-gray-600 mb-6">
              Crea il tuo primo sondaggio per raccogliere feedback dai partecipanti all'evento.
            </p>
            <Link
              href={`/eventi/${eventId}/sondaggi/nuovo`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crea Sondaggio
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
