/**
 * FILE: src/components/dashboard/budget/BudgetChart.tsx
 *
 * COMPONENT: BudgetChart
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Uses recharts library (requires browser)
 * - Interactive tooltips
 *
 * FEATURES:
 * - Pie chart showing budget breakdown by category
 * - Color-coded by category
 * - Interactive tooltips with formatted currency
 * - Responsive design
 */

'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryBreakdown {
  id: string
  name: string
  color: string
  allocatedAmount: number
  spentAmount: number
  remaining: number
  percentageUsed: number
  itemsCount: number
}

interface BudgetChartProps {
  categoryBreakdown: CategoryBreakdown[]
}

export function BudgetChart({ categoryBreakdown }: BudgetChartProps) {
  // Prepare data for chart (use spent amount)
  const chartData = categoryBreakdown.map((cat) => ({
    name: cat.name,
    value: cat.spentAmount,
    color: cat.color,
  }))

  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; payload: { color: string } }>
  }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0]
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0 || chartData.every((d) => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p className="text-sm">Nessun dato da visualizzare</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            percent ? `${name} (${(percent * 100).toFixed(0)}%)` : name
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
