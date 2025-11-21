/**
 * FILE: src/components/dashboard/events/tabs/BudgetTabClient.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: BudgetTabClient
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages dialog state (add category/item modals)
 * - Handles form submissions with loading states
 * - Interactive charts and accordions
 * - Optimistic UI updates
 *
 * FEATURES:
 * - Budget summary cards with stats
 * - Budget breakdown pie chart
 * - Categories list with expandable items
 * - Add/Edit/Delete category and item dialogs
 * - Status badges and quick actions
 *
 * USAGE:
 * <BudgetTabClient event={event} budgetData={categories} summary={summary} />
 */

'use client'

import { DollarSign, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { AddCategoryDialog } from '@/components/dashboard/budget/AddCategoryDialog'
import { BudgetCategoryCard } from '@/components/dashboard/budget/BudgetCategoryCard'
import { BudgetChart } from '@/components/dashboard/budget/BudgetChart'
import { Button } from '@/components/ui/button'
import type { Event } from '@/db'
import { formatCurrency } from '@/lib/utils'

interface BudgetCategory {
  id: string
  name: string
  description: string | null
  allocatedAmount: number
  spentAmount: number
  color: string
  icon: string | null
  createdAt: Date
  updatedAt: Date
  items: BudgetItem[]
}

interface BudgetItem {
  id: string
  description: string
  estimatedCost: number
  actualCost: number | null
  status: 'planned' | 'approved' | 'paid' | 'invoiced'
  vendor: string | null
  invoiceNumber: string | null
  invoiceUrl: string | null
  paymentDate: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface BudgetSummary {
  totalAllocated: number
  totalSpent: number
  remaining: number
  percentageUsed: number
  categoriesCount: number
  itemsCount: number
  categoryBreakdown: Array<{
    id: string
    name: string
    color: string
    allocatedAmount: number
    spentAmount: number
    remaining: number
    percentageUsed: number
    itemsCount: number
  }>
  statusCounts: {
    planned: number
    approved: number
    invoiced: number
    paid: number
  }
}

interface BudgetTabClientProps {
  event: Event
  budgetData: BudgetCategory[]
  summary: BudgetSummary
}

export function BudgetTabClient({ event, budgetData, summary }: BudgetTabClientProps) {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)

  // Calculate if over budget
  const isOverBudget = summary.remaining < 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                <span suppressHydrationWarning>{formatCurrency(summary.totalAllocated)}</span>
              </div>
              <div className="text-sm text-gray-600">Budget Allocato</div>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-50' : 'bg-green-50'}`}>
              <TrendingDown
                className={`w-5 h-5 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}
              />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                <span suppressHydrationWarning>{formatCurrency(summary.totalSpent)}</span>
              </div>
              <div className="text-sm text-gray-600">Speso</div>
            </div>
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-50' : 'bg-purple-50'}`}>
              <TrendingUp
                className={`w-5 h-5 ${isOverBudget ? 'text-red-600' : 'text-purple-600'}`}
              />
            </div>
            <div>
              <div
                className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}
              >
                <span suppressHydrationWarning>{formatCurrency(summary.remaining)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {isOverBudget ? 'Sforamento' : 'Rimanente'}
              </div>
            </div>
          </div>
        </div>

        {/* Percentage Used */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">
                {summary.percentageUsed.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mb-2">Utilizzo Budget</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    summary.percentageUsed > 100
                      ? 'bg-red-600'
                      : summary.percentageUsed > 80
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(summary.percentageUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Stats */}
      {budgetData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Breakdown Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ripartizione Budget</h3>
            <BudgetChart categoryBreakdown={summary.categoryBreakdown} />
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stato Voci</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-sm text-gray-700">Pianificate</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {summary.statusCounts.planned}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-700">Approvate</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {summary.statusCounts.approved}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm text-gray-700">Fatturate</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {summary.statusCounts.invoiced}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-700">Pagate</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {summary.statusCounts.paid}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Categorie Budget</h3>
          <Button
            onClick={() => setIsAddCategoryOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Categoria
          </Button>
        </div>

        {budgetData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessuna categoria</h3>
            <p className="text-sm text-gray-600 mb-4">
              Inizia creando una categoria di budget per organizzare le spese dell'evento.
            </p>
            <Button
              onClick={() => setIsAddCategoryOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crea Prima Categoria
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetData.map((category) => (
              <BudgetCategoryCard key={category.id} category={category} eventId={event.id} />
            ))}
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <AddCategoryDialog
        eventId={event.id}
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
      />
    </div>
  )
}
