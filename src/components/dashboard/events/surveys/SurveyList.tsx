/**
 * FILE: src/components/dashboard/events/surveys/SurveyList.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: SurveyList
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only component
 * - Renders survey cards
 * - No client-side state needed
 *
 * PROPS:
 * - surveys: Survey[] - Array of surveys to display
 * - eventId: string - Event ID for navigation
 *
 * FEATURES:
 * - Grid layout of survey cards
 * - Status-based filtering
 * - Responsive design
 *
 * USAGE:
 * <SurveyList surveys={surveys} eventId={eventId} />
 */

import type { Survey } from '@/db'
import { SurveyCard } from './SurveyCard'

interface SurveyListProps {
  surveys: Survey[]
  eventId: string
}

export function SurveyList({ surveys, eventId }: SurveyListProps) {
  if (surveys.length === 0) {
    return null
  }

  // Group surveys by status
  const activeSurveys = surveys.filter((s) => s.status === 'active')
  const draftSurveys = surveys.filter((s) => s.status === 'draft')
  const closedSurveys = surveys.filter((s) => s.status === 'closed')

  return (
    <div className="space-y-8">
      {/* Active Surveys */}
      {activeSurveys.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sondaggi Attivi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSurveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} eventId={eventId} />
            ))}
          </div>
        </div>
      )}

      {/* Draft Surveys */}
      {draftSurveys.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bozze</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftSurveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} eventId={eventId} />
            ))}
          </div>
        </div>
      )}

      {/* Closed Surveys */}
      {closedSurveys.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chiusi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {closedSurveys.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} eventId={eventId} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
