/**
 * FILE: src/app/(dashboard)/persone/staff/[id]/[tab]/page.tsx
 *
 * VERSION: 1.0
 *
 * PAGE: Staff detail tabbed page
 * TYPE: Server Page
 *
 * WHY SERVER:
 * - Data fetching dal DAL per info staff e assegnazioni
 * - Rendering SSR per SEO e performance
 *
 * ROUTE PARAMS:
 * - id: string - Staff ID
 * - tab: string - Tab corrente (overview | assegnazioni)
 */

import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getStaffById } from '@/lib/dal/staff'
import { StaffTabs } from '@/components/dashboard/staff/StaffTabs'
import { OverviewTab } from '@/components/dashboard/staff/tabs/OverviewTab'
import { UpcomingAssignmentsTab } from '@/components/dashboard/staff/tabs/UpcomingAssignmentsTab'

const VALID_TABS = ['overview', 'assegnazioni'] as const

type TabSlug = (typeof VALID_TABS)[number]

export default async function StaffDetailTabbedPage({
  params,
}: {
  params: Promise<{ id: string; tab: string }>
}) {
  const { id, tab } = await params
  const currentTab = (VALID_TABS.includes(tab as TabSlug) ? tab : 'overview') as TabSlug

  const staff = await getStaffById(id)
  if (!staff) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{staff.lastName} {staff.firstName}</h1>
          <div className="text-sm text-gray-600 capitalize">{staff.role.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Tabs */}
      <StaffTabs staffId={id} currentTab={currentTab} />

      {/* Tab content */}
      <div>
        {currentTab === 'overview' && (
          <Suspense fallback={<div>Caricamento overview…</div>}>
            <OverviewTab staff={staff} />
          </Suspense>
        )}
        {currentTab === 'assegnazioni' && (
          <Suspense fallback={<div>Caricamento assegnazioni…</div>}>
            <UpcomingAssignmentsTab staffId={id} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
