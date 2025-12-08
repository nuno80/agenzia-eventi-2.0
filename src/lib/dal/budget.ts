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

// ============================================================================
// GLOBAL STATS (Cross-Event)
// ============================================================================

/**
 * Get global budget statistics across all events
 * Returns aggregated financial metrics for the entire organization
 */
// ============================================================================
// REPORT DATA (Filtered Cross-Event Reports)
// ============================================================================

export type BudgetReportFilters = {
  startDate?: Date
  endDate?: Date
  eventIds?: string[]
}

export type BudgetReportData = {
  filters: {
    startDate: Date | null
    endDate: Date | null
    eventIds: string[]
  }
  summary: {
    totalRevenue: number
    totalCosts: number
    netProfit: number
    profitMargin: number
    totalItems: number
    totalEvents: number
  }
  categoryBreakdown: {
    categoryName: string
    totalAmount: number
    itemCount: number
    isRevenue: boolean
  }[]
  eventBreakdown: {
    eventId: string
    eventTitle: string
    eventDate: Date
    eventStatus: string
    revenue: number
    costs: number
    netProfit: number
    itemsCount: number
  }[]
  items: {
    id: string
    name: string
    categoryName: string
    eventTitle: string
    estimatedCost: number
    actualCost: number
    status: string
    isRevenue: boolean
  }[]
}

/**
 * Get budget report data with optional filters
 * @param filters - Optional date range and event IDs
 * Returns aggregated data for financial reports
 */
export const getBudgetReportData = cache(
  async (filters?: BudgetReportFilters): Promise<BudgetReportData> => {
    // Get all budget categories and items
    const allCategories = await db.query.budgetCategories.findMany({
      with: {
        items: true,
        event: {
          columns: {
            id: true,
            title: true,
            status: true,
            startDate: true,
          },
        },
      },
    })

    // Apply filters
    let filteredCategories = allCategories

    // Filter by event IDs if specified
    if (filters?.eventIds && filters.eventIds.length > 0) {
      filteredCategories = filteredCategories.filter((cat) =>
        filters.eventIds!.includes(cat.eventId)
      )
    }

    // Filter by date range if specified
    if (filters?.startDate || filters?.endDate) {
      filteredCategories = filteredCategories.filter((cat) => {
        const eventDate = new Date(cat.event.startDate)
        if (filters.startDate && eventDate < filters.startDate) return false
        if (filters.endDate && eventDate > filters.endDate) return false
        return true
      })
    }

    // Helper to check if category is revenue
    const isIncomeCategory = (catName: string) =>
      catName.toLowerCase().includes('entrat') ||
      catName.toLowerCase().includes('ricav') ||
      catName.toLowerCase().includes('income') ||
      catName.toLowerCase().includes('revenue')

    // Calculate totals
    let totalRevenue = 0
    let totalCosts = 0
    const allItems: BudgetReportData['items'] = []
    const categoryMap = new Map<
      string,
      { totalAmount: number; itemCount: number; isRevenue: boolean }
    >()
    const eventMap = new Map<
      string,
      {
        eventId: string
        eventTitle: string
        eventDate: Date
        eventStatus: string
        revenue: number
        costs: number
        itemsCount: number
      }
    >()

    filteredCategories.forEach((cat) => {
      const isRevenue = isIncomeCategory(cat.name)

      // Category aggregation
      if (!categoryMap.has(cat.name)) {
        categoryMap.set(cat.name, { totalAmount: 0, itemCount: 0, isRevenue })
      }
      const catStats = categoryMap.get(cat.name)!

      // Event aggregation
      if (!eventMap.has(cat.eventId)) {
        eventMap.set(cat.eventId, {
          eventId: cat.eventId,
          eventTitle: cat.event.title,
          eventDate: cat.event.startDate,
          eventStatus: cat.event.status,
          revenue: 0,
          costs: 0,
          itemsCount: 0,
        })
      }
      const eventStats = eventMap.get(cat.eventId)!

      cat.items.forEach((item) => {
        const amount = item.actualCost || item.estimatedCost || 0

        if (isRevenue) {
          totalRevenue += amount
          eventStats.revenue += amount
        } else {
          totalCosts += amount
          eventStats.costs += amount
        }

        catStats.totalAmount += amount
        catStats.itemCount += 1
        eventStats.itemsCount += 1

        allItems.push({
          id: item.id,
          name: item.description,
          categoryName: cat.name,
          eventTitle: cat.event.title,
          estimatedCost: item.estimatedCost || 0,
          actualCost: item.actualCost || 0,
          status: item.status,
          isRevenue,
        })
      })
    })

    const netProfit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Build category breakdown
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([categoryName, stats]) => ({
      categoryName,
      ...stats,
    }))

    // Build event breakdown with net profit
    const eventBreakdown = Array.from(eventMap.values())
      .map((e) => ({
        ...e,
        netProfit: e.revenue - e.costs,
      }))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())

    return {
      filters: {
        startDate: filters?.startDate || null,
        endDate: filters?.endDate || null,
        eventIds: filters?.eventIds || [],
      },
      summary: {
        totalRevenue,
        totalCosts,
        netProfit,
        profitMargin,
        totalItems: allItems.length,
        totalEvents: eventMap.size,
      },
      categoryBreakdown,
      eventBreakdown,
      items: allItems,
    }
  }
)

export const getGlobalBudgetStats = cache(async () => {
  // Get all budget categories and items
  const allCategories = await db.query.budgetCategories.findMany({
    with: {
      items: true,
      event: {
        columns: {
          id: true,
          title: true,
          status: true,
          startDate: true,
        },
      },
    },
  })

  // Calculate global totals
  const totalAllocated = allCategories.reduce((sum, cat) => sum + (cat.allocatedAmount || 0), 0)
  const totalSpent = allCategories.reduce((sum, cat) => sum + (cat.spentAmount || 0), 0)

  // Get all items for detailed stats
  const allItems = allCategories.flatMap((cat) => cat.items)
  const totalEstimated = allItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
  const totalActual = allItems.reduce((sum, item) => sum + (item.actualCost || 0), 0)

  // Calculate revenue and costs
  // Revenue comes from categories named "Entrate" or similar
  let revenue = 0
  let costs = 0

  allCategories.forEach((cat) => {
    const isIncomeCategory =
      cat.name
        .toLowerCase()
        .includes('entrat') || // Entrate, Entrata
      cat.name.toLowerCase().includes('ricav') || // Ricavi
      cat.name.toLowerCase().includes('income') ||
      cat.name.toLowerCase().includes('revenue')

    cat.items.forEach((item) => {
      const amount = item.actualCost || item.estimatedCost || 0

      if (isIncomeCategory) {
        revenue += amount
      } else {
        costs += amount
      }
    })
  })

  const netProfit = revenue - costs
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  // Status breakdown
  const statusCounts = {
    planned: allItems.filter((item) => item.status === 'planned').length,
    approved: allItems.filter((item) => item.status === 'approved').length,
    invoiced: allItems.filter((item) => item.status === 'invoiced').length,
    paid: allItems.filter((item) => item.status === 'paid').length,
  }

  // Per-event breakdown
  const eventBreakdown = allCategories.reduce(
    (acc, cat) => {
      const eventId = cat.eventId
      if (!acc[eventId]) {
        acc[eventId] = {
          eventId,
          eventTitle: cat.event.title,
          eventStatus: cat.event.status,
          eventDate: cat.event.startDate,
          allocated: 0,
          spent: 0,
          revenue: 0,
          costs: 0,
          itemsCount: 0,
        }
      }

      acc[eventId].allocated += cat.allocatedAmount || 0
      acc[eventId].spent += cat.spentAmount || 0
      acc[eventId].itemsCount += cat.items.length

      // Determine if this is an income category
      const isIncomeCategory =
        cat.name.toLowerCase().includes('entrat') ||
        cat.name.toLowerCase().includes('ricav') ||
        cat.name.toLowerCase().includes('income') ||
        cat.name.toLowerCase().includes('revenue')

      // Calculate revenue and costs for this event
      cat.items.forEach((item) => {
        const amount = item.actualCost || item.estimatedCost || 0

        if (isIncomeCategory) {
          acc[eventId].revenue += amount
        } else {
          acc[eventId].costs += amount
        }
      })

      return acc
    },
    {} as Record<
      string,
      {
        eventId: string
        eventTitle: string
        eventStatus: string
        eventDate: Date
        allocated: number
        spent: number
        revenue: number
        costs: number
        itemsCount: number
      }
    >
  )

  return {
    totalAllocated,
    totalSpent,
    totalEstimated,
    totalActual,
    revenue,
    costs,
    netProfit,
    profitMargin,
    remaining: totalAllocated - totalSpent,
    percentageUsed: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
    categoriesCount: allCategories.length,
    itemsCount: allItems.length,
    statusCounts,
    eventBreakdown: Object.values(eventBreakdown).sort(
      (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    ),
  }
})
