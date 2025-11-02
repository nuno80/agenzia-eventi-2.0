/**
 * FILE: src/app/actions/staff.ts
 * PURPOSE: Server Actions for staff CRUD operations (hardened parsing)
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db, staff } from '@/db'
import { createStaffSchema, updateStaffSchema } from '@/lib/validations/staff'

type ActionResult = {
  success: boolean
  message: string
  data?: unknown
  errors?: Record<string, string[]>
}

function normalizeTags(input: unknown): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input as string[]
  const raw = String(input).trim()
  if (!raw) return []
  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as string[]) : []
    } catch {
      // fallthrough
    }
  }
  return raw.split(',').map((t) => t.trim()).filter(Boolean)
}

export async function createStaff(formData: FormData | Record<string, unknown>): Promise<ActionResult> {
  try {
    let data: Record<string, unknown>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)
      data.isActive = formData.has('isActive')

      if (data.hourlyRate) data.hourlyRate = parseFloat(data.hourlyRate as string)

      if (typeof data.tags === 'string' || Array.isArray(data.tags)) {
        data.tags = normalizeTags(data.tags)
      }
    } else {
      data = formData as Record<string, unknown>
      if (typeof data.tags === 'string' || Array.isArray(data.tags)) {
        data.tags = normalizeTags(data.tags)
      }
    }

    const validated = createStaffSchema.parse(data)
    const [newStaff] = await db.insert(staff).values(validated).returning()

    revalidatePath('/persone/staff')
    revalidatePath('/')

    return { success: true, message: 'Staff member creato con successo', data: { id: newStaff.id } }
  } catch (error) {
    console.error('Create staff error:', error)
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Errori di validazione', errors: error.flatten().fieldErrors }
    }
    return { success: false, message: 'Errore durante la creazione dello staff member' }
  }
}

export async function updateStaff(
  staffId: string,
  formData: FormData | Record<string, unknown>
): Promise<ActionResult> {
  try {
    let data: Record<string, unknown>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)
      data.isActive = formData.has('isActive')

      if (data.hourlyRate) data.hourlyRate = parseFloat(data.hourlyRate as string)

      if (typeof data.tags === 'string' || Array.isArray(data.tags)) {
        data.tags = normalizeTags(data.tags)
      }
    } else {
      data = formData as Record<string, unknown>
      if (typeof data.tags === 'string' || Array.isArray(data.tags)) {
        data.tags = normalizeTags(data.tags)
      }
    }

    const validated = updateStaffSchema.parse(data)

    await db
      .update(staff)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(staff.id, staffId))

    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${staffId}`)
    revalidatePath('/')

    return { success: true, message: 'Staff member aggiornato con successo' }
  } catch (error) {
    console.error('Update staff error:', error)
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Errori di validazione', errors: error.flatten().fieldErrors }
    }
    return { success: false, message: "Errore durante l'aggiornamento dello staff member" }
  }
}

export async function deleteStaff(staffId: string): Promise<ActionResult> {
  try {
    await db.delete(staff).where(eq(staff.id, staffId))
    revalidatePath('/persone/staff')
    revalidatePath('/')
    return { success: true, message: 'Staff member eliminato con successo' }
  } catch (error) {
    console.error('Delete staff error:', error)
    return { success: false, message: "Errore durante l'eliminazione dello staff member" }
  }
}

export async function toggleStaffActive(staffId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await db
      .update(staff)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(staff.id, staffId))

    revalidatePath('/persone/staff')
    revalidatePath(`/persone/staff/${staffId}`)

    return {
      success: true,
      message: isActive ? 'Staff member attivato con successo' : 'Staff member disattivato con successo',
    }
  } catch (error) {
    console.error('Toggle staff active error:', error)
    return { success: false, message: "Errore durante l'aggiornamento dello status" }
  }
}
