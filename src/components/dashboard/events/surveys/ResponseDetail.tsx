/**
 * FILE: src/components/dashboard/events/surveys/ResponseDetail.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: ResponseDetail
 * TYPE: Server Component
 *
 * PROPS:
 * - response: SurveyResponseDTO - Response data with answers and questions
 *
 * FEATURES:
 * - Participant info header
 * - List of questions and provided answers
 * - Visual distinction for different question types
 */

import { Calendar, Clock, User } from 'lucide-react'

interface ResponseDetailProps {
  response: any // Using any for complex DTO with relations
}

export function ResponseDetail({ response }: ResponseDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              {response.participant ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {response.participant.firstName} {response.participant.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{response.participant.email}</p>
                </>
              ) : (
                <h3 className="text-lg font-semibold text-gray-900">Partecipante Anonimo</h3>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(response.submittedAt).toLocaleDateString('it-IT')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{new Date(response.submittedAt).toLocaleTimeString('it-IT')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Answers List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-200">
        {response.answers.map((answer: any, index: number) => (
          <div key={answer.id} className="p-6">
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domanda {index + 1}
              </span>
              <h4 className="text-base font-medium text-gray-900 mt-1">
                {answer.question.question}
              </h4>
              {answer.question.description && (
                <p className="text-sm text-gray-500 mt-1">{answer.question.description}</p>
              )}
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <RenderAnswer answer={answer} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RenderAnswer({ answer }: { answer: any }) {
  const type = answer.question.type

  if (!answer.answer) {
    return <span className="text-gray-400 italic">Nessuna risposta</span>
  }

  switch (type) {
    case 'checkboxes': {
      try {
        const selected = JSON.parse(answer.answer)
        return (
          <div className="flex flex-wrap gap-2">
            {selected.map((opt: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {opt}
              </span>
            ))}
          </div>
        )
      } catch {
        return <span>{answer.answer}</span>
      }
    }

    case 'rating':
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${
                star <= Number(answer.answer) ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
              viewBox="0 0 20 20"
              role="img"
              aria-label={`${star} stelle`}
            >
              <title>{star} stelle</title>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-2 text-sm text-gray-600">({answer.answer}/5)</span>
        </div>
      )

    case 'scale':
      return (
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[200px]">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${(Number(answer.answer) / 10) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">{answer.answer}/10</span>
        </div>
      )

    default:
      return <p className="text-gray-900 whitespace-pre-wrap">{answer.answer}</p>
  }
}
