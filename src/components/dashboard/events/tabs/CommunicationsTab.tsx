/**
 * FILE: src/components/dashboard/events/tabs/CommunicationsTab.tsx
 *
 * COMPONENT: CommunicationsTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches data from database
 * - Orchestrates child components
 * - No client-side interactivity at this level
 *
 * PROPS:
 * - eventId: Event ID
 *
 * USAGE:
 * <CommunicationsTab eventId={eventId} />
 */

import {
  getCommunicationStats,
  getCommunicationsByEvent,
  getEmailTemplatesByEvent,
} from '@/lib/dal/communications'
import { CommunicationsProvider } from '../communications/CommunicationsContext'
import { EmailComposer } from '../communications/EmailComposer'
import { EmailLog } from '../communications/EmailLog'
import { EmailStats } from '../communications/EmailStats'

interface CommunicationsTabProps {
  eventId: string
}

export async function CommunicationsTab({ eventId }: CommunicationsTabProps) {
  // Fetch all data in parallel
  const [communications, stats, templates] = await Promise.all([
    getCommunicationsByEvent(eventId),
    getCommunicationStats(eventId),
    getEmailTemplatesByEvent(eventId),
  ])

  return (
    <CommunicationsProvider>
      <div className="space-y-6">
        {/* Stats Overview */}
        <EmailStats stats={stats} />

        {/* Email Composer */}
        <EmailComposer eventId={eventId} templates={templates} />

        {/* Email Log */}
        <EmailLog communications={communications} />
      </div>
    </CommunicationsProvider>
  )
}
