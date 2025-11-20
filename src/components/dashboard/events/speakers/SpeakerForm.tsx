'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createSpeaker, updateSpeaker } from '@/actions/speakers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { BudgetCategory } from '@/db/libsql-schemas/events'
import type { SpeakerDTO } from '@/lib/dal/speakers'

interface SpeakerFormProps {
  eventId: string
  speaker?: SpeakerDTO
  budgetCategories: BudgetCategory[]
  onSuccess?: () => void
}

export default function SpeakerForm({
  eventId,
  speaker,
  budgetCategories,
  onSuccess,
}: SpeakerFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [budgetCategoryId, setBudgetCategoryId] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      // Append budget category if selected
      if (budgetCategoryId) {
        formData.append('budgetCategoryId', budgetCategoryId)
      }

      const result = speaker
        ? await updateSpeaker(eventId, speaker.id, formData)
        : await createSpeaker(eventId, formData)

      if (result.success) {
        toast.success(speaker ? 'Relatore aggiornato' : 'Relatore creato')
        onSuccess?.()
      } else {
        toast.error(result.error || 'Errore durante il salvataggio')
      }
    } catch (error) {
      toast.error('Errore imprevisto')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const isLinkedToBudget = !!speaker?.budgetItemId

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input id="firstName" name="firstName" defaultValue={speaker?.firstName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome *</Label>
          <Input id="lastName" name="lastName" defaultValue={speaker?.lastName} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" defaultValue={speaker?.email} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" name="phone" defaultValue={speaker?.phone || ''} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Azienda</Label>
          <Input id="company" name="company" defaultValue={speaker?.company || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Ruolo</Label>
          <Input id="jobTitle" name="jobTitle" defaultValue={speaker?.jobTitle || ''} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmationStatus">Stato Conferma *</Label>
        <Select name="confirmationStatus" defaultValue={speaker?.confirmationStatus || 'invited'}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invited">Invitato</SelectItem>
            <SelectItem value="confirmed">Confermato</SelectItem>
            <SelectItem value="declined">Rifiutato</SelectItem>
            <SelectItem value="tentative">Da confermare</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-4">Sessione</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTitle">Titolo Sessione</Label>
            <Input
              id="sessionTitle"
              name="sessionTitle"
              defaultValue={speaker?.sessionTitle || ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionDescription">Descrizione</Label>
            <Textarea
              id="sessionDescription"
              name="sessionDescription"
              defaultValue={speaker?.sessionDescription || ''}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-4">Logistica & Budget</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Switch
              id="travelRequired"
              name="travelRequired"
              defaultChecked={!!speaker?.travelRequired}
            />
            <Label htmlFor="travelRequired">Viaggio Richiesto</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="accommodationRequired"
              name="accommodationRequired"
              defaultChecked={!!speaker?.accommodationRequired}
            />
            <Label htmlFor="accommodationRequired">Alloggio Richiesto</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fee">Fee (Onorario)</Label>
            <Input id="fee" name="fee" type="number" step="0.01" defaultValue={speaker?.fee || 0} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetCategory">Categoria Budget</Label>
            <Select
              value={budgetCategoryId}
              onValueChange={setBudgetCategoryId}
              disabled={isLinkedToBudget}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLinkedToBudget ? 'Già collegato al budget' : 'Collega al budget (opzionale)'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {budgetCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLinkedToBudget && (
              <p className="text-xs text-yellow-600">
                Questo relatore è già collegato a una voce di budget. Le modifiche alla fee
                aggiorneranno automaticamente il budget.
              </p>
            )}
            {!isLinkedToBudget && budgetCategoryId && (
              <p className="text-xs text-blue-600">
                Verrà creata una voce di budget automatica per questo relatore.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {speaker ? 'Salva Modifiche' : 'Crea Relatore'}
        </Button>
      </div>
    </form>
  )
}
