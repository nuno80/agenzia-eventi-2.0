/**
 * FILE: src/components/dashboard/events/EventForm.tsx
 *
 * COMPONENT: EventForm
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Form state management with useState
 * - Input handlers and validation feedback
 * - Server Action submission with loading states
 * - Error display and success handling
 *
 * PROPS:
 * - mode: 'create' | 'edit' - Form mode
 * - initialData?: Event - Initial data for edit mode
 * - onSuccess?: (eventId: string) => void - Callback after successful submission
 *
 * FEATURES:
 * - Complete event form with all fields
 * - Real-time validation feedback
 * - Loading states during submission
 * - Error messages per field
 * - Success/error toast messages
 * - Tags input with add/remove
 * - Date/time pickers
 *
 * USAGE:
 * <EventForm mode="create" onSuccess={(id) => router.push(`/eventi/${id}/overview`)} />
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent, updateEvent } from '@/app/actions/events';
import { Loader2, X, Plus, AlertCircle } from 'lucide-react';
import type { Event } from '@/lib/db/schema';

interface EventFormProps {
  mode: 'create' | 'edit';
  initialData?: Event;
  onSuccess?: (eventId: string) => void;
}

export function EventForm({ mode, initialData, onSuccess }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tags state
  const [tags, setTags] = useState<string[]>(
    initialData?.tags ? JSON.parse(initialData.tags) : []
  );
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    const formData = new FormData(e.currentTarget);

    // Add tags to formData
    formData.set('tags', JSON.stringify(tags));

    startTransition(async () => {
      const result = mode === 'create'
        ? await createEvent(formData)
        : await updateEvent(initialData!.id, formData);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });

        if (onSuccess) {
          // Use custom callback if provided
          if (mode === 'create' && result.data?.id) {
            onSuccess(result.data.id);
          } else if (mode === 'edit' && initialData?.id) {
            onSuccess(initialData.id);
          }
        } else if (mode === 'create' && result.data?.id) {
          // Default: redirect to new event
          router.push(`/eventi/${result.data.id}/overview`);
        } else if (mode === 'edit' && initialData?.id) {
          // Default: redirect back to event detail
          router.push(`/eventi/${initialData.id}/overview`);
        } else {
          // Fallback: refresh page
          router.refresh();
        }
      } else {
        setMessage({ type: 'error', text: result.message });
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    });
  };

  const getErrorMessage = (field: string) => {
    return errors[field]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start space-x-3 ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Basic Info Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informazioni Base
        </h3>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titolo Evento *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={initialData?.title}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorMessage('title') ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Es: Tech Summit 2024"
            />
            {getErrorMessage('title') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('title')}</p>
            )}
          </div>

          {/* Tagline */}
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              defaultValue={initialData?.tagline || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: Innovazione, networking e futuro"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={initialData?.description || ''}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorMessage('description') ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descrizione completa dell'evento..."
            />
            {getErrorMessage('description') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('description')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Date
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Inizio *
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              required
              defaultValue={initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : ''}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorMessage('startDate') ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {getErrorMessage('startDate') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('startDate')}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data Fine *
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              required
              defaultValue={initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : ''}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorMessage('endDate') ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {getErrorMessage('endDate') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('endDate')}</p>
            )}
          </div>

          {/* Registration Open */}
          <div>
            <label htmlFor="registrationOpenDate" className="block text-sm font-medium text-gray-700 mb-1">
              Apertura Iscrizioni
            </label>
            <input
              type="datetime-local"
              id="registrationOpenDate"
              name="registrationOpenDate"
              defaultValue={initialData?.registrationOpenDate ? new Date(initialData.registrationOpenDate).toISOString().slice(0, 16) : ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Registration Close */}
          <div>
            <label htmlFor="registrationCloseDate" className="block text-sm font-medium text-gray-700 mb-1">
              Chiusura Iscrizioni
            </label>
            <input
              type="datetime-local"
              id="registrationCloseDate"
              name="registrationCloseDate"
              defaultValue={initialData?.registrationCloseDate ? new Date(initialData.registrationCloseDate).toISOString().slice(0, 16) : ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Luogo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Località *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              defaultValue={initialData?.location}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getErrorMessage('location') ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Es: Milano"
            />
            {getErrorMessage('location') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('location')}</p>
            )}
          </div>

          {/* Venue */}
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              defaultValue={initialData?.venue || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: Milano Convention Center"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Indirizzo
            </label>
            <input
              type="text"
              id="address"
              name="address"
              defaultValue={initialData?.address || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: Via Gattamelata 5"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Città
            </label>
            <input
              type="text"
              id="city"
              name="city"
              defaultValue={initialData?.city || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: Milano"
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Paese
            </label>
            <input
              type="text"
              id="country"
              name="country"
              defaultValue={initialData?.country || 'Italia'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Sito Web
            </label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              defaultValue={initialData?.websiteUrl || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Impostazioni
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Stato
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initialData?.status || 'draft'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Bozza</option>
              <option value="planning">Pianificazione</option>
              <option value="open">Aperto</option>
              <option value="ongoing">In corso</option>
              <option value="completed">Completato</option>
              <option value="cancelled">Annullato</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priorità
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={initialData?.priority || 'medium'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Bassa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <input
              type="text"
              id="category"
              name="category"
              defaultValue={initialData?.category || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: Conferenza, Workshop, Webinar"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
              Capacità Massima
            </label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              min="1"
              defaultValue={initialData?.maxParticipants || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: 500"
            />
          </div>

          {/* Total Budget */}
          <div>
            <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Totale (€)
            </label>
            <input
              type="number"
              id="totalBudget"
              name="totalBudget"
              min="0"
              step="0.01"
              defaultValue={initialData?.totalBudget || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es: 150000"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL Immagine
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              defaultValue={initialData?.imageUrl || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isPublic"
                defaultChecked={initialData?.isPublic}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Evento pubblico</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="requiresApproval"
                defaultChecked={initialData?.requiresApproval}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Richiede approvazione</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tags
        </h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Aggiungi un tag..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi</span>
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Note
        </h3>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={initialData?.notes || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Note aggiuntive o promemoria..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          disabled={isPending}
        >
          Annulla
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{mode === 'create' ? 'Creazione...' : 'Salvataggio...'}</span>
            </>
          ) : (
            <span>{mode === 'create' ? 'Crea Evento' : 'Salva Modifiche'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
