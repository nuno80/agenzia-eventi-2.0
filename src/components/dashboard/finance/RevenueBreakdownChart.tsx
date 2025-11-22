/**
 * FILE: src/components/dashboard/finance/RevenueBreakdownChart.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: RevenueBreakdownChart
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Uses recharts library which requires browser APIs
 * - Interactive chart with tooltips
 *
 * PROPS:
 * - data: Array of revenue sources with amounts
 *
 * FEATURES:
 * - Pie chart showing revenue breakdown
 * - Color-coded segments
 * - Interactive tooltips
 *
 * USAGE:
 * <RevenueBreakdownChart data={revenueData} />
 */

'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

type RevenueBreakdownChartProps = {
  data: Array<{
    name: string
    value: number
    color: string
  }>
}

export function RevenueBreakdownChart({ data }: RevenueBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border bg-white p-6">
        <p className="text-sm text-gray-500">No revenue data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Revenue Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
