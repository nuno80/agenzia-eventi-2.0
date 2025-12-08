/**
 * FILE: src/components/dashboard/finance/ReportBuilder.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: ReportBuilder
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages filter state (date range, selected events)
 * - Handles form interactions and export triggers
 *
 * PROPS:
 * - events: { id: string; title: string }[] - Available events for selection
 * - initialData: BudgetReportData - Initial report data (all events, no date filter)
 *
 * FEATURES:
 * - Date range picker (start/end)
 * - Multi-select for events
 * - Generate Report button
 * - Export to CSV button
 * - Summary cards display
 * - Event breakdown table
 *
 * USAGE:
 * <ReportBuilder events={events} initialData={reportData} />
 */

'use client'

import { Calendar, FileSpreadsheet, Filter, TrendingDown, TrendingUp } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { BudgetReportData } from '@/lib/dal/budget'

// Re-use formatCurrency from utils
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)

type EventOption = {
  id: string
  title: string
}

type ReportBuilderProps = {
  events: EventOption[]
  initialData: BudgetReportData
  generateReportAction: (formData: FormData) => Promise<BudgetReportData>
  exportCsvAction: (formData: FormData) => Promise<{ csvContent: string; filename: string }>
}

export function ReportBuilder({
  events,
  initialData,
  generateReportAction,
  exportCsvAction,
}: ReportBuilderProps) {
  const [reportData, setReportData] = useState<BudgetReportData>(initialData)
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)

  // Filter state
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])

  const handleEventToggle = useCallback((eventId: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    )
  }, [])

  const handleGenerateReport = useCallback(() => {
    startTransition(async () => {
      const formData = new FormData()
      if (startDate) formData.append('startDate', startDate)
      if (endDate) formData.append('endDate', endDate)
      for (const id of selectedEventIds) {
        formData.append('eventIds', id)
      }

      const result = await generateReportAction(formData)
      setReportData(result)
    })
  }, [startDate, endDate, selectedEventIds, generateReportAction])

  const handleExportCsv = useCallback(async () => {
    setIsExporting(true)
    try {
      const formData = new FormData()
      if (startDate) formData.append('startDate', startDate)
      if (endDate) formData.append('endDate', endDate)
      for (const id of selectedEventIds) {
        formData.append('eventIds', id)
      }

      const { csvContent, filename } = await exportCsvAction(formData)

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }, [startDate, endDate, selectedEventIds, exportCsvAction])

  const handleClearFilters = useCallback(() => {
    setStartDate('')
    setEndDate('')
    setSelectedEventIds([])
    // Reset to initial data
    setReportData(initialData)
  }, [initialData])

  const { summary, eventBreakdown, categoryBreakdown } = reportData

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtri Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Data Inizio
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Data Fine
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Event Selector */}
            <div className="space-y-2 lg:col-span-2">
              <Label>Eventi (lascia vuoto per tutti)</Label>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-md border p-2">
                {events.length === 0 ? (
                  <span className="text-sm text-gray-500">Nessun evento disponibile</span>
                ) : (
                  events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleEventToggle(event.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        selectedEventIds.includes(event.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {event.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? 'Generando...' : 'Genera Report'}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={isExporting || isPending}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isExporting ? 'Esportando...' : 'Esporta CSV'}
            </Button>
            <Button variant="ghost" onClick={handleClearFilters}>
              Pulisci Filtri
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Entrate Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600" suppressHydrationWarning>
              {formatCurrency(summary.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Costi Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600" suppressHydrationWarning>
              {formatCurrency(summary.totalCosts)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Profitto Netto</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`flex items-center gap-1 text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
              suppressHydrationWarning
            >
              {summary.netProfit >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {formatCurrency(summary.netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Eventi Analizzati</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalEvents}</p>
            <p className="text-xs text-gray-500">{summary.totalItems} voci di budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dettaglio per Evento</CardTitle>
        </CardHeader>
        <CardContent>
          {eventBreakdown.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Nessun dato disponibile per i filtri selezionati.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium">Evento</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium text-right">Entrate</th>
                    <th className="px-4 py-3 font-medium text-right">Costi</th>
                    <th className="px-4 py-3 font-medium text-right">Profitto</th>
                    <th className="px-4 py-3 font-medium text-center">Voci</th>
                  </tr>
                </thead>
                <tbody>
                  {eventBreakdown.map((event, idx) => (
                    <tr
                      key={event.eventId}
                      className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                    >
                      <td className="px-4 py-3 font-medium">{event.eventTitle}</td>
                      <td className="px-4 py-3 text-gray-600" suppressHydrationWarning>
                        {new Date(event.eventDate).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600" suppressHydrationWarning>
                        {formatCurrency(event.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600" suppressHydrationWarning>
                        {formatCurrency(event.costs)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${event.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        suppressHydrationWarning
                      >
                        {formatCurrency(event.netProfit)}
                      </td>
                      <td className="px-4 py-3 text-center">{event.itemsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Dettaglio per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Nessuna categoria disponibile.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.categoryName}
                  className={`rounded-lg border p-4 ${cat.isRevenue ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.categoryName}</span>
                    <span
                      className={`text-xs font-medium ${cat.isRevenue ? 'text-green-600' : 'text-gray-600'}`}
                    >
                      {cat.isRevenue ? 'Entrata' : 'Costo'}
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold" suppressHydrationWarning>
                    {formatCurrency(cat.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">{cat.itemCount} voci</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
