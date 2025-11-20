/**
 * DATA ACCESS LAYER: Budget
 *
 * PURPOSE:
 * - Centralize all database queries for budget categories and items
 * - Use React cache() to deduplicate requests
 * - Provide type-safe data fetching
 *
 * PATTERN:
 * - All functions are wrapped in cache() for automatic deduplication
 * - Used in Server Components and Server Actions
 * - Never call directly from Client Components
 *
 * USAGE:
 * import { getBudgetCategoriesByEvent } from '@/lib/dal/budget';
 * const budget = await getBudgetCategoriesByEvent('event_123');
 */

import { and, desc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { budgetCategories, budgetItems, db } from '@/db'

// ============================================================================
// BASIC QUERIES - CATEGORIES
// ============================================================================

/**
 * Get all budget categories for an event with their items
 * Returns categories ordered by creation date
 */
export const getBudgetCategoriesByEvent = cache(async (eventId: string) => {
  const categories = await db.query.budgetCategories.findMany({
    where: eq(budgetCategories.eventId, eventId),
    with: {
      items: {
        orderBy: [desc(budgetItems.createdAt)],
      },
    },
    orderBy: [desc(budgetCategories.createdAt)],
  })

  return categories
})

/**
 * Get single budget category by ID with all items
 * Returns null if not found
 */
export const getBudgetCategoryById = cache(async (categoryId: string) => {
  const category = await db.query.budgetCategories.findFirst({
    where: eq(budgetCategories.id, categoryId),
    with: {
      items: {
        orderBy: [desc(budgetItems.createdAt)],
      },
    },
  })

  return category || null
})

// ============================================================================
// BASIC QUERIES - ITEMS
// ============================================================================

/**
 * Get single budget item by ID
 * Returns null if not found
 */
export const getBudgetItemById = cache(async (itemId: string) => {
  const item = await db.query.budgetItems.findFirst({
    where: eq(budgetItems.id, itemId),
    with: {
      category: true,
    },
  })

  return item || null
})

/**
 * Get all budget items for a category
 * Ordered by creation date (newest first)
 */
export const getBudgetItemsByCategory = cache(async (categoryId: string) => {
  const items = await db.query.budgetItems.findMany({
    where: eq(budgetItems.categoryId, categoryId),
    orderBy: [desc(budgetItems.createdAt)],
  })

  return items
})

/**
 * Get budget items by status for an event
 * @param eventId - Event ID
 * @param status - Item status filter
 */
export const getBudgetItemsByStatus = cache(
  async (eventId: string, status: 'planned' | 'approved' | 'paid' | 'invoiced') => {
    const items = await db.query.budgetItems.findMany({
      where: and(eq(budgetItems.eventId, eventId), eq(budgetItems.status, status)),
      with: {
        category: true,
      },
      orderBy: [desc(budgetItems.createdAt)],
    })

    return items
  }
)

// ============================================================================
// AGGREGATIONS & STATS
// ============================================================================

/**
 * Get budget summary for an event
 * Returns aggregated statistics and breakdown by category
 */
export const getBudgetSummary = cache(async (eventId: string) => {
  // Get all categories with items
  const categories = await getBudgetCategoriesByEvent(eventId)

  // Calculate totals
  const totalAllocated = categories.reduce((sum, cat) => sum + (cat.allocatedAmount || 0), 0)
  const totalSpent = categories.reduce((sum, cat) => sum + (cat.spentAmount || 0), 0)

  // Calculate per-category stats
  const categoryBreakdown = categories.map((cat) => {
    const itemsCount = cat.items.length
    const estimatedTotal = cat.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
    const actualTotal = cat.items.reduce((sum, item) => sum + (item.actualCost || 0), 0)
    const paidItems = cat.items.filter((item) => item.status === 'paid').length
    const pendingItems = cat.items.filter((item) => item.status === 'planned').length

    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      allocatedAmount: cat.allocatedAmount || 0,
      spentAmount: cat.spentAmount || 0,
      remaining: (cat.allocatedAmount || 0) - (cat.spentAmount || 0),
      percentageUsed:
        cat.allocatedAmount && cat.allocatedAmount > 0
          ? ((cat.spentAmount || 0) / cat.allocatedAmount) * 100
          : 0,
      itemsCount,
      estimatedTotal,
      actualTotal,
      paidItems,
      pendingItems,
    }
  })

  // Calculate status counts across all items
  const allItems = categories.flatMap((cat) => cat.items)
  const statusCounts = {
    planned: allItems.filter((item) => item.status === 'planned').length,
    approved: allItems.filter((item) => item.status === 'approved').length,
    invoiced: allItems.filter((item) => item.status === 'invoiced').length,
    paid: allItems.filter((item) => item.status === 'paid').length,
  }

  return {
    totalAllocated,
    totalSpent,
    remaining: totalAllocated - totalSpent,
    percentageUsed: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
    categoriesCount: categories.length,
    itemsCount: allItems.length,
    categoryBreakdown,
    statusCounts,
  }
})

/**
 * Get budget items that are overdue for payment
 * Returns items with status 'invoiced' and payment date in the past
 */
export const getOverdueBudgetItems = cache(async (eventId: string) => {
  const now = new Date()

  const items = await db.query.budgetItems.findMany({
    where: and(eq(budgetItems.eventId, eventId), eq(budgetItems.status, 'invoiced')),
    with: {
      category: true,
    },
    orderBy: [desc(budgetItems.paymentDate)],
  })

  // Filter items with payment date in the past
  const overdueItems = items.filter((item) => {
    if (!item.paymentDate) return false
    return new Date(item.paymentDate) < now
  })

  return overdueItems
})

/**
 * Get total estimated vs actual costs for an event
 * Useful for budget variance analysis
 */
export const getBudgetVariance = cache(async (eventId: string) => {
  const categories = await getBudgetCategoriesByEvent(eventId)
  const allItems = categories.flatMap((cat) => cat.items)

  const totalEstimated = allItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
  const totalActual = allItems.reduce((sum, item) => sum + (item.actualCost || 0), 0)
  const variance = totalActual - totalEstimated
  const variancePercentage = totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0

  return {
    totalEstimated,
    totalActual,
    variance,
    variancePercentage,
    isOverBudget: variance > 0,
  }
})
