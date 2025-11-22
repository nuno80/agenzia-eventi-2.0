/**
 * FILE: src/components/dashboard/finance/CostBreakdownChart.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: CostBreakdownChart
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Uses recharts library which requires browser APIs
 * - Interactive chart with tooltips
 *
 * PROPS:
 * - data: Array of cost categories with amounts
 *
 * FEATURES:
 * - Bar chart showing cost breakdown by category
 * - Color-coded bars
 * - Interactive tooltips
 *
 * USAGE:
 * <CostBreakdownChart data={costData} />
 */

'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

type CostBreakdownChartProps = {
  data: Array<{
    name: string
    amount: number
  }>
}

export function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border bg-white p-6">
        <p className="text-sm text-gray-500">No cost data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Cost Breakdown by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Bar dataKey="amount" fill="#3B82F6" name="Cost" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
