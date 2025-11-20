/**
 * FILE: src/components/dashboard/budget/AddCategoryDialog.tsx
 *
 * COMPONENT: AddCategoryDialog
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Form state management
 * - Dialog open/close state
 * - Form submission with loading state
 *
 * FEATURES:
 * - Modal dialog for creating budget category
 * - Form with validation
 * - Color picker
 * - Loading state during submission
 */

'use client'

import { X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { createBudgetCategory } from '@/app/actions/budget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

interface AddCategoryDialogProps {
  eventId: string
  isOpen: boolean
  onClose: () => void
}

// Predefined color options
const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
]

export function AddCategoryDialog({ eventId, isOpen, onClose }: AddCategoryDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    allocatedAmount: '',
    color: '#3B82F6',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await createBudgetCategory(eventId, {
        name: formData.name,
        description: formData.description || undefined,
        allocatedAmount: parseFloat(formData.allocatedAmount) || 0,
        color: formData.color,
      })

      if (result.success) {
        toast({
          title: 'Categoria creata',
          description: result.message,
        })
        // Reset form
        setFormData({
          name: '',
          description: '',
          allocatedAmount: '',
          color: '#3B82F6',
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nuova Categoria Budget</h2>
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
          {/* Name */}
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="es. Catering, Marketing, Logistica"
              required
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrizione opzionale della categoria"
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Allocated Amount */}
          <div>
            <Label htmlFor="allocatedAmount">Budget Allocato (€) *</Label>
            <Input
              id="allocatedAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.allocatedAmount}
              onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
              placeholder="0.00"
              required
              disabled={isPending}
            />
          </div>

          {/* Color Picker */}
          <div>
            <Label>Colore</Label>
            <div className="flex items-center space-x-2 mt-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isPending}
                  title={color}
                />
              ))}
              {/* Custom color input */}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
                disabled={isPending}
                title="Colore personalizzato"
              />
            </div>
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
              {isPending ? 'Creazione...' : 'Crea Categoria'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
