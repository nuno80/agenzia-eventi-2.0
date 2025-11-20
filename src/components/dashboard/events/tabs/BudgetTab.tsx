/**
 * FILE: src/components/dashboard/events/tabs/BudgetTab.tsx
 *
 * COMPONENT: BudgetTab
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Fetches budget data from database
 * - No interactivity at this level
 * - Passes data to client component
 *
 * FEATURES:
 * - Fetches budget categories with items
 * - Fetches budget summary statistics
 * - Handles not found case
 * - Passes data to BudgetTabClient for interactivity
 */

import { notFound } from 'next/navigation'
import { getBudgetCategoriesByEvent, getBudgetSummary } from '@/lib/dal/budget'
import { getEventById } from '@/lib/dal/events'
import { BudgetTabClient } from './BudgetTabClient'

interface BudgetTabProps {
  eventId: string
}

export async function BudgetTab({ eventId }: BudgetTabProps) {
  // Fetch event to verify it exists
  const event = await getEventById(eventId)
  if (!event) {
    notFound()
  }

  // Fetch budget data in parallel
  const [budgetData, summary] = await Promise.all([
    getBudgetCategoriesByEvent(eventId),
    getBudgetSummary(eventId),
  ])

  return <BudgetTabClient event={event} budgetData={budgetData} summary={summary} />
}
