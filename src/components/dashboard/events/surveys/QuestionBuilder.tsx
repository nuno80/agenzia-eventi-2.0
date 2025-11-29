/**
 * FILE: src/components/dashboard/events/surveys/QuestionBuilder.tsx
 *
 * VERSION: 1.1
 *
 * COMPONENT: QuestionBuilder
 * TYPE: Client Component
 *
 * PROPS:
 * - index: number - Index of the question in the array
 * - onRemove: () => void - Callback to remove the question
 *
 * FEATURES:
 * - Question text and description inputs
 * - Question type selector
 * - Dynamic options editor for choice questions
 * - Required toggle
 * - Type-specific validation hints
 */

'use client'

import { GripVertical, Plus, Trash2, X } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import type { SurveyInput } from '@/lib/validations/surveys'

interface QuestionBuilderProps {
  index: number
  onRemove: () => void
}

export function QuestionBuilder({ index, onRemove }: QuestionBuilderProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<SurveyInput>()

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative group">
      {/* Drag Handle & Remove */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          className="cursor-move text-gray-400 hover:text-gray-600 p-1"
          title="Sposta domanda"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
          title="Rimuovi domanda"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 pr-12">
        {/* Header: Question & Type */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Domanda <span className="text-red-500">*</span>
            </label>
            <input
              {...register(`questions.${index}.question`)}
              type="text"
              placeholder="Es. Qual è il tuo livello di soddisfazione?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {errors.questions?.[index]?.question && (
              <p className="text-sm text-red-500">{errors.questions[index]?.question?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              {...register(`questions.${index}.type`)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="multiple_choice">Scelta Multipla</option>
              <option value="checkboxes">Caselle di Controllo</option>
              <option value="text">Testo Breve</option>
              <option value="textarea">Testo Lungo</option>
              <option value="rating">Valutazione (1-5)</option>
              <option value="scale">Scala (1-10)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Descrizione (opzionale)</label>
          <input
            {...register(`questions.${index}.description`)}
            type="text"
            placeholder="Aggiungi dettagli o istruzioni..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>

        {/* Options Editor (Conditional) */}
        <OptionsEditor index={index} />

        {/* Footer: Settings */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register(`questions.${index}.required`)}
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Obbligatoria</span>
          </label>
        </div>
      </div>
    </div>
  )
}

function OptionsEditor({ index }: { index: number }) {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<SurveyInput>()

  const type = useWatch({
    control,
    name: `questions.${index}.type`,
  })

  // Watch options to re-render when they change
  const options = useWatch({
    control,
    name: `questions.${index}.options`,
  })

  // If type is not choice-based, return null
  if (type !== 'multiple_choice' && type !== 'checkboxes') {
    return null
  }

  // Ensure options is an array
  const currentOptions = Array.isArray(options) ? options : []

  // Initialize options if empty when switching to choice type
  if (!options && (type === 'multiple_choice' || type === 'checkboxes')) {
    // We need to use setTimeout to avoid "Cannot update during existing state transition"
    setTimeout(() => {
      setValue(`questions.${index}.options`, ['', ''])
    }, 0)
  }

  const addOption = () => {
    const current = getValues(`questions.${index}.options`) || []
    setValue(`questions.${index}.options`, [...current, ''])
  }

  const removeOption = (optIndex: number) => {
    const current = getValues(`questions.${index}.options`) || []
    setValue(
      `questions.${index}.options`,
      current.filter((_, i) => i !== optIndex)
    )
  }

  return (
    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
      <label className="block text-sm font-medium text-gray-700">Opzioni</label>
      <div className="space-y-2">
        {currentOptions.map((_, optIndex) => (
          <div key={optIndex} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 border-2 border-gray-300 ${type === 'multiple_choice' ? 'rounded-full' : 'rounded'}`}
            />
            <input
              {...register(`questions.${index}.options.${optIndex}`)}
              type="text"
              placeholder={`Opzione ${optIndex + 1}`}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => removeOption(optIndex)}
              disabled={currentOptions.length <= 2}
              className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-30 disabled:hover:text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addOption}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Aggiungi opzione
        </button>
      </div>

      {errors.questions?.[index]?.options && (
        <p className="text-sm text-red-500">{errors.questions[index]?.options?.message}</p>
      )}
    </div>
  )
}
