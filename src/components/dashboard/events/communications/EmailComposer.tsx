/**
 * FILE: src/components/dashboard/events/communications/EmailComposer.tsx
 *
 * COMPONENT: EmailComposer
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Form state management
 * - Template selection and preview
 * - Interactive UI elements
 * - Server action calls
 *
 * PROPS:
 * - eventId: Event ID
 * - templates: Available email templates
 *
 * USAGE:
 * <EmailComposer eventId={eventId} templates={templates} />
 */

'use client'

import { Mail, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { sendEmail } from '@/app/actions/communications'
import type { EmailTemplate } from '@/db/libsql-schemas/email-templates'
import { useCommunications } from './CommunicationsContext'
import { TemplateManager } from './TemplateManager'

interface EmailComposerProps {
  eventId: string
  templates: EmailTemplate[]
}

export function EmailComposer({ eventId, templates }: EmailComposerProps) {
  const [recipientType, setRecipientType] = useState<string>('all_participants')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  const { draft, setDraft } = useCommunications()

  // Load draft when it changes
  useEffect(() => {
    if (draft) {
      setSubject(draft.subject)
      setBody(draft.body)
      setRecipientType(draft.recipientType)
      if (draft.templateId) {
        setSelectedTemplate(draft.templateId)
      }
      // Clear draft after loading to avoid re-triggering
      setDraft(null as any)
    }
  }, [draft, setDraft])

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)

    if (templateId) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setSubject(template.subject)
        setBody(template.body)
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !body.trim()) {
      toast.error('Oggetto e corpo del messaggio sono obbligatori')
      return
    }

    setIsSending(true)

    try {
      const result = await sendEmail({
        eventId,
        recipientType,
        subject: subject.trim(),
        body: body.trim(),
        templateId: selectedTemplate || null,
      })

      if (result.success) {
        toast.success(result.message)
        // Reset form
        setSubject('')
        setBody('')
        setSelectedTemplate('')
      } else {
        toast.error(result.message)
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            messages.forEach((msg) => {
              toast.error(`${field}: ${msg}`)
            })
          })
        }
      }
    } catch (error) {
      console.error('Send email error:', error)
      toast.error("Errore durante l'invio dell'email")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Componi Email</h3>
            <p className="text-sm text-gray-600">Invia comunicazioni ai partecipanti</p>
          </div>
        </div>
        <TemplateManager templates={templates} eventId={eventId} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Type Selection */}
        <div>
          <label htmlFor="recipientType" className="block text-sm font-medium text-gray-700 mb-2">
            Destinatari
          </label>
          <select
            id="recipientType"
            value={recipientType}
            onChange={(e) => setRecipientType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all_participants">Tutti i partecipanti</option>
            <option value="confirmed_only">Solo confermati</option>
            <option value="speakers">Relatori</option>
            <option value="sponsors">Sponsor</option>
          </select>
        </div>

        {/* Template Selection */}
        {templates.length > 0 && (
          <div>
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
              Template (opzionale)
            </label>
            <select
              id="template"
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Nessun template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                  {template.category !== 'custom' && ` (${template.category})`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Oggetto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Inserisci l'oggetto dell'email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Messaggio <span className="text-red-500">*</span>
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Scrivi il tuo messaggio qui..."
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            Puoi usare variabili: {'{{firstName}}'}, {'{{lastName}}'}, {'{{eventTitle}}'},{' '}
            {'{{eventDate}}'}, {'{{eventLocation}}'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setSubject('')
              setBody('')
              setSelectedTemplate('')
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isSending}
          >
            Cancella
          </button>

          <button
            type="submit"
            disabled={isSending || !subject.trim() || !body.trim()}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <title>Caricamento</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Invia Email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
