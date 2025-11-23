/**
 * FILE: src/components/dashboard/settings/EmailTemplateSettings.tsx
 * TYPE: Client Component
 * WHY: Manage email templates with preview and edit capabilities
 *
 * FEATURES:
 * - List of default templates
 * - Template preview
 * - Edit template (subject + body)
 * - Reset to default
 * - localStorage persistence
 */

'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { resetEmailTemplate, updateEmailTemplate } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { defaultEmailTemplates, type EmailTemplate } from '@/lib/validations/settings'

const STORAGE_KEY = 'eventhub_email_templates'

export function EmailTemplateSettings() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultEmailTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setTemplates(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse stored templates:', error)
      }
    }
  }, [])

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsEditing(false)
  }

  const handleSaveTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedTemplate) return

    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateEmailTemplate(selectedTemplate.id, formData)

      if (result.success && result.data) {
        // Update in state and localStorage
        const updated = templates.map((t) => (t.id === result.data!.id ? result.data! : t))
        setTemplates(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        setSelectedTemplate(result.data)
        setIsEditing(false)
        toast.success('Template salvato con successo')
      } else {
        toast.error(result.error || 'Errore durante il salvataggio')
      }
    } catch (_error) {
      toast.error('Errore durante il salvataggio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetTemplate = async () => {
    if (!selectedTemplate) return

    setIsLoading(true)

    try {
      const result = await resetEmailTemplate(selectedTemplate.id)

      if (result.success) {
        // Reset to default
        const defaultTemplate = defaultEmailTemplates.find((t) => t.id === selectedTemplate.id)
        if (defaultTemplate) {
          const updated = templates.map((t) => (t.id === selectedTemplate.id ? defaultTemplate : t))
          setTemplates(updated)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          setSelectedTemplate(defaultTemplate)
          setIsEditing(false)
          toast.success('Template ripristinato al default')
        }
      } else {
        toast.error(result.error || 'Errore durante il reset')
      }
    } catch (_error) {
      toast.error('Errore durante il reset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template List */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow-sm rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Template Disponibili</h3>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelectTemplate(template)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg transition-colors
                  ${
                    selectedTemplate?.id === template.id
                      ? 'bg-blue-50 border-2 border-blue-600 text-blue-900'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }
                `}
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-500 mt-1">{template.subject}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Preview/Edit */}
      <div className="lg:col-span-2">
        {selectedTemplate ? (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h3>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                    >
                      ✏️ Modifica
                    </Button>
                    {!selectedTemplate.isDefault && (
                      <Button
                        type="button"
                        onClick={handleResetTemplate}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        className="text-sm"
                      >
                        🔄 Reset
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                  >
                    ❌ Annulla
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                {/* Template Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome Template
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={selectedTemplate.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Oggetto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    defaultValue={selectedTemplate.subject}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                {/* Body */}
                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                    Corpo Email
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    required
                    rows={12}
                    defaultValue={selectedTemplate.body}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-xs"
                  />
                </div>

                {/* Variables Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Variabili Disponibili</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables?.map((variable) => (
                      <code
                        key={variable}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {`{{${variable}}}`}
                      </code>
                    ))}
                  </div>
                </div>

                <input
                  type="hidden"
                  name="variables"
                  value={JSON.stringify(selectedTemplate.variables)}
                />
                <input
                  type="hidden"
                  name="isDefault"
                  value={selectedTemplate.isDefault.toString()}
                />

                {/* Submit */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? 'Salvataggio...' : 'Salva Template'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Preview */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Oggetto</h4>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    {selectedTemplate.subject}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Corpo</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono text-xs">
                    {selectedTemplate.body}
                  </div>
                </div>

                {/* Variables */}
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Variabili Utilizzate</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((variable) => (
                        <code
                          key={variable}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {`{{${variable}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona un Template</h3>
            <p className="text-sm text-gray-500">
              Scegli un template dalla lista per visualizzarlo o modificarlo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
