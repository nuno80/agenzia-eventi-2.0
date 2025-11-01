/**
 * FILE: src/components/dashboard/events/DuplicateEventButton.tsx
 *
 * COMPONENT: DuplicateEventButton
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages dialog open/close state
 * - Handles Server Action with loading state
 * - Shows confirmation dialog before duplicate
 *
 * PROPS:
 * - eventId: string - Event ID to duplicate
 * - eventTitle: string - Event title for confirmation message
 * - variant?: 'icon' | 'button' - Display variant
 * - onSuccess?: (newEventId: string) => void - Callback after success
 *
 * FEATURES:
 * - Confirmation dialog with event details
 * - Shows what will be duplicated (speakers, sponsors, budget, etc.)
 * - Loading state during duplication
 * - Success redirect to new event
 * - Error handling with toast
 *
 * USAGE:
 * <DuplicateEventButton eventId={event.id} eventTitle={event.title} />
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { duplicateEvent } from '@/app/actions/events';
import { Copy, Loader2, CheckCircle, X } from 'lucide-react';

interface DuplicateEventButtonProps {
  eventId: string;
  eventTitle: string;
  variant?: 'icon' | 'button';
  onSuccess?: (newEventId: string) => void;
}

export function DuplicateEventButton({
  eventId,
  eventTitle,
  variant = 'button',
  onSuccess
}: DuplicateEventButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateEvent(eventId);

      if (result.success && result.data?.id) {
        setIsDialogOpen(false);

        if (onSuccess) {
          onSuccess(result.data.id);
        } else {
          // Redirect to new event
          router.push(`/eventi/${result.data.id}/overview`);
        }
      } else {
        // Show error (in production, use a toast library)
        alert(result.message);
      }
    });
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === 'icon' ? (
        <button
          onClick={() => setIsDialogOpen(true)}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          title="Duplica evento"
        >
          <Copy className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Copy className="w-4 h-4" />
          <span>Duplica Evento</span>
        </button>
      )}

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Duplica Evento
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Stai per duplicare l'evento:
              </p>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900">{eventTitle}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Cosa verrà duplicato:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Tutte le informazioni dell'evento</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Speaker e relatori</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Sponsor</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Budget e categorie</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Servizi (catering, AV, etc.)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Agenda e programma</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Scadenze</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> I partecipanti NON verranno duplicati. Le date verranno aggiornate all'anno successivo. Lo status sarà "Bozza".
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                disabled={isPending}
              >
                Annulla
              </button>
              <button
                onClick={handleDuplicate}
                disabled={isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Duplicazione...</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Duplica Evento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
