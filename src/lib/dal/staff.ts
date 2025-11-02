/**
 * FILE: src/lib/dal/staff.ts
 * Data Access Layer for Staff
 */

import { and, asc, eq, gte } from 'drizzle-orm'
import { cache } from 'react'
import { db, staff, staffAssignments } from '@/db'

export type StaffDTO = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  photoUrl: string | null
  role:
    | 'hostess'
    | 'steward'
    | 'driver'
    | 'av_tech'
    | 'photographer'
    | 'videographer'
    | 'security'
    | 'catering'
    | 'cleaning'
    | 'other'
  specialization: string | null
  hourlyRate: number | null
  preferredPaymentMethod: string | null
  isActive: boolean
  tags: string[] | null
  notes: string | null
}

function safeParseTags(jsonLike: string | null | undefined): string[] | null {
  if (!jsonLike) return null
  const s = String(jsonLike).trim()
  if (!s) return null
  try {
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? (parsed as string[]) : null
  } catch {
    return null
  }
}

function toDTO(row: typeof staff.$inferSelect): StaffDTO {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone ?? null,
    photoUrl: row.photoUrl ?? null,
    role: row.role as StaffDTO['role'],
    specialization: row.specialization ?? null,
    hourlyRate: row.hourlyRate ?? null,
    preferredPaymentMethod: row.preferredPaymentMethod ?? null,
    isActive: Boolean(row.isActive),
    tags: safeParseTags(row.tags),
    notes: row.notes ?? null,
  }
}

// BASIC QUERIES
export const getStaffById = cache(async (id: string): Promise<StaffDTO | null> => {
  const row = await db.query.staff.findFirst({ where: eq(staff.id, id) })
  return row ? toDTO(row) : null
})

export const getAllStaff = cache(async (): Promise<StaffDTO[]> => {
  const rows = await db.query.staff.findMany({
    orderBy: [asc(staff.lastName), asc(staff.firstName)],
  })
  return rows.map(toDTO)
})

// FILTERS & SEARCH
export const filterStaff = cache(
  async (params: {
    role?: StaffDTO['role']
    isActive?: boolean
    tags?: string[]
  }): Promise<StaffDTO[]> => {
    const rows = await db.query.staff.findMany()

    let filtered = rows
    if (params.role) {
      filtered = filtered.filter((s) => s.role === params.role)
    }
    if (typeof params.isActive === 'boolean') {
      filtered = filtered.filter((s) => Boolean(s.isActive) === params.isActive)
    }
    if (params.tags && params.tags.length > 0) {
      filtered = filtered.filter((s) => {
        const t = safeParseTags(s.tags as unknown as string)
        return t ? params.tags?.every((tg) => t.includes(tg)) ?? false : false
      })
    }

    return filtered.map(toDTO)
  }
)

// STATS
export const getStaffStats = cache(async () => {
  const rows = await db.query.staff.findMany()
  const active = rows.filter((s) => Boolean(s.isActive)).length
  const byRole = rows.reduce<Record<string, number>>((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1
    return acc
  }, {})

  return {
    total: rows.length,
    active,
    inactive: rows.length - active,
    byRole,
  }
})

// ASSIGNMENT HELPERS
export const getUpcomingAssignmentsForStaff = cache(async (staffId: string) => {
  const now = new Date()
  const rows = await db.query.staffAssignments.findMany({
    where: and(eq(staffAssignments.staffId, staffId), gte(staffAssignments.startTime, now)),

    with: { event: { columns: { id: true, title: true, startDate: true, endDate: true } } },
    orderBy: [asc(staffAssignments.startTime)],
  })
  return rows
})
