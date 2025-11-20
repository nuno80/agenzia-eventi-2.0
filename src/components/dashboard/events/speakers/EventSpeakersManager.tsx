'use client'

import { Edit, MoreHorizontal, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteSpeaker } from '@/actions/speakers'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BudgetCategory } from '@/db/libsql-schemas/events'
import type { SpeakerDTO } from '@/lib/dal/speakers'
import { formatDateTime } from '@/lib/utils'
import SpeakerModal from './SpeakerModal'

interface EventSpeakersManagerProps {
  eventId: string
  speakers: SpeakerDTO[]
  budgetCategories: BudgetCategory[]
}

export default function EventSpeakersManager({
  eventId,
  speakers,
  budgetCategories,
}: EventSpeakersManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerDTO | undefined>(undefined)

  const handleEdit = (speaker: SpeakerDTO) => {
    setSelectedSpeaker(speaker)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedSpeaker(undefined)
    setIsModalOpen(true)
  }

  const handleDelete = async (speakerId: string) => {
    if (
      !confirm(
        'Sei sicuro di voler eliminare questo relatore? Se collegato al budget, verrà eliminata anche la voce di spesa.'
      )
    ) {
      return
    }

    try {
      const result = await deleteSpeaker(eventId, speakerId)
      if (result.success) {
        toast.success('Relatore eliminato')
      } else {
        toast.error(result.error || "Errore durante l'eliminazione")
      }
    } catch (error) {
      toast.error('Errore imprevisto')
      console.error(error)
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Relatore
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500">
                <th className="py-2 px-4">Nome</th>
                <th className="py-2 px-4">Azienda/Titolo</th>
                <th className="py-2 px-4">Sessione</th>
                <th className="py-2 px-4">Stato</th>
                <th className="py-2 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {speakers.map((s) => (
                <tr key={s.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
                  <td className="py-2 px-4">
                    <div className="font-medium text-gray-900">
                      {s.lastName} {s.firstName}
                    </div>
                    <div className="text-xs text-gray-500">{s.email}</div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="text-sm text-gray-900">
                      {s.company || '-'}
                      {s.jobTitle ? `, ${s.jobTitle}` : ''}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="text-sm text-gray-900">{s.sessionTitle || '-'}</div>
                    <div className="text-xs text-gray-500">
                      {s.sessionDate ? formatDateTime(s.sessionDate) : ''}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={
                        s.confirmationStatus === 'confirmed'
                          ? 'text-green-700'
                          : s.confirmationStatus === 'invited'
                            ? 'text-blue-700'
                            : s.confirmationStatus === 'tentative'
                              ? 'text-yellow-700'
                              : 'text-red-700'
                      }
                    >
                      {s.confirmationStatus === 'confirmed'
                        ? 'Confermato'
                        : s.confirmationStatus === 'invited'
                          ? 'Invitato'
                          : s.confirmationStatus === 'tentative'
                            ? 'Da confermare'
                            : 'Rifiutato'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Apri menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(s)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {speakers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-600">
                    Nessun relatore presente per questo evento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SpeakerModal
        eventId={eventId}
        speaker={selectedSpeaker}
        budgetCategories={budgetCategories}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          // Refresh handled by server action revalidatePath, but we close modal here
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
