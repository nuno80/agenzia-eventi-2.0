/**
 * PAGE: Nuovo Sondaggio
 */

import { SurveyForm } from '@/components/dashboard/events/surveys/SurveyForm'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function NewSurveyPage({ params }: PageProps) {
  const { id } = await params

  return <SurveyForm eventId={id} />
}
