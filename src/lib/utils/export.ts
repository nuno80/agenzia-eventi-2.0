/**
 * FILE: src/lib/utils/export.ts
 * TYPE: Utility Functions
 * WHY: Centralize Excel and PDF export logic
 *
 * FEATURES:
 * - Excel export with xlsx (SheetJS)
 * - PDF export with jspdf + jspdf-autotable
 * - Type-safe column definitions
 * - Auto-download functionality
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// ============================================================================
// TYPES
// ============================================================================

export type ExportColumn = {
  header: string
  key: string
  width?: number
}

export type ExportData = Record<string, any>

// ============================================================================
// EXCEL EXPORT
// ============================================================================

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param filename - Output filename (without extension)
 * @param sheetName - Name of the Excel sheet
 */
export function exportToExcel(
  data: ExportData[],
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  try {
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error('Excel export failed:', error)
    throw new Error("Errore durante l'esportazione Excel")
  }
}

/**
 * Format data for Excel export
 * Transforms complex objects into flat structure
 */
export function formatDataForExcel(data: ExportData[], columns: ExportColumn[]): ExportData[] {
  return data.map((row) => {
    const formatted: ExportData = {}
    columns.forEach((col) => {
      formatted[col.header] = row[col.key] ?? ''
    })
    return formatted
  })
}

// ============================================================================
// PDF EXPORT
// ============================================================================

/**
 * Export data to PDF file with table
 * @param data - Array of objects to export
 * @param filename - Output filename (without extension)
 * @param title - PDF document title
 * @param columns - Column definitions
 */
export function exportToPDF(
  data: ExportData[],
  filename: string,
  title: string,
  columns: ExportColumn[]
): void {
  try {
    // Create PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text(title, 14, 22)

    // Add timestamp
    doc.setFontSize(10)
    doc.setTextColor(128)
    const timestamp = new Date().toLocaleString('it-IT')
    doc.text(`Generato il: ${timestamp}`, 14, 30)

    // Prepare table data
    const headers = columns.map((col) => col.header)
    const body = data.map((row) => columns.map((col) => String(row[col.key] ?? '')))

    // Generate table
    autoTable(doc, {
      head: [headers],
      body,
      startY: 35,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235], // Blue-600
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Gray-50
      },
      margin: { top: 35 },
    })

    // Save PDF
    doc.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF export failed:', error)
    throw new Error("Errore durante l'esportazione PDF")
  }
}

/**
 * Generate PDF table only (for custom PDF documents)
 */
export function generatePDFTable(
  doc: jsPDF,
  data: ExportData[],
  columns: ExportColumn[],
  startY: number = 10
): void {
  const headers = columns.map((col) => col.header)
  const body = data.map((row) => columns.map((col) => String(row[col.key] ?? '')))

  autoTable(doc, {
    head: [headers],
    body,
    startY,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  })
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format date for export
 */
export function formatDateForExport(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('it-IT')
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number | null): string {
  if (amount === null || amount === undefined) return '€ 0,00'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Format boolean for export
 */
export function formatBooleanForExport(value: boolean | null): string {
  if (value === null || value === undefined) return 'No'
  return value ? 'Sì' : 'No'
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}
