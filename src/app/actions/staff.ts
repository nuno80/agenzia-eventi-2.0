/**
 * FILE: src/app/actions/staff.ts
 *
 * PURPOSE:
 * - Server Actions for staff CRUD operations
 * - All actions validate input with Zod schemas
 * - Revalidate cache after mutations
 * - Return consistent ActionResult type
 *
 * ACTIONS:
 * - createStaff: Create new staff member
 * - updateStaff: Update existing staff member
 * - deleteStaff: Delete staff member
 * - toggleActive: Activate/deactivate staff member
 *
 * USAGE:
 * import { createStaff } from '@/app/actions/staff';
 * const result = await createStaff(formData);
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { staff } from '@/lib/db/schema'
import { createStaffSchema, updateStaffSchema } from '@/lib/validations/staff'

/**
 * Action Result Type
 */
type ActionResult = {
  success: boolean
  message: string
  data?: any
  errors?: Record<string, string[]>
}

/**
 * Create Staff Action
 *
 * @param formData - FormData or plain object with staff data
 * @returns ActionResult with new staff ID or errors
 */
export async function createStaff(formData: FormData | Record<string, any>): Promise<ActionResult> {
  try {
    // Convert FormData to object if needed
    let data: Record<string, any>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)

      // Handle checkbox
      data.isActive = formData.has('isActive')

      // Parse number
      if (data.hourlyRate) {
        data.hourlyRate = parseFloat(data.hourlyRate as string)
      }

      // Parse tags if present
      if (data.tags && typeof data.tags === 'string') {
        try {
          data.tags = JSON.parse(data.tags)
        } catch {
          data.tags = data.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        }
      }
    } else {
      data = formData
    }

    // Validate with Zod
    const validated = createStaffSchema.parse(data)

    // Insert into database
    const [newStaff] = await db.insert(staff).values(validated).returning()

    // Revalidate cache
    revalidatePath('/personale')
    revalidatePath('/')

    return {
      success: true,
      message: 'Staff member creato con successo',
      data: { id: newStaff.id },
    }
  } catch (error) {
    console.error('Create staff error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    return {
      success: false,
      message: 'Errore durante la creazione dello staff member',
    }
  }
}

/**
 * Update Staff Action
 *
 * @param staffId - Staff ID to update
 * @param formData - FormData or plain object with staff data
 * @returns ActionResult
 */
export async function updateStaff(
  staffId: string,
  formData: FormData | Record<string, any>
): Promise<ActionResult> {
  try {
    // Convert FormData to object if needed
    let data: Record<string, any>

    if (formData instanceof FormData) {
      data = Object.fromEntries(formData)

      // Handle checkbox
      data.isActive = formData.has('isActive')

      // Parse number
      if (data.hourlyRate) {
        data.hourlyRate = parseFloat(data.hourlyRate as string)
      }

      // Parse tags if present
      if (data.tags && typeof data.tags === 'string') {
        try {
          data.tags = JSON.parse(data.tags)
        } catch {
          data.tags = data.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        }
      }
    } else {
      data = formData
    }

    // Validate with Zod (partial schema)
    const validated = updateStaffSchema.parse(data)

    // Update in database
    await db
      .update(staff)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(staff.id, staffId))

    // Revalidate cache
    revalidatePath('/personale')
    revalidatePath(`/personale/${staffId}`)
    revalidatePath('/')

    return {
      success: true,
      message: 'Staff member aggiornato con successo',
    }
  } catch (error) {
    console.error('Update staff error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    return {
      success: false,
      message: "Errore durante l'aggiornamento dello staff member",
    }
  }
}

/**
 * Delete Staff Action
 *
 * @param staffId - Staff ID to delete
 * @returns ActionResult
 */
export async function deleteStaff(staffId: string): Promise<ActionResult> {
  try {
    // Delete from database (cascade will delete assignments)
    await db.delete(staff).where(eq(staff.id, staffId))

    // Revalidate cache
    revalidatePath('/personale')
    revalidatePath('/')

    return {
      success: true,
      message: 'Staff member eliminato con successo',
    }
  } catch (error) {
    console.error('Delete staff error:', error)

    return {
      success: false,
      message: "Errore durante l'eliminazione dello staff member",
    }
  }
}

/**
 * Toggle Active Status Action
 * Quick action to activate/deactivate staff member
 *
 * @param staffId - Staff ID
 * @param isActive - New active status
 * @returns ActionResult
 */
export async function toggleStaffActive(staffId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await db
      .update(staff)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(staff.id, staffId))

    // Revalidate cache
    revalidatePath('/personale')
    revalidatePath(`/personale/${staffId}`)

    return {
      success: true,
      message: isActive
        ? 'Staff member attivato con successo'
        : 'Staff member disattivato con successo',
    }
  } catch (error) {
    console.error('Toggle staff active error:', error)

    return {
      success: false,
      message: "Errore durante l'aggiornamento dello status",
    }
  }
}
