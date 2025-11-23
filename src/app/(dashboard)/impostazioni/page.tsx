/**
 * FILE: src/app/(dashboard)/impostazioni/page.tsx
 * TYPE: Server Component
 * WHY: Settings page with Suspense for data fetching
 *
 * FEATURES:
 * - 3 tabs: Profilo, Notifiche, Template Email
 * - Suspense boundary for loading state
 * - Server Component wrapper
 */

import { Suspense } from 'react'
import { SettingsTabs } from '@/components/dashboard/settings/SettingsTabs'

export const metadata = {
  title: 'Impostazioni | EventHub',
  description: 'Gestisci le impostazioni della tua organizzazione',
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="h-96 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}

async function SettingsContent() {
  // TODO: Fetch user settings from database when auth is implemented
  // For now, settings are managed client-side with localStorage

  return <SettingsTabs />
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Impostazioni</h1>
        <p className="mt-2 text-gray-600">
          Gestisci le impostazioni della tua organizzazione, notifiche e template email
        </p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
