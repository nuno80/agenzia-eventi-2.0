/**
 * FILE: src/app/(dashboard)/finance/page.tsx
 *
 * VERSION: 1.0
 *
 * PAGE: Finance Dashboard
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches global budget statistics from database
 * - No client-side state needed at page level
 * - Uses Suspense for streaming
 *
 * FEATURES:
 * - Global financial overview with key metrics
 * - Revenue and cost breakdown charts
 * - Event-by-event financial performance table
 * - Suspense boundaries for progressive loading
 *
 * ROUTE: /finance
 */

import { Suspense } from 'react'
import { CostBreakdownChart } from '@/components/dashboard/finance/CostBreakdownChart'
import { EventFinancialTable } from '@/components/dashboard/finance/EventFinancialTable'
import { FinanceOverview } from '@/components/dashboard/finance/FinanceOverview'
import { RevenueBreakdownChart } from '@/components/dashboard/finance/RevenueBreakdownChart'
import { getGlobalBudgetStats } from '@/lib/dal/budget'

async function FinanceContent() {
  const stats = await getGlobalBudgetStats()

  // Prepare revenue breakdown data
  const revenueData = [
    {
      name: 'Sponsors',
      value: stats.revenue,
      color: '#10B981', // green
    },
    // Add more revenue sources here when available (e.g., ticket sales)
  ]

  // Prepare cost breakdown data from event breakdown
  const costData = stats.eventBreakdown.map((event) => ({
    name: event.eventTitle,
    amount: event.costs,
  }))

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <FinanceOverview stats={stats} />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueBreakdownChart data={revenueData} />
        <CostBreakdownChart data={costData} />
      </div>

      {/* Event Financial Table */}
      <EventFinancialTable events={stats.eventBreakdown} />
    </div>
  )
}

function FinanceSkeleton() {
  return (
    <div className="space-y-8">
      {/* Overview skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[400px] animate-pulse rounded-lg bg-gray-200" />
        <div className="h-[400px] animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Table skeleton */}
      <div className="h-[400px] animate-pulse rounded-lg bg-gray-200" />
    </div>
  )
}

export default function FinancePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of financial performance across all events</p>
      </div>

      {/* Content with Suspense */}
      <Suspense fallback={<FinanceSkeleton />}>
        <FinanceContent />
      </Suspense>
    </div>
  )
}
