/**
 * FILE: src/components/dashboard/budget/BudgetCategoryCard.tsx
 *
 * COMPONENT: BudgetCategoryCard
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages expand/collapse state
 * - Handles delete confirmation
 * - Interactive buttons and dialogs
 *
 * FEATURES:
 * - Expandable card showing category details
 * - Progress bar for allocated vs spent
 * - List of budget items when expanded
 * - Add item, edit, delete actions
 */

'use client'

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { deleteBudgetCategory } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { AddItemDialog } from './AddItemDialog'
import { BudgetItemRow } from './BudgetItemRow'

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

interface BudgetCategory {
  id: string
  name: string
  description: string | null
  allocatedAmount: number
  spentAmount: number
  color: string
  icon: string | null
  items: BudgetItem[]
}

interface BudgetCategoryCardProps {
  category: BudgetCategory
  eventId: string
}

export function BudgetCategoryCard({ category, eventId }: BudgetCategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Calculate percentage
  const percentage =
    category.allocatedAmount > 0 ? (category.spentAmount / category.allocatedAmount) * 100 : 0

  const remaining = category.allocatedAmount - category.spentAmount
  const isOverBudget = remaining < 0

  // Handle delete
  const handleDelete = () => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare la categoria "${category.name}"? Verranno eliminate anche tutte le voci associate.`
      )
    ) {
      return
    }

    startTransition(async () => {
      const result = await deleteBudgetCategory(category.id)
      if (result.success) {
        toast({
          title: 'Categoria eliminata',
          description: result.message,
        })
      } else {
        toast({
          title: 'Errore',
          description: result.message,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Category Header */}
      <div className="bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Color indicator */}
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />

            {/* Category info */}
            <div className="flex-1">
              <h4 className="text-base font-semibold text-gray-900">{category.name}</h4>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>

            {/* Amounts */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(category.spentAmount)} / {formatCurrency(category.allocatedAmount)}
              </div>
              <div className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                {isOverBudget ? 'Sforamento: ' : 'Rimanente: '}
                {formatCurrency(Math.abs(remaining))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddItemOpen(true)}
                title="Aggiungi voce"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                title="Elimina categoria"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Comprimi' : 'Espandi'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-600' : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-600">{percentage.toFixed(1)}% utilizzato</span>
            <span className="text-xs text-gray-600">{category.items.length} voci</span>
          </div>
        </div>
      </div>

      {/* Items List (when expanded) */}
      {isExpanded && (
        <div className="p-4">
          {category.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-3">Nessuna voce in questa categoria</p>
              <Button
                onClick={() => setIsAddItemOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Prima Voce
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                      Descrizione
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                      Fornitore
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">
                      Stimato
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700">
                      Effettivo
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">
                      Stato
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {category.items.map((item) => (
                    <BudgetItemRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Item Dialog */}
      <AddItemDialog
        categoryId={category.id}
        eventId={eventId}
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
      />
    </div>
  )
}
