/**
 * FILE: src/components/dashboard/finance/EventFinancialTable.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: EventFinancialTable
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Sorting and filtering state management
 * - Interactive table with click handlers
 *
 * PROPS:
 * - events: Array of event financial data
 *
 * FEATURES:
 * - Sortable columns (click header to sort)
 * - Color-coded profit/loss indicators
 * - Formatted currency values
 * - Click row to navigate to event detail
 *
 * USAGE:
 * <EventFinancialTable events={eventBreakdown} />
 */

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

type EventFinancialData = {
  eventId: string
  eventTitle: string
  eventStatus: string
  eventDate: Date
  revenue: number
  costs: number
  allocated: number
  spent: number
  itemsCount: number
}

type EventFinancialTableProps = {
  events: EventFinancialData[]
}

type SortKey = 'eventTitle' | 'eventDate' | 'revenue' | 'costs' | 'profit'
type SortDir = 'asc' | 'desc'

export function EventFinancialTable({ events }: EventFinancialTableProps) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<SortKey>('eventDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

  const sortedEvents = [...events].sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0

    switch (sortBy) {
      case 'eventTitle':
        aVal = a.eventTitle
        bVal = b.eventTitle
        break
      case 'eventDate':
        aVal = new Date(a.eventDate).getTime()
        bVal = new Date(b.eventDate).getTime()
        break
      case 'revenue':
        aVal = a.revenue
        bVal = b.revenue
        break
      case 'costs':
        aVal = a.costs
        bVal = b.costs
        break
      case 'profit':
        aVal = a.revenue - a.costs
        bVal = b.revenue - b.costs
        break
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const HeaderButton = ({ label, sortKey }: { label: string; sortKey: SortKey }) => {
    const active = sortBy === sortKey
    return (
      <button
        type="button"
        className="inline-flex cursor-pointer items-center gap-1"
        title={`Ordina per ${label}`}
        onClick={() => handleSort(sortKey)}
      >
        {label}
        <span aria-hidden className={active ? 'text-gray-700' : 'text-gray-300'}>
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '•'}
        </span>
      </button>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <p className="text-gray-500">No financial data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Financial Performance by Event</h3>
        <p className="mt-1 text-sm text-gray-500">Click on an event to view details</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <HeaderButton label="Event" sortKey="eventTitle" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <HeaderButton label="Date" sortKey="eventDate" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                <HeaderButton label="Revenue" sortKey="revenue" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                <HeaderButton label="Costs" sortKey="costs" />
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                <HeaderButton label="Profit" sortKey="profit" />
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedEvents.map((event, idx) => {
              const profit = event.revenue - event.costs
              const isProfitable = profit >= 0

              return (
                <tr
                  key={event.eventId}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                  onClick={() => router.push(`/eventi/${event.eventId}/budget`)}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{event.eventTitle}</div>
                    <div className="text-xs text-gray-500">{event.itemsCount} budget items</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(event.eventDate).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td
                    className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-green-600"
                    suppressHydrationWarning
                  >
                    {formatCurrency(event.revenue)}
                  </td>
                  <td
                    className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-red-600"
                    suppressHydrationWarning
                  >
                    {formatCurrency(event.costs)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-6 py-4 text-right text-sm font-bold ${
                      isProfitable ? 'text-green-600' : 'text-red-600'
                    }`}
                    suppressHydrationWarning
                  >
                    {formatCurrency(profit)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        event.eventStatus === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : event.eventStatus === 'ongoing'
                            ? 'bg-blue-100 text-blue-800'
                            : event.eventStatus === 'open'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {event.eventStatus}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
