/**
 * PAGE: Modifica Sondaggio
 */

import { notFound } from 'next/navigation'
import { SurveyForm } from '@/components/dashboard/events/surveys/SurveyForm'
import { getSurveyWithQuestions } from '@/lib/dal/surveys'

interface PageProps {
  params: Promise<{
    id: string
    surveyId: string
  }>
}

export default async function EditSurveyPage({ params }: PageProps) {
  const { id, surveyId } = await params
  const survey = await getSurveyWithQuestions(surveyId)

  if (!survey) {
    notFound()
  }

  return <SurveyForm eventId={id} initialData={survey} />
}
