/**
 * FILE: src/lib/dal/speakers.ts
 * TYPE: Server-side Data Access Layer
 * WHY: Centralize access to speakers data with DTO pattern and cache()
 */

import { asc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { db, speakers } from '@/db'

export type SpeakerDTO = {
  id: string
  eventId: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  title: string | null
  company: string | null
  jobTitle: string | null
  photoUrl: string | null
  websiteUrl: string | null
  linkedinUrl: string | null
  twitterHandle: string | null
  sessionTitle: string | null
  sessionDescription: string | null
  sessionDate: Date | null
  sessionDuration: number | null
  confirmationStatus: 'invited' | 'confirmed' | 'declined' | 'tentative'
}

function toDTO(row: typeof speakers.$inferSelect): SpeakerDTO {
  return {
    id: row.id,
    eventId: row.eventId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? null,
    title: row.title ?? null,
    company: row.company ?? null,
    jobTitle: row.jobTitle ?? null,
    photoUrl: row.photoUrl ?? null,
    websiteUrl: row.websiteUrl ?? null,
    linkedinUrl: row.linkedinUrl ?? null,
    twitterHandle: row.twitterHandle ?? null,
    sessionTitle: row.sessionTitle ?? null,
    sessionDescription: row.sessionDescription ?? null,
    sessionDate: row.sessionDate ?? null,
    sessionDuration: row.sessionDuration ?? null,
    confirmationStatus: row.confirmationStatus as SpeakerDTO['confirmationStatus'],
  }
}

export const getSpeakersByEvent = cache(async (eventId: string): Promise<SpeakerDTO[]> => {
  const rows = await db.query.speakers.findMany({
    where: eq(speakers.eventId, eventId),
    orderBy: [asc(speakers.lastName), asc(speakers.firstName)],
  })
  return rows.map(toDTO)
})

export const getAllSpeakers = cache(async (): Promise<SpeakerDTO[]> => {
  const rows = await db.query.speakers.findMany({
    orderBy: [asc(speakers.lastName), asc(speakers.firstName)],
  })
  return rows.map(toDTO)
})

export const getSpeakerStatsByEvent = cache(async (eventId: string) => {
  const all = await db.query.speakers.findMany({ where: eq(speakers.eventId, eventId) })
  const total = all.length
  const invited = all.filter((s) => s.confirmationStatus === 'invited').length
  const confirmed = all.filter((s) => s.confirmationStatus === 'confirmed').length
  const declined = all.filter((s) => s.confirmationStatus === 'declined').length
  const tentative = all.filter((s) => s.confirmationStatus === 'tentative').length

  return { total, invited, confirmed, declined, tentative }
})
