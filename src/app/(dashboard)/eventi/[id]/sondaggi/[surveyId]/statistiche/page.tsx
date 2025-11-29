/**
 * PAGE: Statistiche Sondaggio
 */

import { ArrowLeft, BarChart3, List } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ResponsesTable } from '@/components/dashboard/events/surveys/ResponsesTable'
import { SurveyStats } from '@/components/dashboard/events/surveys/SurveyStats'
import {
  getQuestionStats,
  getSurveyById,
  getSurveyResponses,
  getSurveyStats,
  getSurveyWithQuestions,
  type QuestionStatsDTO,
} from '@/lib/dal/surveys'

interface PageProps {
  params: Promise<{
    id: string
    surveyId: string
  }>
  searchParams: Promise<{
    view?: string
  }>
}

export default async function SurveyStatsPage({ params, searchParams }: PageProps) {
  const { id, surveyId } = await params
  const { view } = await searchParams
  const activeView = view === 'responses' ? 'responses' : 'stats'

  const survey = await getSurveyById(surveyId)
  if (!survey) {
    notFound()
  }

  // Fetch data based on view
  const stats = await getSurveyStats(surveyId)

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Impossibile caricare le statistiche.</p>
      </div>
    )
  }

  // We need question stats for the charts
  // Since getQuestionStats is per question, we need to fetch questions first or use a helper
  // Let's fetch questions and then map over them
  // Or better, update DAL to get all stats at once?
  // For now, let's fetch questions and then stats in parallel

  // Wait, getSurveyStats returns overall stats.
  // We need question stats for the charts.
  // I'll fetch the survey with questions first.
  // Let's use getSurveyWithQuestions
  const fullSurvey = await getSurveyWithQuestions(surveyId)

  if (!fullSurvey) notFound()

  const questionsStats = (
    await Promise.all(
      (fullSurvey.questions || []).map((q: { id: string }) => getQuestionStats(q.id))
    )
  ).filter((s): s is QuestionStatsDTO => s !== null)

  const responses = activeView === 'responses' ? await getSurveyResponses(surveyId) : []

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/eventi/${id}/sondaggi`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            <p className="text-sm text-gray-600">Statistiche e risposte</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <Link
            href={`/eventi/${id}/sondaggi/${surveyId}/statistiche?view=stats`}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${
                activeView === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <BarChart3 className="w-4 h-4" />
            Riepilogo Grafico
          </Link>
          <Link
            href={`/eventi/${id}/sondaggi/${surveyId}/statistiche?view=responses`}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${
                activeView === 'responses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <List className="w-4 h-4" />
            Risposte Individuali ({stats.totalResponses})
          </Link>
        </nav>
      </div>

      {/* Content */}
      {activeView === 'stats' ? (
        <SurveyStats stats={stats} questionsStats={questionsStats} />
      ) : (
        <ResponsesTable responses={responses} surveyId={surveyId} eventId={id} />
      )}
    </div>
  )
}
