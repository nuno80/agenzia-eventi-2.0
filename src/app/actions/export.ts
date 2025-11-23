/**
 * FILE: src/app/actions/export.ts
 * TYPE: Server Actions
 * WHY: Handle data export for Excel and PDF (client-side generation)
 *
 * NOTE: Export generation happens client-side using export utilities.
 * These actions fetch and format data for export.
 */

'use server'

import { getBudgetCategoriesByEvent, getGlobalBudgetStats } from '@/lib/dal/budget'
import { getEventWithParticipants } from '@/lib/dal/events'
import { getAllSpeakers } from '@/lib/dal/speakers'
import { getAllSponsors } from '@/lib/dal/sponsors'
import type { ExportColumn } from '@/lib/utils/export'

// ============================================================================
// TYPES
// ============================================================================

type ExportResult<T = any> =
  | { success: true; data: T; columns: ExportColumn[] }
  | { success: false; error: string }

// ============================================================================
// PARTICIPANTS EXPORT
// ============================================================================

export async function getParticipantsExportData(eventId: string): Promise<ExportResult> {
  try {
    const event = await getEventWithParticipants(eventId)
    if (!event) {
      return { success: false, error: 'Evento non trovato' }
    }

    const columns: ExportColumn[] = [
      { header: 'Nome', key: 'firstName' },
      { header: 'Cognome', key: 'lastName' },
      { header: 'Email', key: 'email' },
      { header: 'Telefono', key: 'phone' },
      { header: 'Azienda', key: 'company' },
      { header: 'Ruolo', key: 'jobTitle' },
      { header: 'Tipo Ticket', key: 'ticketType' },
      { header: 'Stato Registrazione', key: 'registrationStatus' },
      { header: 'Pagamento', key: 'paymentStatus' },
      { header: 'Check-in', key: 'checkedIn' },
    ]

    const data = event.participants.map((p) => ({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone || '',
      company: p.company || '',
      jobTitle: p.jobTitle || '',
      ticketType: p.ticketType || '',
      registrationStatus: p.registrationStatus,
      paymentStatus: p.paymentStatus,
      checkedIn: p.checkedIn ? 'Sì' : 'No',
    }))

    return { success: true, data, columns }
  } catch (error) {
    console.error('Export participants failed:', error)
    return { success: false, error: "Errore durante l'esportazione" }
  }
}

// ============================================================================
// BUDGET EXPORT
// ============================================================================

export async function getBudgetExportData(eventId: string): Promise<ExportResult> {
  try {
    const categories = await getBudgetCategoriesByEvent(eventId)
    if (!categories || categories.length === 0) {
      return { success: false, error: 'Budget non trovato' }
    }

    const columns: ExportColumn[] = [
      { header: 'Categoria', key: 'category' },
      { header: 'Descrizione', key: 'description' },
      { header: 'Costo Stimato', key: 'estimatedCost' },
      { header: 'Costo Effettivo', key: 'actualCost' },
      { header: 'Stato', key: 'status' },
      { header: 'Fornitore', key: 'vendor' },
    ]

    const data = categories.flatMap((cat: any) =>
      cat.items.map((item: any) => ({
        category: cat.name,
        description: item.description,
        estimatedCost: `€ ${item.estimatedCost.toFixed(2)}`,
        actualCost: item.actualCost ? `€ ${item.actualCost.toFixed(2)}` : '',
        status: item.status,
        vendor: item.vendor || '',
      }))
    )

    return { success: true, data, columns }
  } catch (error) {
    console.error('Export budget failed:', error)
    return { success: false, error: "Errore durante l'esportazione" }
  }
}

// ============================================================================
// SPEAKERS EXPORT
// ============================================================================

export async function getSpeakersExportData(eventId: string): Promise<ExportResult> {
  try {
    const speakers = await getAllSpeakers()
    const filtered = speakers.filter((s) => s.eventId === eventId)

    const columns: ExportColumn[] = [
      { header: 'Nome', key: 'firstName' },
      { header: 'Cognome', key: 'lastName' },
      { header: 'Email', key: 'email' },
      { header: 'Azienda', key: 'company' },
      { header: 'Titolo Sessione', key: 'sessionTitle' },
      { header: 'Stato Conferma', key: 'confirmationStatus' },
      { header: 'Compenso', key: 'fee' },
    ]

    const data = filtered.map((s) => ({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      company: s.company || '',
      sessionTitle: s.sessionTitle || '',
      confirmationStatus: s.confirmationStatus,
      fee: `€ ${s.fee.toFixed(2)}`,
    }))

    return { success: true, data, columns }
  } catch (error) {
    console.error('Export speakers failed:', error)
    return { success: false, error: "Errore durante l'esportazione" }
  }
}

// ============================================================================
// SPONSORS EXPORT
// ============================================================================

export async function getSponsorsExportData(eventId: string): Promise<ExportResult> {
  try {
    const sponsors = await getAllSponsors()
    const filtered = sponsors.filter((s) => s.eventId === eventId)

    const columns: ExportColumn[] = [
      { header: 'Azienda', key: 'companyName' },
      { header: 'Contatto', key: 'contactPerson' },
      { header: 'Email', key: 'email' },
      { header: 'Livello', key: 'sponsorshipLevel' },
      { header: 'Importo', key: 'sponsorshipAmount' },
      { header: 'Contratto Firmato', key: 'contractSigned' },
      { header: 'Stato Pagamento', key: 'paymentStatus' },
    ]

    const data = filtered.map((s) => ({
      companyName: s.companyName,
      contactPerson: s.contactPerson || '',
      email: s.email,
      sponsorshipLevel: s.sponsorshipLevel,
      sponsorshipAmount: `€ ${s.sponsorshipAmount.toFixed(2)}`,
      contractSigned: s.contractSigned ? 'Sì' : 'No',
      paymentStatus: s.paymentStatus,
    }))

    return { success: true, data, columns }
  } catch (error) {
    console.error('Export sponsors failed:', error)
    return { success: false, error: "Errore durante l'esportazione" }
  }
}

// ============================================================================
// FINANCIAL REPORT EXPORT
// ============================================================================

export async function getFinancialReportExportData(): Promise<ExportResult> {
  try {
    const stats = await getGlobalBudgetStats()

    const columns: ExportColumn[] = [
      { header: 'Evento', key: 'eventTitle' },
      { header: 'Entrate', key: 'revenue' },
      { header: 'Spese', key: 'expenses' },
      { header: 'Profitto', key: 'profit' },
      { header: 'Margine %', key: 'margin' },
    ]

    const data = stats.eventBreakdown.map((e: any) => ({
      eventTitle: e.eventTitle,
      revenue: `€ ${e.revenue.toFixed(2)}`,
      expenses: `€ ${e.expenses.toFixed(2)}`,
      profit: `€ ${e.profit.toFixed(2)}`,
      margin: `${e.margin.toFixed(1)}%`,
    }))

    return { success: true, data, columns }
  } catch (error) {
    console.error('Export financial report failed:', error)
    return { success: false, error: "Errore durante l'esportazione" }
  }
}
