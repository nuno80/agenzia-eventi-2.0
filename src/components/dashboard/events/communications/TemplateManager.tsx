/**
 * FILE: src/components/dashboard/events/communications/TemplateManager.tsx
 *
 * COMPONENT: TemplateManager
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages dialog state (open/close)
 * - Handles form input for creating/editing templates
 * - Client-side validation and interaction
 *
 * PROPS:
 * - templates: List of existing templates
 * - eventId: Current event ID (for scoping new templates)
 *
 * USAGE:
 * <TemplateManager templates={templates} eventId={eventId} />
 */

'use client'

import { Edit, FileText, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteEmailTemplate, saveEmailTemplate } from '@/app/actions/communications'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { EmailTemplate } from '@/db/libsql-schemas/email-templates'

interface TemplateManagerProps {
  templates: EmailTemplate[]
  eventId: string
}

export function TemplateManager({ templates, eventId }: TemplateManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTemplate(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Gestisci Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestione Template Email</DialogTitle>
          <DialogDescription>
            Crea e modifica i template per le tue comunicazioni.
          </DialogDescription>
        </DialogHeader>

        {isFormOpen ? (
          <TemplateForm template={editingTemplate} eventId={eventId} onClose={handleCloseForm} />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                Nuovo Template
              </Button>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                Nessun template disponibile. Creane uno nuovo!
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-500">{template.subject}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 capitalize">
                          {template.category}
                        </span>
                        {!template.eventId && (
                          <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full text-blue-600">
                            Globale
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(template)}
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>
                      <DeleteTemplateButton templateId={template.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TemplateForm({
  template,
  eventId,
  onClose,
}: {
  template: EmailTemplate | null
  eventId: string
  onClose: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body: template?.body || '',
    category: template?.category || 'custom',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        eventId: template?.eventId || eventId, // Keep existing scope or set to current event
        variables: [], // TODO: Extract variables from body
        isDefault: false,
        ...(template?.id ? { id: template.id } : {}),
      }

      const result = await saveEmailTemplate(payload)

      if (result.success) {
        toast.success(result.message)
        onClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Save template error:', error)
      toast.error('Errore durante il salvataggio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      body: `${prev.body} {{${variable}}}`,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{template ? 'Modifica Template' : 'Nuovo Template'}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome Template</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="es. Benvenuto Partecipanti"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="custom">Personalizzato</option>
            <option value="welcome">Benvenuto</option>
            <option value="reminder">Promemoria</option>
            <option value="confirmation">Conferma</option>
            <option value="update">Aggiornamento</option>
            <option value="thank_you">Ringraziamento</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Oggetto Email</label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Oggetto dell'email..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contenuto</label>
          <div className="mb-2 flex gap-2 flex-wrap">
            {['firstName', 'lastName', 'eventTitle', 'eventDate', 'eventLocation'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border"
              >
                {`{{${v}}}`}
              </button>
            ))}
          </div>
          <textarea
            required
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full px-3 py-2 border rounded-md min-h-[200px] font-mono text-sm"
            placeholder="Scrivi il contenuto dell'email..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvataggio...' : 'Salva Template'}
        </Button>
      </div>
    </form>
  )
}

function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo template?')) return

    setIsDeleting(true)
    try {
      const result = await deleteEmailTemplate(templateId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (_error) {
      toast.error("Errore durante l'eliminazione")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      title="Elimina"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
