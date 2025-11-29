/**
 * FILE: src/components/dashboard/events/surveys/ResponsesTable.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: ResponsesTable
 * TYPE: Server Component
 *
 * PROPS:
 * - responses: SurveyResponseDTO[] - List of responses
 * - surveyId: string - Survey ID
 * - eventId: string - Event ID
 *
 * FEATURES:
 * - Table layout
 * - Participant identification
 * - Status badges
 * - Delete action
 */

import { Eye, User } from 'lucide-react'
import Link from 'next/link'
import { DeleteResponseButton } from './DeleteResponseButton'

interface ResponsesTableProps {
  responses: any[] // Using any for now as the DTO type might be complex with relations
  surveyId: string
  eventId: string
}

export function ResponsesTable({ responses, surveyId, eventId }: ResponsesTableProps) {
  if (responses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Nessuna risposta ricevuta finora.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Partecipante</th>
              <th className="px-6 py-3">Data Invio</th>
              <th className="px-6 py-3">Stato</th>
              <th className="px-6 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {responses.map((response) => (
              <tr key={response.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      {response.participant ? (
                        <>
                          <p className="font-medium text-gray-900">
                            {response.participant.firstName} {response.participant.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{response.participant.email}</p>
                        </>
                      ) : (
                        <p className="font-medium text-gray-500 italic">Anonimo</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(response.submittedAt).toLocaleString('it-IT')}
                </td>
                <td className="px-6 py-4">
                  {response.isComplete ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Parziale
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/eventi/${eventId}/sondaggi/${surveyId}/risposte/${response.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Vedi dettagli"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <DeleteResponseButton responseId={response.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
