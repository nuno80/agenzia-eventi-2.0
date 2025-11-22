/**
 * FILE: src/components/dashboard/events/communications/EmailLog.tsx
 *
 * COMPONENT: EmailLog
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only table
 * - No client-side state
 * - Receives data as props
 *
 * PROPS:
 * - communications: Array of communication records
 * - eventId: Event ID for actions
 *
 * USAGE:
 * <EmailLog communications={communications} eventId={eventId} />
 */

import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Mail } from 'lucide-react'
import type { Communication } from '@/db/libsql-schemas/events'
import { CommunicationActions } from './CommunicationActions'

interface EmailLogProps {
  communications: Communication[]
}

export function EmailLog({ communications }: EmailLogProps) {
  if (communications.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nessuna comunicazione inviata
          </h3>
          <p className="text-sm text-gray-600">Le email inviate ai partecipanti appariranno qui.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Storico Comunicazioni</h3>
        <p className="text-sm text-gray-600 mt-1">
          {communications.length} comunicazion{communications.length === 1 ? 'e' : 'i'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oggetto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destinatari
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aperture
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {communications.map((comm) => (
              <tr key={comm.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {comm.sentDate
                    ? format(new Date(comm.sentDate), 'dd MMM yyyy HH:mm', { locale: it })
                    : comm.scheduledDate
                      ? format(new Date(comm.scheduledDate), 'dd MMM yyyy HH:mm', { locale: it })
                      : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs truncate">{comm.subject}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {comm.recipientCount || 0} destinatari
                  <div className="text-xs text-gray-500 capitalize">
                    {comm.recipientType.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={comm.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {comm.status === 'sent' ? `${comm.openRate?.toFixed(1) || 0}%` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <CommunicationActions communication={comm} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sent: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  }

  const labels = {
    draft: 'Bozza',
    scheduled: 'Programmata',
    sent: 'Inviata',
    failed: 'Fallita',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}
