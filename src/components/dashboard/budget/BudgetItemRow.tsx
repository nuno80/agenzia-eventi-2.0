/**
 * FILE: src/components/dashboard/budget/BudgetItemRow.tsx
 *
 * COMPONENT: BudgetItemRow
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Handles delete confirmation
 * - Status change dropdown
 * - Interactive buttons
 *
 * FEATURES:
 * - Display budget item details in table row
 * - Status badge with color coding
 * - Quick delete action
 * - Status change (planned → approved → invoiced → paid)
 */

'use client'

import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { deleteBudgetItem, updateBudgetItemStatus } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

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
}

interface BudgetItemRowProps {
  item: BudgetItem
}

export function BudgetItemRow({ item }: BudgetItemRowProps) {
  const [isPending, startTransition] = useTransition()

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const badges = {
      planned: { label: 'Pianificata', color: 'bg-gray-100 text-gray-700' },
      approved: { label: 'Approvata', color: 'bg-blue-100 text-blue-700' },
      invoiced: { label: 'Fatturata', color: 'bg-yellow-100 text-yellow-700' },
      paid: { label: 'Pagata', color: 'bg-green-100 text-green-700' },
    }
    return badges[status as keyof typeof badges] || badges.planned
  }

  const badge = getStatusBadge(item.status)

  // Handle delete
  const handleDelete = () => {
    if (!confirm(`Sei sicuro di voler eliminare questa voce: "${item.description}"?`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteBudgetItem(item.id)
      if (result.success) {
        toast({
          title: 'Voce eliminata',
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

  // Handle status change
  const handleStatusChange = (newStatus: 'planned' | 'approved' | 'paid' | 'invoiced') => {
    startTransition(async () => {
      // If changing to 'paid', prompt for actual cost if not set
      let actualCost = item.actualCost
      if (newStatus === 'paid' && !actualCost) {
        const input = prompt('Inserisci il costo effettivo:', item.estimatedCost.toString())
        if (!input) return
        actualCost = parseFloat(input)
        if (Number.isNaN(actualCost)) {
          toast({
            title: 'Errore',
            description: 'Costo non valido',
            variant: 'destructive',
          })
          return
        }
      }

      const result = await updateBudgetItemStatus(item.id, {
        status: newStatus,
        paymentDate: newStatus === 'paid' ? new Date() : undefined,
        actualCost: newStatus === 'paid' ? actualCost : undefined,
      })

      if (result.success) {
        toast({
          title: 'Stato aggiornato',
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
    <tr className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
      <td className="px-3 py-3 text-sm text-gray-900">
        <div className="font-medium">{item.description}</div>
        {item.notes && <div className="text-xs text-gray-600 mt-1">{item.notes}</div>}
      </td>
      <td className="px-3 py-3 text-sm text-gray-700">{item.vendor || '-'}</td>
      <td className="px-3 py-3 text-sm text-gray-900 text-right font-medium">
        <span suppressHydrationWarning>{formatCurrency(item.estimatedCost)}</span>
      </td>
      <td className="px-3 py-3 text-sm text-gray-900 text-right font-medium">
        <span suppressHydrationWarning>
          {item.actualCost ? formatCurrency(item.actualCost) : '-'}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <select
          value={item.status}
          onChange={(e) =>
            handleStatusChange(e.target.value as 'planned' | 'approved' | 'paid' | 'invoiced')
          }
          disabled={isPending}
          className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color} border-0 cursor-pointer`}
        >
          <option value="planned">Pianificata</option>
          <option value="approved">Approvata</option>
          <option value="invoiced">Fatturata</option>
          <option value="paid">Pagata</option>
        </select>
      </td>
      <td className="px-3 py-3 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          title="Elimina voce"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </td>
    </tr>
  )
}
