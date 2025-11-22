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
import { SponsorList } from '../sponsors/SponsorList'

export async function SponsorsTab({ eventId }: { eventId: string }) {
  const [stats, list] = await Promise.all([
    getSponsorStatsByEvent(eventId),
    getSponsorsByEvent(eventId),
  ])

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

      <SponsorList eventId={eventId} sponsors={list} />
    </div>
  )
}
