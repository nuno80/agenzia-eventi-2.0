/**
 * FILE: src/app/(dashboard)/finance/report/page.tsx
 *
 * VERSION: 2.0
 *
 * PAGE: Financial Reports
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches initial report data
 * - Fetches event list for filters
 * - Passes data to ReportBuilder client component
 *
 * FEATURES:
 * - Custom date range filtering
 * - Event-specific financial reports
 * - Export to CSV
 * - Budget variance analysis
 *
 * ROUTE: /finance/report
 */

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { exportBudgetReportCsv, generateBudgetReport } from '@/app/actions/reports'
import { ReportBuilder } from '@/components/dashboard/finance/ReportBuilder'
import { getBudgetReportData } from '@/lib/dal/budget'
import { getAllEvents } from '@/lib/dal/events'

async function ReportContent() {
  // Fetch initial data (all events, no date filter)
  const [reportData, allEvents] = await Promise.all([getBudgetReportData(), getAllEvents()])

  // Map events to simple selector format
  const eventOptions = allEvents.map((e) => ({
    id: e.id,
    title: e.title,
  }))

  return (
    <ReportBuilder
      events={eventOptions}
      initialData={reportData}
      generateReportAction={generateBudgetReport}
      exportCsvAction={exportBudgetReportCsv}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 rounded-lg bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-gray-200" />
    </div>
  )
}

export default function FinanceReportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/finance"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna a Finance
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Report Finanziari</h1>
          <p className="mt-2 text-gray-600">
            Genera report dettagliati con filtri personalizzati ed esporta i dati.
          </p>
        </div>
      </div>

      {/* Report Content with Suspense */}
      <Suspense fallback={<LoadingSkeleton />}>
        <ReportContent />
      </Suspense>
    </div>
  )
}
