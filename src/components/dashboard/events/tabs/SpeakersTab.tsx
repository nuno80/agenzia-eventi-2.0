/**
 * FILE: src/components/dashboard/events/tabs/SpeakersTab.tsx
 * COMPONENT: SpeakersTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only tab, fetches data via DAL on server
 * - No client interattivity required for the read-only version
 *
 * PROPS:
 * - eventId: string - Event identifier
 *
 * FEATURES:
 * - KPIs: totali per stato (invited/confirmed/declined/tentative)
 * - Tabella relatori con informazioni principali e sessione
 */

import { getSpeakerStatsByEvent, getSpeakersByEvent } from '@/lib/dal/speakers'
import { formatDateTime } from '@/lib/utils'

export async function SpeakersTab({ eventId }: { eventId: string }) {
  const [stats, list] = await Promise.all([
    getSpeakerStatsByEvent(eventId),
    getSpeakersByEvent(eventId),
  ])

  const kpi = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border rounded-lg p-4">
        <div className="text-xs text-gray-500">Totale</div>
        <div className="text-2xl font-semibold">{stats.total}</div>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <div className="text-xs text-gray-500">Confermati</div>
        <div className="text-2xl font-semibold">{stats.confirmed}</div>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <div className="text-xs text-gray-500">Invitati</div>
        <div className="text-2xl font-semibold">{stats.invited}</div>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <div className="text-xs text-gray-500">Rifiutati</div>
        <div className="text-2xl font-semibold">{stats.declined}</div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {kpi}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500">
              <th className="py-2 pr-4">Nome</th>
              <th className="py-2 pr-4">Azienda/Titolo</th>
              <th className="py-2 pr-4">Sessione</th>
              <th className="py-2 pr-4">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map((s) => (
              <tr key={s.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
                <td className="py-2 pr-4">
                  <div className="font-medium text-gray-900">
                    {s.lastName} {s.firstName}
                  </div>
                  <div className="text-xs text-gray-500">{s.email}</div>
                </td>
                <td className="py-2 pr-4">
                  <div className="text-sm text-gray-900">
                    {s.company || '-'}
                    {s.jobTitle ? `, ${s.jobTitle}` : ''}
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <div className="text-sm text-gray-900">{s.sessionTitle || '-'}</div>
                  <div className="text-xs text-gray-500">
                    {s.sessionDate ? formatDateTime(s.sessionDate) : ''}
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      s.confirmationStatus === 'confirmed'
                        ? 'text-green-700'
                        : s.confirmationStatus === 'invited'
                          ? 'text-blue-700'
                          : s.confirmationStatus === 'tentative'
                            ? 'text-yellow-700'
                            : 'text-red-700'
                    }
                  >
                    {s.confirmationStatus === 'confirmed'
                      ? 'Confermato'
                      : s.confirmationStatus === 'invited'
                        ? 'Invitato'
                        : s.confirmationStatus === 'tentative'
                          ? 'Da confermare'
                          : 'Rifiutato'}
                  </span>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-600">
                  Nessun relatore presente per questo evento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
