/**
 * FILE: src/components/dashboard/events/tabs/SponsorsTab.tsx
 * COMPONENT: SponsorsTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only tab, fetches data via DAL on server
 * - No client interactivity required for the read-only version
 *
 * PROPS:
 * - eventId: string - Event identifier
 *
 * FEATURES:
 * - KPIs: totale sponsor, contratti firmati, importi totale/pagato/residuo
 * - Tabella elenco sponsor con informazioni principali
 */

import { getSponsorStatsByEvent, getSponsorsByEvent } from '@/lib/dal/sponsors'
import { toTitleCase } from '@/lib/utils'

export async function SponsorsTab({ eventId }: { eventId: string }) {
  const [stats, list] = await Promise.all([
    getSponsorStatsByEvent(eventId),
    getSponsorsByEvent(eventId),
  ])

  const levelLabel = (lvl: string) => toTitleCase(lvl.replace('_', ' '))

  const money = (v: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v)

  const kpi = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border rounded-lg p-4">
        <div className="text-xs text-gray-500">Totale Sponsor</div>
        <div className="text-2xl font-semibold">{stats.total}</div>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <div className="text-xs text-gray-500">Contratti Firmati</div>
        <div className="text-2xl font-semibold">{stats.signed}</div>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <div className="text-xs text-gray-500">Importo Totale</div>
        <div className="text-2xl font-semibold">{money(stats.amounts.totalAmount)}</div>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <div className="text-xs text-gray-500">Incassato (stimato)</div>
        <div className="text-2xl font-semibold">{money(stats.amounts.paidAmount)}</div>
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
              <th className="py-2 pr-4">Azienda</th>
              <th className="py-2 pr-4">Livello</th>
              <th className="py-2 pr-4">Contratto</th>
              <th className="py-2 pr-4">Pagamento</th>
              <th className="py-2 pr-4 text-right">Importo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map((s) => (
              <tr key={s.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
                <td className="py-2 pr-4">
                  <div className="font-medium text-gray-900">{s.companyName}</div>
                  <div className="text-xs text-gray-500">
                    {[s.contactPerson || null, s.email].filter(Boolean).join(' · ')}
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[11px] font-medium">
                    {levelLabel(s.sponsorshipLevel)}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <span className={s.contractSigned ? 'text-green-700' : 'text-gray-600'}>
                    {s.contractSigned ? 'Firmato' : 'Non firmato'}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      s.paymentStatus === 'paid'
                        ? 'text-green-700'
                        : s.paymentStatus === 'partial'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                    }
                  >
                    {s.paymentStatus === 'paid'
                      ? 'Pagato'
                      : s.paymentStatus === 'partial'
                        ? 'Parziale'
                        : 'Da pagare'}
                  </span>
                </td>
                <td className="py-2 pr-4 text-right">{money(s.sponsorshipAmount)}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-600">
                  Nessuno sponsor presente per questo evento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
