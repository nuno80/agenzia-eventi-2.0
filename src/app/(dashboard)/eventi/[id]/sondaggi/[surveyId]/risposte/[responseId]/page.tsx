/**
 * PAGE: Dettaglio Risposta
 */

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteResponseButton } from '@/components/dashboard/events/surveys/DeleteResponseButton'
import { ResponseDetail } from '@/components/dashboard/events/surveys/ResponseDetail'
import { getResponseById, getSurveyById } from '@/lib/dal/surveys'

interface PageProps {
  params: Promise<{
    id: string
    surveyId: string
    responseId: string
  }>
}

export default async function ResponseDetailPage({ params }: PageProps) {
  const { id, surveyId, responseId } = await params

  const [survey, response] = await Promise.all([
    getSurveyById(surveyId),
    getResponseById(responseId),
  ])

  if (!survey || !response) {
    notFound()
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/eventi/${id}/sondaggi/${surveyId}/statistiche?view=responses`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dettaglio Risposta</h1>
            <p className="text-sm text-gray-600">
              Sondaggio: <span className="font-medium">{survey.title}</span>
            </p>
          </div>
        </div>
        <DeleteResponseButton responseId={responseId} />
      </div>

      <ResponseDetail response={response} />
    </div>
  )
}
