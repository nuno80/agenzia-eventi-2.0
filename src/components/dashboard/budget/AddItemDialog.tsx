/**
 * FILE: src/components/dashboard/budget/AddItemDialog.tsx
 *
 * COMPONENT: AddItemDialog
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Form state management
 * - Dialog open/close state
 * - Form submission with loading state
 *
 * FEATURES:
 * - Modal dialog for creating budget item
 * - Form with validation
 * - Status selector
 * - Loading state during submission
 */

'use client'

import { X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { createBudgetItem } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

interface AddItemDialogProps {
  categoryId: string
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export function AddItemDialog({ categoryId, eventId, isOpen, onClose }: AddItemDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    description: '',
    estimatedCost: '',
    actualCost: '',
    vendor: '',
    status: 'planned' as 'planned' | 'approved' | 'paid' | 'invoiced',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await createBudgetItem(categoryId, eventId, {
        description: formData.description,
        estimatedCost: parseFloat(formData.estimatedCost),
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
        vendor: formData.vendor || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
      })

      if (result.success) {
        toast({
          title: 'Voce creata',
          description: result.message,
        })
        // Reset form
        setFormData({
          description: '',
          estimatedCost: '',
          actualCost: '',
          vendor: '',
          status: 'planned',
          notes: '',
        })
        onClose()
      } else {
        toast({
          title: 'Errore',
          description: result.message,
          variant: 'destructive',
        })
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Nuova Voce di Budget</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Description */}
          <div>
            <Label htmlFor="description">Descrizione *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="es. Affitto sala conferenze, Stampa materiali"
              required
              disabled={isPending}
            />
          </div>

          {/* Vendor */}
          <div>
            <Label htmlFor="vendor">Fornitore</Label>
            <Input
              id="vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              placeholder="Nome del fornitore"
              disabled={isPending}
            />
          </div>

          {/* Estimated Cost */}
          <div>
            <Label htmlFor="estimatedCost">Costo Stimato (€) *</Label>
            <Input
              id="estimatedCost"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              placeholder="0.00"
              required
              disabled={isPending}
            />
          </div>

          {/* Actual Cost */}
          <div>
            <Label htmlFor="actualCost">Costo Effettivo (€)</Label>
            <Input
              id="actualCost"
              type="number"
              step="0.01"
              min="0"
              value={formData.actualCost}
              onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
              placeholder="Lascia vuoto se non ancora pagato"
              disabled={isPending}
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Stato</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'planned' | 'approved' | 'paid' | 'invoiced',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
            >
              <option value="planned">Pianificata</option>
              <option value="approved">Approvata</option>
              <option value="invoiced">Fatturata</option>
              <option value="paid">Pagata</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive"
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? 'Creazione...' : 'Crea Voce'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
