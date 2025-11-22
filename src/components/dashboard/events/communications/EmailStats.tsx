/**
 * FILE: src/components/dashboard/events/communications/EmailStats.tsx
 *
 * COMPONENT: EmailStats
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Display-only component
 * - No interactivity needed
 * - Receives data as props
 *
 * PROPS:
 * - stats: Communication statistics object
 *
 * USAGE:
 * <EmailStats stats={stats} />
 */

import { Eye, Mail, MousePointer } from 'lucide-react'

interface EmailStatsProps {
  stats: {
    totalSent: number
    totalDraft: number
    totalScheduled: number
    totalFailed: number
    totalRecipients: number
    avgOpenRate: number
    avgClickRate: number
  }
}

export function EmailStats({ stats }: EmailStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Sent */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Email Inviate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
            {stats.totalRecipients > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {stats.totalRecipients} destinatari totali
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Average Open Rate */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Tasso Apertura</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgOpenRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Media su tutte le email</p>
          </div>
        </div>
      </div>

      {/* Average Click Rate */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MousePointer className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">Tasso Click</p>
            <p className="text-2xl font-bold text-gray-900">{stats.avgClickRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Media su tutte le email</p>
          </div>
        </div>
      </div>

      {/* Additional Stats Row (if there are drafts/scheduled) */}
      {(stats.totalDraft > 0 || stats.totalScheduled > 0 || stats.totalFailed > 0) && (
        <>
          {stats.totalDraft > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Bozze</p>
              <p className="text-xl font-semibold text-gray-700">{stats.totalDraft}</p>
            </div>
          )}
          {stats.totalScheduled > 0 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <p className="text-sm text-blue-600">Programmate</p>
              <p className="text-xl font-semibold text-blue-700">{stats.totalScheduled}</p>
            </div>
          )}
          {stats.totalFailed > 0 && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <p className="text-sm text-red-600">Fallite</p>
              <p className="text-xl font-semibold text-red-700">{stats.totalFailed}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
