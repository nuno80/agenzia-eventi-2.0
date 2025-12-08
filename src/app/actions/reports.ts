/**
 * FILE: src/app/actions/reports.ts
 *
 * VERSION: 1.0
 *
 * SERVER ACTIONS: Financial Reports
 * TYPE: Server Actions
 *
 * PURPOSE:
 * - Generate budget report data with filters
 * - Export reports to CSV format
 *
 * SECURITY:
 * - Input validation via FormData parsing
 * - Date parsing with fallback
 *
 * USAGE:
 * import { generateBudgetReport, exportBudgetReportCsv } from '@/app/actions/reports';
 */

'use server'

import {
  type BudgetReportData,
  type BudgetReportFilters,
  getBudgetReportData,
} from '@/lib/dal/budget'

// Helper to parse form data filters
function parseFilters(formData: FormData): BudgetReportFilters {
  const startDateStr = formData.get('startDate') as string | null
  const endDateStr = formData.get('endDate') as string | null
  const eventIds = formData.getAll('eventIds') as string[]

  const filters: BudgetReportFilters = {}

  if (startDateStr) {
    const parsed = new Date(startDateStr)
    if (!Number.isNaN(parsed.getTime())) {
      filters.startDate = parsed
    }
  }

  if (endDateStr) {
    const parsed = new Date(endDateStr)
    if (!Number.isNaN(parsed.getTime())) {
      filters.endDate = parsed
    }
  }

  if (eventIds.length > 0) {
    filters.eventIds = eventIds.filter((id) => id.length > 0)
  }

  return filters
}

/**
 * Generate budget report data with optional filters
 * Called from ReportBuilder component
 */
export async function generateBudgetReport(formData: FormData): Promise<BudgetReportData> {
  const filters = parseFilters(formData)
  return getBudgetReportData(filters)
}

/**
 * Export budget report to CSV format
 * Returns CSV content as string and suggested filename
 */
export async function exportBudgetReportCsv(
  formData: FormData
): Promise<{ csvContent: string; filename: string }> {
  const filters = parseFilters(formData)
  const reportData = await getBudgetReportData(filters)

  // Build CSV content
  const lines: string[] = []

  // Header
  lines.push('Report Finanziario EventHub')
  lines.push('')

  // Date range info
  const startStr = filters.startDate ? filters.startDate.toLocaleDateString('it-IT') : 'Tutte'
  const endStr = filters.endDate ? filters.endDate.toLocaleDateString('it-IT') : 'Tutte'
  lines.push(`Periodo: ${startStr} - ${endStr}`)
  lines.push(`Eventi selezionati: ${filters.eventIds?.length || 'Tutti'}`)
  lines.push('')

  // Summary
  lines.push('RIEPILOGO')
  lines.push(`Entrate Totali,${reportData.summary.totalRevenue}`)
  lines.push(`Costi Totali,${reportData.summary.totalCosts}`)
  lines.push(`Profitto Netto,${reportData.summary.netProfit}`)
  lines.push(`Margine %,${reportData.summary.profitMargin.toFixed(1)}%`)
  lines.push(`Eventi Analizzati,${reportData.summary.totalEvents}`)
  lines.push(`Voci di Budget,${reportData.summary.totalItems}`)
  lines.push('')

  // Event breakdown header
  lines.push('DETTAGLIO PER EVENTO')
  lines.push('Evento,Data,Entrate,Costi,Profitto,Voci')

  // Event breakdown rows
  for (const event of reportData.eventBreakdown) {
    const eventDate = new Date(event.eventDate).toLocaleDateString('it-IT')
    lines.push(
      `"${event.eventTitle}",${eventDate},${event.revenue},${event.costs},${event.netProfit},${event.itemsCount}`
    )
  }

  lines.push('')

  // Category breakdown
  lines.push('DETTAGLIO PER CATEGORIA')
  lines.push('Categoria,Tipo,Totale,Voci')

  for (const cat of reportData.categoryBreakdown) {
    const catType = cat.isRevenue ? 'Entrata' : 'Costo'
    lines.push(`"${cat.categoryName}",${catType},${cat.totalAmount},${cat.itemCount}`)
  }

  const csvContent = lines.join('\n')

  // Generate filename with date
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `report_finanziario_${dateStr}.csv`

  return { csvContent, filename }
}
