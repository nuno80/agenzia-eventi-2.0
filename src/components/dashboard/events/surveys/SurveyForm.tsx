/**
 * FILE: src/components/dashboard/events/surveys/SurveyForm.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: SurveyForm
 * TYPE: Client Component
 *
 * PROPS:
 * - eventId: string - Event ID
 * - initialData?: Survey - Existing survey data for edit mode
 *
 * FEATURES:
 * - Complete survey builder interface
 * - Drag & drop question reordering
 * - Form validation with Zod
 * - Server action integration
 * - Auto-save (optional future feature)
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Plus, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createSurvey, updateSurvey } from '@/app/actions/surveys'
import type { Survey } from '@/db'
import { type SurveyInput, surveySchema } from '@/lib/validations/surveys'
import { QuestionBuilder } from './QuestionBuilder'

interface SurveyFormProps {
  eventId: string
  initialData?: Survey & { questions?: any[] }
}

export function SurveyForm({ eventId, initialData }: SurveyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: SurveyInput = {
    title: initialData?.title || '',
    description: initialData?.description || undefined,
    status: (initialData?.status as 'draft' | 'active' | 'closed') || 'draft',
    allowAnonymous: initialData?.allowAnonymous || false,
    allowMultipleResponses: initialData?.allowMultipleResponses || false,
    showResults: initialData?.showResults || false,
    questions: initialData?.questions?.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : undefined,
    })) || [
      {
        question: '',
        type: 'multiple_choice',
        options: ['', ''],
        required: false,
        order: 0,
      },
    ],
  }

  // Initialize form
  const methods = useForm<SurveyInput>({
    resolver: zodResolver(surveySchema),
    defaultValues: defaultValues as any,
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = methods

  // Field array for questions
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  })

  const onSubmit = async (data: SurveyInput) => {
    setIsSubmitting(true)
    try {
      // Ensure order is correct
      const formattedData = {
        ...data,
        questions: data.questions?.map((q, index) => ({
          ...q,
          order: index,
        })),
      }

      const _formData = new FormData()
      // Append all fields manually or use object spread in server action
      // Since our server action accepts Record<string, any>, we can pass the object directly
      // but we need to handle the file uploads if any (none here).
      // Let's pass the object directly to the server action wrapper or just use the object.
      // The server action signature is (eventId, formData | Record).

      let result: { success: boolean; message: string; errors?: Record<string, string[]> }
      if (initialData) {
        result = await updateSurvey(initialData.id, formattedData)
      } else {
        result = await createSurvey(eventId, formattedData)
      }

      if (result.success) {
        toast.success(result.message)
        router.push(`/eventi/${eventId}/sondaggi`)
        router.refresh()
      } else {
        toast.error(result.message)
        if (result.errors) {
          // Handle server-side validation errors
          console.error(result.errors)
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Si è verificato un errore durante il salvataggio')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/eventi/${eventId}/sondaggi`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {initialData ? 'Modifica Sondaggio' : 'Nuovo Sondaggio'}
              </h1>
              <p className="text-sm text-gray-600">
                Configura le domande e le impostazioni del sondaggio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/eventi/${eventId}/sondaggi`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salva
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Questions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Survey Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Titolo Sondaggio <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="Es. Feedback Evento 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descrizione (opzionale)
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Descrivi lo scopo del sondaggio..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Domande</h3>
                <span className="text-sm text-gray-500">{fields.length} domande</span>
              </div>

              {fields.map((field, index) => (
                <QuestionBuilder key={field.id} index={index} onRemove={() => remove(index)} />
              ))}

              <button
                type="button"
                onClick={() =>
                  append({
                    question: '',
                    type: 'multiple_choice',
                    options: ['', ''],
                    required: false,
                    order: fields.length,
                  })
                }
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Aggiungi Domanda
              </button>

              {errors.questions && !Array.isArray(errors.questions) && (
                <p className="text-sm text-red-500 text-center">
                  {(errors.questions as any).message}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar: Settings */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Impostazioni</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      {...register('allowAnonymous')}
                      id="allowAnonymous"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <label htmlFor="allowAnonymous" className="text-sm">
                    <span className="font-medium text-gray-900 block">Risposte Anonime</span>
                    <span className="text-gray-500">
                      Permetti agli utenti di rispondere senza effettuare il login.
                    </span>
                  </label>
                </div>

                <div className="border-t border-gray-100 my-2" />

                <div className="flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      {...register('allowMultipleResponses')}
                      id="allowMultipleResponses"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <label htmlFor="allowMultipleResponses" className="text-sm">
                    <span className="font-medium text-gray-900 block">Risposte Multiple</span>
                    <span className="text-gray-500">
                      Permetti allo stesso utente di inviare più risposte.
                    </span>
                  </label>
                </div>

                <div className="border-t border-gray-100 my-2" />

                <div className="flex items-start gap-3">
                  <div className="flex items-center h-5">
                    <input
                      {...register('showResults')}
                      id="showResults"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <label htmlFor="showResults" className="text-sm">
                    <span className="font-medium text-gray-900 block">Mostra Risultati</span>
                    <span className="text-gray-500">
                      Mostra i risultati aggregati ai partecipanti dopo l'invio.
                    </span>
                  </label>
                </div>

                <div className="border-t border-gray-100 my-2" />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Stato Iniziale</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="draft">Bozza</option>
                    <option value="active">Attivo</option>
                    <option value="closed">Chiuso</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
