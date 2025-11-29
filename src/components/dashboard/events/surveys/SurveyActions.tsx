/**
 * FILE: src/components/dashboard/events/surveys/SurveyActions.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: SurveyActions
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Handles dropdown menu state
 * - Executes server actions
 * - Shows confirmation dialogs
 * - Manages loading states
 *
 * PROPS:
 * - survey: Survey - Survey data
 * - eventId: string - Event ID for navigation
 *
 * FEATURES:
 * - Dropdown menu with actions
 * - Publish/Close/Reopen survey
 * - Duplicate survey
 * - Delete survey (with confirmation)
 * - Toast notifications
 *
 * USAGE:
 * <SurveyActions survey={survey} eventId={eventId} />
 */

'use client'

import { Copy, MoreVertical, Play, RefreshCw, Square, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  closeSurvey,
  deleteSurvey,
  duplicateSurvey,
  publishSurvey,
  reopenSurvey,
} from '@/app/actions/surveys'
import type { Survey } from '@/db'

interface SurveyActionsProps {
  survey: Survey
}

export function SurveyActions({ survey }: SurveyActionsProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePublish = async () => {
    setIsLoading(true)
    const result = await publishSurvey(survey.id)
    setIsLoading(false)
    setIsOpen(false)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleClose = async () => {
    setIsLoading(true)
    const result = await closeSurvey(survey.id)
    setIsLoading(false)
    setIsOpen(false)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleReopen = async () => {
    setIsLoading(true)
    const result = await reopenSurvey(survey.id)
    setIsLoading(false)
    setIsOpen(false)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleDuplicate = async () => {
    setIsLoading(true)
    const result = await duplicateSurvey(survey.id)
    setIsLoading(false)
    setIsOpen(false)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleDelete = async () => {
    if (
      !confirm('Sei sicuro di voler eliminare questo sondaggio? Questa azione è irreversibile.')
    ) {
      return
    }

    setIsLoading(true)
    const result = await deleteSurvey(survey.id)
    setIsLoading(false)
    setIsOpen(false)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Azioni sondaggio"
        disabled={isLoading}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {/* Status Actions */}
            {survey.status === 'draft' && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Pubblica
              </button>
            )}

            {survey.status === 'active' && (
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <Square className="w-4 h-4" />
                Chiudi
              </button>
            )}

            {survey.status === 'closed' && (
              <button
                type="button"
                onClick={handleReopen}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Riapri
              </button>
            )}

            {/* Duplicate */}
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              Duplica
            </button>

            {/* Delete */}
            <div className="border-t border-gray-200 my-1" />
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Elimina
            </button>
          </div>
        </>
      )}
    </div>
  )
}
