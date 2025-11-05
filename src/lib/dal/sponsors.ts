/**
 * FILE: src/lib/dal/sponsors.ts
 * TYPE: Server-side Data Access Layer
 * WHY: Centralize access to sponsors data with DTO pattern and cache()
 */

import { asc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { db, sponsors } from '@/db'

export type SponsorDTO = {
  id: string
  eventId: string
  companyName: string
  contactPerson: string | null
  email: string
  phone: string | null
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner'
  sponsorshipAmount: number
  contractSigned: boolean
  contractDate: Date | null
  contractUrl: string | null
  paymentStatus: 'pending' | 'partial' | 'paid'
  paymentDate: Date | null
  logoUrl: string | null
  websiteUrl: string | null
  description: string | null
  freeTickets: number
}

function toDTO(row: typeof sponsors.$inferSelect): SponsorDTO {
  return {
    id: row.id,
    eventId: row.eventId,
    companyName: row.companyName,
    contactPerson: row.contactPerson ?? null,
    email: row.email,
    phone: row.phone ?? null,
    sponsorshipLevel: row.sponsorshipLevel as SponsorDTO['sponsorshipLevel'],
    sponsorshipAmount: row.sponsorshipAmount,
    contractSigned: Boolean(row.contractSigned),
    contractDate: row.contractDate ?? null,
    contractUrl: row.contractUrl ?? null,
    paymentStatus: row.paymentStatus as SponsorDTO['paymentStatus'],
    paymentDate: row.paymentDate ?? null,
    logoUrl: row.logoUrl ?? null,
    websiteUrl: row.websiteUrl ?? null,
    description: row.description ?? null,
    freeTickets: row.freeTickets ?? 0,
  }
}

export const getSponsorsByEvent = cache(async (eventId: string): Promise<SponsorDTO[]> => {
  const rows = await db.query.sponsors.findMany({
    where: eq(sponsors.eventId, eventId),
    orderBy: [asc(sponsors.companyName)],
  })
  return rows.map(toDTO)
})

export const getAllSponsors = cache(async (): Promise<SponsorDTO[]> => {
  const rows = await db.query.sponsors.findMany({ orderBy: [asc(sponsors.companyName)] })
  return rows.map(toDTO)
})

export const getSponsorStatsByEvent = cache(async (eventId: string) => {
  const all = await db.query.sponsors.findMany({ where: eq(sponsors.eventId, eventId) })
  const total = all.length
  const signed = all.filter((s) => Boolean(s.contractSigned)).length
  const paidCount = all.filter((s) => s.paymentStatus === 'paid').length
  const partialCount = all.filter((s) => s.paymentStatus === 'partial').length
  const pendingCount = all.filter((s) => s.paymentStatus === 'pending').length
  const totalAmount = all.reduce((sum, s) => sum + (s.sponsorshipAmount || 0), 0)
  // Approximation: consider partial as 50% for quick stat (can be refined with separate paidAmount column later)
  const paidAmount = all.reduce((sum, s) => {
    if (s.paymentStatus === 'paid') return sum + (s.sponsorshipAmount || 0)
    if (s.paymentStatus === 'partial') return sum + (s.sponsorshipAmount || 0) * 0.5
    return sum
  }, 0)

  return {
    total,
    signed,
    unsigned: total - signed,
    payment: {
      paid: paidCount,
      partial: partialCount,
      pending: pendingCount,
    },
    amounts: {
      totalAmount,
      paidAmount,
      remainingAmount: Math.max(0, totalAmount - paidAmount),
    },
  }
})
