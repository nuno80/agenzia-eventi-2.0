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

import { getBudgetCategoriesByEvent } from '@/lib/dal/budget'
import { getSpeakerStatsByEvent, getSpeakersByEvent } from '@/lib/dal/speakers'
import EventSpeakersManager from '../speakers/EventSpeakersManager'

export async function SpeakersTab({ eventId }: { eventId: string }) {
  const [stats, list, budgetCategories] = await Promise.all([
    getSpeakerStatsByEvent(eventId),
    getSpeakersByEvent(eventId),
    getBudgetCategoriesByEvent(eventId),
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
      <EventSpeakersManager eventId={eventId} speakers={list} budgetCategories={budgetCategories} />
    </div>
  )
}
