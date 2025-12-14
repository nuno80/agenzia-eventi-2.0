/**
 * FILE: src/app/(dashboard)/impostazioni/page.tsx
 * TYPE: Server Component
 * WHY: Settings page with Suspense for data fetching
 *
 * FEATURES:
 * - Profile settings tab
 * - Suspense boundary for loading state
 * - Server Component wrapper that fetches settings from DB
 */

import { Suspense } from 'react'
import { SettingsTabs } from '@/components/dashboard/settings/SettingsTabs'
import { getOrganizationSettings } from '@/lib/dal/settings'

export const metadata = {
  title: 'Impostazioni | My App',
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
  // Fetch settings from database
  const settings = await getOrganizationSettings()

  return <SettingsTabs initialProfile={settings.profile} />
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Impostazioni</h1>
        <p className="mt-2 text-gray-600">Gestisci le impostazioni del tuo profilo</p>
      </div>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
