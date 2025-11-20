'use client'

import { createService, updateService } from '@/actions/services'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { BudgetCategory, Service } from '@/db/libsql-schemas/events'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ServiceFormProps {
  eventId: string
  service?: Service | null
  budgetCategories: BudgetCategory[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ServiceForm({
  eventId,
  service,
  budgetCategories,
  open,
  onOpenChange,
  onSuccess,
}: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!service
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<string>('')

  // Debug: Log budget categories
  useEffect(() => {
    console.log('ServiceForm - Budget Categories:', budgetCategories)
    console.log('ServiceForm - Budget Categories length:', budgetCategories.length)
  }, [budgetCategories])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.append('eventId', eventId)
    if (isEditing && service) {
      formData.append('id', service.id)
    }

    try {
      const action = isEditing ? updateService : createService
      const result = await action(null, formData)

      if (result.success) {
        toast.success(isEditing ? 'Servizio aggiornato' : 'Servizio creato')
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.error || 'Errore durante il salvataggio')
        if (result.details) {
          console.error('Validation details:', result.details)
        }
      }
    } catch (error) {
      toast.error('Errore imprevisto')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifica Servizio' : 'Nuovo Servizio'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica i dettagli del servizio esistente.'
              : 'Aggiungi un nuovo servizio per questo evento.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="serviceName">Nome Servizio *</Label>
              <Input
                id="serviceName"
                name="serviceName"
                defaultValue={service?.serviceName}
                required
                minLength={3}
                placeholder="es. Catering Pranzo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Tipo Servizio *</Label>
              <Select name="serviceType" defaultValue={service?.serviceType || 'other'} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="av_equipment">Audio/Video</SelectItem>
                  <SelectItem value="photography">Fotografia</SelectItem>
                  <SelectItem value="videography">Video</SelectItem>
                  <SelectItem value="transport">Trasporti</SelectItem>
                  <SelectItem value="security">Sicurezza</SelectItem>
                  <SelectItem value="cleaning">Pulizie</SelectItem>
                  <SelectItem value="printing">Stampa</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Provider Info */}
            <div className="space-y-2">
              <Label htmlFor="providerName">Fornitore</Label>
              <Input
                id="providerName"
                name="providerName"
                defaultValue={service?.providerName || ''}
                placeholder="Nome azienda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contatto</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                defaultValue={service?.contactPerson || ''}
                placeholder="Nome referente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={service?.email || ''}
                placeholder="email@fornitore.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={service?.phone || ''}
                placeholder="+39..."
              />
            </div>

            {/* Status & Costs */}
            <div className="space-y-2">
              <Label htmlFor="contractStatus">Stato Contratto</Label>
              <Select name="contractStatus" defaultValue={service?.contractStatus || 'requested'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested">Richiesto</SelectItem>
                  <SelectItem value="quoted">Preventivato</SelectItem>
                  <SelectItem value="contracted">Contrattualizzato</SelectItem>
                  <SelectItem value="delivered">Erogato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Stato Pagamento</Label>
              <Select name="paymentStatus" defaultValue={service?.paymentStatus || 'pending'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">In Attesa</SelectItem>
                  <SelectItem value="paid">Pagato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotedPrice">Prezzo Preventivato (€)</Label>
              <Input
                id="quotedPrice"
                name="quotedPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={service?.quotedPrice || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalPrice">Prezzo Finale (€)</Label>
              <Input
                id="finalPrice"
                name="finalPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={service?.finalPrice || ''}
              />
            </div>

            {/* Delivery */}
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Data Consegna/Servizio</Label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                defaultValue={
                  service?.deliveryDate
                    ? new Date(service.deliveryDate).toISOString().split('T')[0]
                    : ''
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTime">Ora</Label>
              <Input
                id="deliveryTime"
                name="deliveryTime"
                type="time"
                defaultValue={service?.deliveryTime || ''}
              />
            </div>
          </div>

          {/* Text Areas */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={service?.description || ''}
              placeholder="Dettagli del servizio..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requisiti Speciali</Label>
            <Textarea
              id="requirements"
              name="requirements"
              defaultValue={service?.requirements || ''}
              placeholder="Elettricità, spazio, permessi..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note Interne</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={service?.notes || ''}
              placeholder="Note visibili solo allo staff..."
            />
          </div>

          {/* Budget Integration */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="budgetCategoryId">Collega al Budget (Opzionale)</Label>
            {budgetCategories.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <span>Nessuna categoria di budget disponibile. Crea prima le categorie nella tab Budget.</span>
              </div>
            ) : (
              <>
                <Select
                  name="budgetCategoryId"
                  defaultValue={service?.budgetItemId ? 'linked' : undefined}
                  onValueChange={setSelectedBudgetCategory}
                  disabled={isEditing && !!service?.budgetItemId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        service?.budgetItemId ? 'Già collegato al budget' : 'Seleziona categoria budget'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} (Rimanente: €{' '}
                        {((cat.allocatedAmount || 0) - (cat.spentAmount || 0)).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBudgetCategory && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    <span>Verrà creata automaticamente una voce di budget in questa categoria.</span>
                  </div>
                )}
              </>
            )}
            {service?.budgetItemId && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                <span>Questo servizio è collegato al budget.</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salva Modifiche' : 'Crea Servizio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
