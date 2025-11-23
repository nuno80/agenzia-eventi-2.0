/**
 * FILE: src/components/ui/ExportButton.tsx
 * TYPE: Client Component
 * WHY: Reusable export button with Excel/PDF dropdown
 *
 * FEATURES:
 * - Dropdown menu for Excel/PDF selection
 * - Loading state during export
 * - Error handling with toast
 * - Auto-download on completion
 */

'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from './button'

interface ExportButtonProps {
  onExportExcel: () => Promise<void>
  onExportPDF: () => Promise<void>
  label?: string
  disabled?: boolean
}

export function ExportButton({
  onExportExcel,
  onExportPDF,
  label = 'Esporta',
  disabled,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async (type: 'excel' | 'pdf') => {
    setIsLoading(true)
    setIsOpen(false)

    try {
      if (type === 'excel') {
        await onExportExcel()
        toast.success('File Excel scaricato con successo')
      } else {
        await onExportPDF()
        toast.success('File PDF scaricato con successo')
      }
    } catch (error) {
      toast.error("Errore durante l'esportazione")
      console.error('Export failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {isLoading ? 'Esportazione...' : label}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-10 bg-transparent border-0 p-0 cursor-default"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            aria-label="Close menu"
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                type="button"
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <span className="text-lg">📊</span>
                Esporta Excel
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <span className="text-lg">📄</span>
                Esporta PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
