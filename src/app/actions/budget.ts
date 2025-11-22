/**
 * FILE: src/app/actions/budget.ts
 * PURPOSE: Budget mutations (categories and items CRUD operations)
 */

'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { budgetCategories, budgetItems, db } from '@/db'
import {
  createBudgetCategorySchema,
  createBudgetItemSchema,
  updateBudgetCategorySchema,
  updateBudgetItemSchema,
  updateBudgetItemStatusSchema,
} from '@/lib/validations/budget'

export type ActionResult = {
  success: boolean
  message: string
  data?: Record<string, unknown>
  errors?: Record<string, string[]>
}

// ============================================================================
// DATA FETCHING ACTIONS
// ============================================================================

/**
 * Fetch budget categories for an event
 * Used by client components that need to load categories dynamically
 */
export async function getBudgetCategories(eventId: string) {
  try {
    const categories = await db
      .select()
      .from(budgetCategories)
      .where(eq(budgetCategories.eventId, eventId))
      .orderBy(budgetCategories.name)

    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching budget categories:', error)
    return { success: false, data: [] }
  }
}

// ============================================================================
// BUDGET CATEGORY ACTIONS
// ============================================================================

/**
 * Create a new budget category for an event
 */
export async function createBudgetCategory(eventId: string, data: unknown): Promise<ActionResult> {
  try {
    // Validate input
    const validated = createBudgetCategorySchema.parse(data)

    // Create category
    const [newCategory] = await db
      .insert(budgetCategories)
      .values({
        ...validated,
        eventId,
        spentAmount: 0,
      })
      .returning()

    // Revalidate paths
    revalidatePath(`/eventi/${eventId}/budget`)
    revalidatePath(`/eventi/${eventId}`)

    return {
      success: true,
      message: 'Categoria budget creata con successo',
      data: { id: newCategory.id },
    }
  } catch (error) {
    console.error('Create budget category error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: 'Errore durante la creazione della categoria' }
  }
}

/**
 * Update an existing budget category
 */
export async function updateBudgetCategory(
  categoryId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateBudgetCategorySchema.parse(data)

    // Get category to find eventId for revalidation
    const [category] = await db
      .select({ eventId: budgetCategories.eventId })
      .from(budgetCategories)
      .where(eq(budgetCategories.id, categoryId))

    if (!category) {
      return { success: false, message: 'Categoria non trovata' }
    }

    // Update category
    await db
      .update(budgetCategories)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(budgetCategories.id, categoryId))

    // Revalidate paths
    revalidatePath(`/eventi/${category.eventId}/budget`)
    revalidatePath(`/eventi/${category.eventId}`)

    return { success: true, message: 'Categoria aggiornata con successo' }
  } catch (error) {
    console.error('Update budget category error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'aggiornamento della categoria" }
  }
}

/**
 * Delete a budget category (cascade deletes all items)
 */
export async function deleteBudgetCategory(categoryId: string): Promise<ActionResult> {
  try {
    // Get category to find eventId for revalidation
    const [category] = await db
      .select({ eventId: budgetCategories.eventId })
      .from(budgetCategories)
      .where(eq(budgetCategories.id, categoryId))

    if (!category) {
      return { success: false, message: 'Categoria non trovata' }
    }

    // Delete category (cascade will delete items)
    await db.delete(budgetCategories).where(eq(budgetCategories.id, categoryId))

    // Revalidate paths
    revalidatePath(`/eventi/${category.eventId}/budget`)
    revalidatePath(`/eventi/${category.eventId}`)

    return { success: true, message: 'Categoria eliminata con successo' }
  } catch (error) {
    console.error('Delete budget category error:', error)
    return { success: false, message: "Errore durante l'eliminazione della categoria" }
  }
}

// ============================================================================
// BUDGET ITEM ACTIONS
// ============================================================================

/**
 * Create a new budget item in a category
 */
export async function createBudgetItem(
  categoryId: string,
  eventId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = createBudgetItemSchema.parse(data)

    // Create item
    const [newItem] = await db
      .insert(budgetItems)
      .values({
        ...validated,
        categoryId,
        eventId,
      })
      .returning()

    // Update category spent amount if item has actual cost
    if (validated.actualCost && validated.actualCost > 0) {
      await updateCategorySpentAmount(categoryId)
    }

    // Revalidate paths
    try {
      revalidatePath(`/eventi/${eventId}/budget`)
      revalidatePath(`/eventi/${eventId}`)
    } catch (e) {
      // Ignore revalidatePath errors in scripts/tests
      console.warn('revalidatePath failed (expected in scripts):', e)
    }

    return {
      success: true,
      message: 'Voce di budget creata con successo',
      data: { id: newItem.id },
    }
  } catch (error) {
    console.error('Create budget item error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: 'Errore durante la creazione della voce di budget' }
  }
}

/**
 * Update an existing budget item
 */
export async function updateBudgetItem(itemId: string, data: unknown): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateBudgetItemSchema.parse(data)

    // Get item to find eventId and categoryId for revalidation
    const [item] = await db
      .select({
        eventId: budgetItems.eventId,
        categoryId: budgetItems.categoryId,
      })
      .from(budgetItems)
      .where(eq(budgetItems.id, itemId))

    if (!item) {
      return { success: false, message: 'Voce di budget non trovata' }
    }

    // Update item
    await db
      .update(budgetItems)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(budgetItems.id, itemId))

    // Update category spent amount if actual cost changed
    if (validated.actualCost !== undefined) {
      await updateCategorySpentAmount(item.categoryId)
    }

    // Revalidate paths
    revalidatePath(`/eventi/${item.eventId}/budget`)
    revalidatePath(`/eventi/${item.eventId}`)

    return { success: true, message: 'Voce di budget aggiornata con successo' }
  } catch (error) {
    console.error('Update budget item error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'aggiornamento della voce di budget" }
  }
}

/**
 * Delete a budget item
 */
export async function deleteBudgetItem(itemId: string): Promise<ActionResult> {
  try {
    // Get item to find eventId and categoryId for revalidation
    const [item] = await db
      .select({
        eventId: budgetItems.eventId,
        categoryId: budgetItems.categoryId,
      })
      .from(budgetItems)
      .where(eq(budgetItems.id, itemId))

    if (!item) {
      return { success: false, message: 'Voce di budget non trovata' }
    }

    // Delete item
    await db.delete(budgetItems).where(eq(budgetItems.id, itemId))

    // Update category spent amount
    await updateCategorySpentAmount(item.categoryId)

    // Revalidate paths
    revalidatePath(`/eventi/${item.eventId}/budget`)
    revalidatePath(`/eventi/${item.eventId}`)

    return { success: true, message: 'Voce di budget eliminata con successo' }
  } catch (error) {
    console.error('Delete budget item error:', error)
    return { success: false, message: "Errore durante l'eliminazione della voce di budget" }
  }
}

/**
 * Update budget item status (with optional payment date and actual cost)
 */
export async function updateBudgetItemStatus(itemId: string, data: unknown): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateBudgetItemStatusSchema.parse(data)

    // Get item to find eventId and categoryId for revalidation
    const [item] = await db
      .select({
        eventId: budgetItems.eventId,
        categoryId: budgetItems.categoryId,
      })
      .from(budgetItems)
      .where(eq(budgetItems.id, itemId))

    if (!item) {
      return { success: false, message: 'Voce di budget non trovata' }
    }

    // Update item status
    await db
      .update(budgetItems)
      .set({
        status: validated.status,
        paymentDate: validated.paymentDate,
        actualCost: validated.actualCost,
        updatedAt: new Date(),
      })
      .where(eq(budgetItems.id, itemId))

    // Update category spent amount if actual cost changed
    if (validated.actualCost !== undefined) {
      await updateCategorySpentAmount(item.categoryId)
    }

    // Revalidate paths
    revalidatePath(`/eventi/${item.eventId}/budget`)
    revalidatePath(`/eventi/${item.eventId}`)

    return { success: true, message: 'Stato aggiornato con successo' }
  } catch (error) {
    console.error('Update budget item status error:', error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Errori di validazione',
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    return { success: false, message: "Errore durante l'aggiornamento dello stato" }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Recalculate and update category spent amount based on actual costs of items
 * WHY: Keep category spentAmount in sync with sum of item actualCosts
 */
async function updateCategorySpentAmount(categoryId: string): Promise<void> {
  try {
    // Get all items for this category
    const items = await db
      .select({ actualCost: budgetItems.actualCost })
      .from(budgetItems)
      .where(eq(budgetItems.categoryId, categoryId))

    // Calculate total spent
    const totalSpent = items.reduce((sum, item) => sum + (item.actualCost || 0), 0)

    // Update category
    await db
      .update(budgetCategories)
      .set({
        spentAmount: totalSpent,
        updatedAt: new Date(),
      })
      .where(eq(budgetCategories.id, categoryId))
  } catch (error) {
    console.error('Update category spent amount error:', error)
    // Don't throw - this is a background update
  }
}
