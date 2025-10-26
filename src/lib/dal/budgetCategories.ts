// ============================================================================
// DATA ACCESS LAYER - BUDGET CATEGORIES
// ============================================================================
// FILE: src/lib/dal/budgetCategories.ts
//
// PURPOSE: Centralizes all database queries related to event budget categories and items
// BENEFITS:
// - Type safety with TypeScript
// - Request deduplication with React cache()
// - Single source of truth for data fetching
// - Easy testing and maintenance
//
// USAGE:
// In Server Components:
//   import { getBudgetCategoryById } from '@/lib/dal/budgetCategories';
//   const category = await getBudgetCategoryById('123');
// ============================================================================

import { cache } from 'react'
import { db } from '@/db'
import { budget_categories, budget_items, events } from '@/db/libsql-schemas'
import { eq, gte, lte, desc, asc, and, or, like, sql, sum } from 'drizzle-orm'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Budget item status enum
 * Represents the status of a budget item
 */
export type BudgetItemStatus = 'planned' | 'approved' | 'pending' | 'paid' | 'cancelled'

/**
 * Filter options for budget category queries
 */
export interface BudgetCategoryFilters {
  eventId?: string
  searchQuery?: string
}

/**
 * Sort options for budget category queries
 */
export interface BudgetCategorySortOptions {
  field: 'name' | 'budgetAllocated'
  order: 'asc' | 'desc'
}

/**
 * Filter options for budget item queries
 */
export interface BudgetItemFilters {
  eventId?: string
  categoryId?: string
  status?: BudgetItemStatus | BudgetItemStatus[]
  minAmount?: number
  maxAmount?: number
  searchQuery?: string
}

/**
 * Sort options for budget item queries
 */
export interface BudgetItemSortOptions {
  field: 'name' | 'amount' | 'status' | 'dueDate'
  order: 'asc' | 'desc'
}

// ============================================================================
// READ OPERATIONS - BUDGET CATEGORIES
// ============================================================================

/**
 * Get a single budget category by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Category detail pages, forms that need category info
 *
 * @param id - Budget Category ID
 * @returns Budget Category object or null if not found
 *
 * @example
 * const category = await getBudgetCategoryById('cat_123');
 * if (!category) return notFound();
 */
export const getBudgetCategoryById = cache(async (id: string) => {
  try {
    const category = await db.query.budget_categories.findFirst({
      where: eq(budget_categories.id, id),
      with: {
        event: true,
      },
    })

    return category || null
  } catch (error) {
    console.error('Error fetching budget category by ID:', error)
    throw new Error('Failed to fetch budget category')
  }
})

/**
 * Get all budget categories with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Budget categories list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of budget categories
 *
 * @example
 * const categoriesList = await getAllBudgetCategories({ eventId: 'evt_123' }, { field: 'name', order: 'asc' });
 */
export const getAllBudgetCategories = cache(
  async (
    filters?: BudgetCategoryFilters,
    sort: BudgetCategorySortOptions = { field: 'name', order: 'asc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        conditions.push(eq(budget_categories.eventId, filters.eventId))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(budget_categories.name, searchTerm),
            like(budget_categories.description, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = budget_categories[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const allCategories = await db.query.budget_categories.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: orderFn(orderByField),
        with: {
          event: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      })

      return allCategories
    } catch (error) {
      console.error('Error fetching all budget categories:', error)
      throw new Error('Failed to fetch budget categories')
    }
  }
)

/**
 * Get budget categories for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event detail page, budget management
 *
 * @param eventId - Event ID
 * @returns Array of budget categories for the specified event
 *
 * @example
 * const eventCategories = await getBudgetCategoriesByEventId('evt_123');
 */
export const getBudgetCategoriesByEventId = cache(async (eventId: string) => {
  try {
    const eventCategories = await db.query.budget_categories.findMany({
      where: eq(budget_categories.eventId, eventId),
      orderBy: asc(budget_categories.name),
    })

    return eventCategories
  } catch (error) {
    console.error('Error fetching budget categories by event ID:', error)
    throw new Error('Failed to fetch event budget categories')
  }
})

/**
 * Get budget categories with their items for a specific event
 *
 * CACHE: Uses React cache()
 * USE CASE: Budget overview page, financial reporting
 *
 * @param eventId - Event ID
 * @returns Array of budget categories with their items
 *
 * @example
 * const budgetWithItems = await getBudgetWithItemsByEventId('evt_123');
 */
export const getBudgetWithItemsByEventId = cache(async (eventId: string) => {
  try {
    const categories = await db.query.budget_categories.findMany({
      where: eq(budget_categories.eventId, eventId),
      orderBy: asc(budget_categories.name),
      with: {
        items: {
          orderBy: asc(budget_items.name),
        },
      },
    })

    return categories
  } catch (error) {
    console.error('Error fetching budget with items:', error)
    throw new Error('Failed to fetch budget with items')
  }
})

/**
 * Check if budget category exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Budget Category ID to check
 * @returns Boolean indicating if budget category exists
 *
 * @example
 * const exists = await budgetCategoryExists('cat_123');
 * if (!exists) throw new Error('Budget category not found');
 */
export const budgetCategoryExists = cache(async (id: string): Promise<boolean> => {
  try {
    const category = await db.query.budget_categories.findFirst({
      where: eq(budget_categories.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!category
  } catch (error) {
    console.error('Error checking budget category existence:', error)
    return false
  }
})

// ============================================================================
// READ OPERATIONS - BUDGET ITEMS
// ============================================================================

/**
 * Get a single budget item by ID
 *
 * CACHE: Uses React cache() to deduplicate requests within a single render
 * USE CASE: Item detail pages, forms that need item info
 *
 * @param id - Budget Item ID
 * @returns Budget Item object or null if not found
 *
 * @example
 * const item = await getBudgetItemById('item_123');
 * if (!item) return notFound();
 */
export const getBudgetItemById = cache(async (id: string) => {
  try {
    const item = await db.query.budget_items.findFirst({
      where: eq(budget_items.id, id),
      with: {
        category: true,
      },
    })

    return item || null
  } catch (error) {
    console.error('Error fetching budget item by ID:', error)
    throw new Error('Failed to fetch budget item')
  }
})

/**
 * Get all budget items with optional filters and sorting
 *
 * CACHE: Uses React cache() for deduplication
 * USE CASE: Budget items list page, dashboard overview
 *
 * @param filters - Optional filters
 * @param sort - Optional sort configuration
 * @returns Array of budget items
 *
 * @example
 * const itemsList = await getAllBudgetItems({ status: 'approved' }, { field: 'amount', order: 'desc' });
 */
export const getAllBudgetItems = cache(
  async (
    filters?: BudgetItemFilters,
    sort: BudgetItemSortOptions = { field: 'name', order: 'asc' }
  ) => {
    try {
      // Build where conditions
      const conditions = []

      if (filters?.eventId) {
        // Join with budget_categories to filter by eventId
        // This will be handled in the query below
      }

      if (filters?.categoryId) {
        conditions.push(eq(budget_items.categoryId, filters.categoryId))
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(or(...filters.status.map((s) => eq(budget_items.status, s))))
        } else {
          conditions.push(eq(budget_items.status, filters.status))
        }
      }

      if (filters?.minAmount) {
        conditions.push(gte(budget_items.amount, filters.minAmount))
      }

      if (filters?.maxAmount) {
        conditions.push(lte(budget_items.amount, filters.maxAmount))
      }

      if (filters?.searchQuery) {
        const searchTerm = `%${filters.searchQuery}%`
        conditions.push(
          or(
            like(budget_items.name, searchTerm),
            like(budget_items.description, searchTerm),
            like(budget_items.vendor, searchTerm)
          )
        )
      }

      // Build order by
      const orderByField = budget_items[sort.field]
      const orderFn = sort.order === 'asc' ? asc : desc

      const query = db.query.budget_items

      // If filtering by eventId, we need to join with budget_categories
      if (filters?.eventId) {
        const items = await db.query.budget_categories.findMany({
          where: eq(budget_categories.eventId, filters.eventId),
          with: {
            items: {
              where: conditions.length > 0 ? and(...conditions) : undefined,
              orderBy: orderFn(orderByField),
            },
          },
        })

        // Flatten the items from all categories
        return items.flatMap((category) => category.items)
      } else {
        // Regular query without eventId filter
        const allItems = await query.findMany({
          where: conditions.length > 0 ? and(...conditions) : undefined,
          orderBy: orderFn(orderByField),
          with: {
            category: {
              with: {
                event: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        })

        return allItems
      }
    } catch (error) {
      console.error('Error fetching all budget items:', error)
      throw new Error('Failed to fetch budget items')
    }
  }
)

/**
 * Get budget items for a specific category
 *
 * CACHE: Uses React cache()
 * USE CASE: Category detail page, budget management
 *
 * @param categoryId - Budget Category ID
 * @param status - Optional status filter
 * @returns Array of budget items for the specified category
 *
 * @example
 * const categoryItems = await getBudgetItemsByCategoryId('cat_123');
 */
export const getBudgetItemsByCategoryId = cache(
  async (categoryId: string, status?: BudgetItemStatus | BudgetItemStatus[]) => {
    try {
      const conditions = [eq(budget_items.categoryId, categoryId)]

      if (status) {
        if (Array.isArray(status)) {
          conditions.push(or(...status.map((s) => eq(budget_items.status, s))))
        } else {
          conditions.push(eq(budget_items.status, status))
        }
      }

      const categoryItems = await db.query.budget_items.findMany({
        where: and(...conditions),
        orderBy: asc(budget_items.name),
      })

      return categoryItems
    } catch (error) {
      console.error('Error fetching budget items by category ID:', error)
      throw new Error('Failed to fetch category budget items')
    }
  }
)

/**
 * Get budget statistics for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Event dashboard, financial reporting
 *
 * @param eventId - Event ID
 * @returns Object with budget statistics
 *
 * @example
 * const stats = await getBudgetStatsByEventId('evt_123');
 * console.log(`Total budget: ${stats.totalBudget}, Total spent: ${stats.totalSpent}`);
 */
export const getBudgetStatsByEventId = cache(async (eventId: string) => {
  try {
    // Get all categories for the event
    const categories = await db.query.budget_categories.findMany({
      where: eq(budget_categories.eventId, eventId),
      with: {
        items: true,
      },
    })

    // Calculate statistics
    const stats = {
      // Category stats
      totalCategories: categories.length,
      totalBudget: categories.reduce((sum, cat) => sum + (cat.budgetAllocated || 0), 0),

      // Item stats
      totalItems: categories.reduce((sum, cat) => sum + cat.items.length, 0),
      plannedItems: 0,
      approvedItems: 0,
      pendingItems: 0,
      paidItems: 0,
      cancelledItems: 0,

      // Financial stats
      totalPlanned: 0,
      totalApproved: 0,
      totalPending: 0,
      totalPaid: 0,
      totalCancelled: 0,
    }

    // Process all items
    const allItems = categories.flatMap((cat) => cat.items)

    // Count items by status
    stats.plannedItems = allItems.filter((item) => item.status === 'planned').length
    stats.approvedItems = allItems.filter((item) => item.status === 'approved').length
    stats.pendingItems = allItems.filter((item) => item.status === 'pending').length
    stats.paidItems = allItems.filter((item) => item.status === 'paid').length
    stats.cancelledItems = allItems.filter((item) => item.status === 'cancelled').length

    // Sum amounts by status
    stats.totalPlanned = allItems
      .filter((item) => item.status === 'planned')
      .reduce((sum, item) => sum + (item.amount || 0), 0)

    stats.totalApproved = allItems
      .filter((item) => item.status === 'approved')
      .reduce((sum, item) => sum + (item.amount || 0), 0)

    stats.totalPending = allItems
      .filter((item) => item.status === 'pending')
      .reduce((sum, item) => sum + (item.amount || 0), 0)

    stats.totalPaid = allItems
      .filter((item) => item.status === 'paid')
      .reduce((sum, item) => sum + (item.amount || 0), 0)

    stats.totalCancelled = allItems
      .filter((item) => item.status === 'cancelled')
      .reduce((sum, item) => sum + (item.amount || 0), 0)

    // Calculate additional metrics
    stats.totalCommitted = stats.totalApproved + stats.totalPending + stats.totalPaid
    stats.totalSpent = stats.totalPaid
    stats.budgetUtilization =
      stats.totalBudget > 0 ? Math.round((stats.totalCommitted / stats.totalBudget) * 100) : 0
    stats.budgetRemaining = Math.max(0, stats.totalBudget - stats.totalCommitted)

    return stats
  } catch (error) {
    console.error('Error fetching budget stats:', error)
    throw new Error('Failed to fetch budget statistics')
  }
})

/**
 * Check if budget item exists
 *
 * CACHE: Uses React cache()
 * USE CASE: Validation, duplicate checking
 *
 * @param id - Budget Item ID to check
 * @returns Boolean indicating if budget item exists
 *
 * @example
 * const exists = await budgetItemExists('item_123');
 * if (!exists) throw new Error('Budget item not found');
 */
export const budgetItemExists = cache(async (id: string): Promise<boolean> => {
  try {
    const item = await db.query.budget_items.findFirst({
      where: eq(budget_items.id, id),
      columns: { id: true }, // Only fetch ID for efficiency
    })

    return !!item
  } catch (error) {
    console.error('Error checking budget item existence:', error)
    return false
  }
})

/**
 * Get upcoming payments for an event
 *
 * CACHE: Uses React cache()
 * USE CASE: Financial planning, cash flow management
 *
 * @param eventId - Event ID
 * @param days - Number of days to look ahead
 * @returns Array of upcoming budget items with payments due
 *
 * @example
 * const upcomingPayments = await getUpcomingPayments('evt_123', 30);
 */
export const getUpcomingPayments = cache(async (eventId: string, days: number = 30) => {
  try {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    // Get all categories for the event
    const categories = await db.query.budget_categories.findMany({
      where: eq(budget_categories.eventId, eventId),
      columns: { id: true },
    })

    const categoryIds = categories.map((cat) => cat.id)

    if (categoryIds.length === 0) {
      return []
    }

    // Get upcoming payments
    const upcomingPayments = await db.query.budget_items.findMany({
      where: and(
        or(...categoryIds.map((id) => eq(budget_items.categoryId, id))),
        or(eq(budget_items.status, 'approved'), eq(budget_items.status, 'pending')),
        gte(budget_items.dueDate, now),
        lte(budget_items.dueDate, futureDate)
      ),
      orderBy: asc(budget_items.dueDate),
      with: {
        category: true,
      },
    })

    return upcomingPayments
  } catch (error) {
    console.error('Error fetching upcoming payments:', error)
    throw new Error('Failed to fetch upcoming payments')
  }
})
