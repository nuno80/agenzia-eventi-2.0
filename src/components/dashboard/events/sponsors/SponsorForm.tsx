'use client'

import { AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { ActionResult } from '@/app/actions/sponsors'
import { createSponsor, updateSponsor } from '@/app/actions/sponsors'
import { Button } from '@/components/ui/button'
import type { Sponsor } from '@/db'

interface SponsorFormProps {
  eventId: string
  initialData?: Sponsor
  onSuccess?: () => void
  onCancel?: () => void
}

export function SponsorForm({ eventId, initialData, onSuccess, onCancel }: SponsorFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const mode = initialData ? 'edit' : 'create'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    // Convert checkbox/boolean
    const payload = {
      ...data,
      contractSigned: formData.get('contractSigned') === 'on',
      // Dates need to be Date objects or ISO strings for Zod coerce?
      // Zod coerce.date() handles strings.
      // But my schema expects Date object or string?
      // The schema uses z.date().optional().nullable() which expects a Date object if passed directly to parse,
      // or if using formData, we need to preprocess.
      // However, the action receives `unknown` and parses it.
      // If I send JSON, I need to convert dates.
      // If I send FormData, I need to handle it in the action or here.
      // The action uses `createSponsorSchema.parse(data)`.
      // `Object.fromEntries` gives strings.
      // I should manually convert dates and numbers.
      sponsorshipAmount: Number(data.sponsorshipAmount),
      contractDate: data.contractDate ? new Date(data.contractDate as string) : null,
      paymentDate: data.paymentDate ? new Date(data.paymentDate as string) : null,
    }

    startTransition(async () => {
      let result: ActionResult = { success: false, message: '' }

      if (mode === 'create') {
        result = await createSponsor(eventId, payload)
      } else {
        if (!initialData?.id) return
        result = await updateSponsor(initialData.id, payload)
      }

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        if (onSuccess) {
          onSuccess()
        } else {
          router.refresh()
        }
      } else {
        setMessage({ type: 'error', text: result.message })
        if (result.errors) {
          setErrors(result.errors)
        }
      }
    })
  }

  const getErrorMessage = (field: string) => errors[field]?.[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg flex items-start space-x-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div className="col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Azienda *
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            required
            defaultValue={initialData?.companyName}
            className={`w-full px-3 py-2 border rounded-md ${getErrorMessage('companyName') ? 'border-red-300' : 'border-gray-300'}`}
          />
          {getErrorMessage('companyName') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('companyName')}</p>
          )}
        </div>

        {/* Contact Person */}
        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
            Referente
          </label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            defaultValue={initialData?.contactPerson || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            defaultValue={initialData?.email}
            className={`w-full px-3 py-2 border rounded-md ${getErrorMessage('email') ? 'border-red-300' : 'border-gray-300'}`}
          />
          {getErrorMessage('email') && (
            <p className="mt-1 text-sm text-red-600">{getErrorMessage('email')}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            defaultValue={initialData?.phone || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Sito Web
          </label>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            defaultValue={initialData?.websiteUrl || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Sponsorship Level */}
        <div>
          <label
            htmlFor="sponsorshipLevel"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Livello *
          </label>
          <select
            id="sponsorshipLevel"
            name="sponsorshipLevel"
            required
            defaultValue={initialData?.sponsorshipLevel || 'bronze'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="platinum">Platinum</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
            <option value="partner">Partner</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="sponsorshipAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Importo (€) *
          </label>
          <input
            type="number"
            id="sponsorshipAmount"
            name="sponsorshipAmount"
            required
            min="0"
            step="0.01"
            defaultValue={initialData?.sponsorshipAmount || 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Contract Signed */}
        <div className="flex items-center space-x-2 mt-6">
          <input
            type="checkbox"
            id="contractSigned"
            name="contractSigned"
            defaultChecked={!!initialData?.contractSigned}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="contractSigned" className="text-sm font-medium text-gray-700">
            Contratto Firmato
          </label>
        </div>

        {/* Contract Date */}
        <div>
          <label htmlFor="contractDate" className="block text-sm font-medium text-gray-700 mb-1">
            Data Contratto
          </label>
          <input
            type="date"
            id="contractDate"
            name="contractDate"
            defaultValue={
              initialData?.contractDate
                ? new Date(initialData.contractDate).toISOString().split('T')[0]
                : ''
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Payment Status */}
        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Stato Pagamento
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={initialData?.paymentStatus || 'pending'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="pending">In attesa</option>
            <option value="partial">Parziale</option>
            <option value="paid">Pagato</option>
          </select>
        </div>

        {/* Payment Date */}
        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
            Data Pagamento
          </label>
          <input
            type="date"
            id="paymentDate"
            name="paymentDate"
            defaultValue={
              initialData?.paymentDate
                ? new Date(initialData.paymentDate).toISOString().split('T')[0]
                : ''
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={initialData?.notes || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annulla
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Crea Sponsor' : 'Salva Modifiche'}
        </Button>
      </div>
    </form>
  )
}
