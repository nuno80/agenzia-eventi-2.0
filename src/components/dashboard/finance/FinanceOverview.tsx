/**
 * FILE: src/components/dashboard/finance/FinanceOverview.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: FinanceOverview
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches global budget stats from database
 * - No interactivity needed
 * - Reduces client bundle size
 *
 * PROPS:
 * - stats: Global budget statistics object
 *
 * FEATURES:
 * - Displays high-level financial metrics (Revenue, Costs, Profit, Margin)
 * - Color-coded cards for quick visual assessment
 * - Formatted currency values
 *
 * USAGE:
 * <FinanceOverview stats={globalStats} />
 */

import { ArrowDownIcon, ArrowUpIcon, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type FinanceOverviewProps = {
  stats: {
    revenue: number
    costs: number
    netProfit: number
    profitMargin: number
    totalAllocated: number
    totalSpent: number
    remaining: number
    percentageUsed: number
  }
}

export function FinanceOverview({ stats }: FinanceOverviewProps) {
  const isProfitable = stats.netProfit >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold" suppressHydrationWarning>
            {formatCurrency(stats.revenue)}
          </p>
          <p className="mt-1 text-xs text-gray-500">From sponsors & tickets</p>
        </div>
      </div>

      {/* Total Costs */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">Total Costs</p>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold" suppressHydrationWarning>
            {formatCurrency(stats.costs)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Staff, services & expenses</p>
        </div>
      </div>

      {/* Net Profit */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">Net Profit</p>
          {isProfitable ? (
            <ArrowUpIcon className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className="mt-2">
          <p
            className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}
            suppressHydrationWarning
          >
            {formatCurrency(stats.netProfit)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Revenue - Costs</p>
        </div>
      </div>

      {/* Profit Margin */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">Profit Margin</p>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </div>
        <div className="mt-2">
          <p
            className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}
            suppressHydrationWarning
          >
            {stats.profitMargin.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {isProfitable ? 'Healthy margin' : 'Needs improvement'}
          </p>
        </div>
      </div>

      {/* Budget Utilization */}
      <div className="rounded-lg border bg-white p-6 shadow-sm md:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
          <span className="text-xs text-gray-500">{stats.percentageUsed.toFixed(0)}% used</span>
        </div>
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${
                stats.percentageUsed > 90
                  ? 'bg-red-500'
                  : stats.percentageUsed > 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(stats.percentageUsed, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600" suppressHydrationWarning>
              Spent: {formatCurrency(stats.totalSpent)}
            </span>
            <span className="text-gray-600" suppressHydrationWarning>
              Remaining: {formatCurrency(stats.remaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
