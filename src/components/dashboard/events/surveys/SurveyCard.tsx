/**
 * FILE: src/components/dashboard/events/surveys/SurveyCard.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: SurveyCard
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display component with minimal interactivity
 * - Actions delegated to client components
 * - Fetches response count from database
 *
 * PROPS:
 * - survey: Survey - Survey data to display
 * - eventId: string - Event ID for navigation
 *
 * FEATURES:
 * - Survey title and description
 * - Status badge
 * - Response count
 * - Quick actions (Edit, Stats, Delete)
 * - Published/Created dates
 *
 * USAGE:
 * <SurveyCard survey={survey} eventId={eventId} />
 */

import { BarChart3, Calendar, Edit } from 'lucide-react'
import Link from 'next/link'
import type { Survey } from '@/db'
import { getSurveyResponseCount } from '@/lib/dal/surveys'
import { SurveyActions } from './SurveyActions'

interface SurveyCardProps {
  survey: Survey
  eventId: string
}

export async function SurveyCard({ survey, eventId }: SurveyCardProps) {
  const responseCount = await getSurveyResponseCount(survey.id)

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
  }

  const statusLabels = {
    draft: 'Bozza',
    active: 'Attivo',
    closed: 'Chiuso',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">{survey.title}</h4>
          {survey.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{survey.description}</p>
          )}
        </div>
        <span
          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${statusColors[survey.status]}`}
        >
          {statusLabels[survey.status]}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <BarChart3 className="w-4 h-4" />
          <span>{responseCount} risposte</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>
            {survey.publishedAt
              ? new Date(survey.publishedAt).toLocaleDateString('it-IT')
              : new Date(survey.createdAt).toLocaleDateString('it-IT')}
          </span>
        </div>
      </div>

      {/* Settings */}
      {(survey.allowAnonymous || survey.allowMultipleResponses) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {survey.allowAnonymous && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
              Risposte anonime
            </span>
          )}
          {survey.allowMultipleResponses && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
              Risposte multiple
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <Link
          href={`/eventi/${eventId}/sondaggi/${survey.id}/modifica`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          Modifica
        </Link>
        <Link
          href={`/eventi/${eventId}/sondaggi/${survey.id}/statistiche`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          Statistiche
        </Link>
        <SurveyActions survey={survey} />
      </div>
    </div>
  )
}
