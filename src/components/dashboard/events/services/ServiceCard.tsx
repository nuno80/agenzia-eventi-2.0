'use client'

import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, DollarSign, MoreVertical, Pencil, Trash2, Truck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { deleteService, updateServiceStatus } from '@/actions/services'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Service } from '@/db/libsql-schemas/events'

interface ServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
}

export function ServiceCard({ service, onEdit }: ServiceCardProps) {
  const [_isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo servizio?')) return

    setIsDeleting(true)
    try {
      const result = await deleteService(service.id, service.eventId)
      if (result.success) {
        toast.success('Servizio eliminato con successo')
      } else {
        toast.error("Errore durante l'eliminazione del servizio")
      }
    } catch (_error) {
      toast.error('Errore imprevisto')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    try {
      const result = await updateServiceStatus(service.id, service.eventId, status)
      if (result.success) {
        toast.success('Stato aggiornato')
      } else {
        toast.error('Errore aggiornamento stato')
      }
    } catch (_error) {
      toast.error('Errore imprevisto')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800'
      case 'quoted':
        return 'bg-blue-100 text-blue-800'
      case 'contracted':
        return 'bg-green-100 text-green-800'
      case 'delivered':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'requested':
        return 'Richiesto'
      case 'quoted':
        return 'Preventivato'
      case 'contracted':
        return 'Contrattualizzato'
      case 'delivered':
        return 'Erogato'
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{service.serviceName}</CardTitle>
          <p className="text-sm text-muted-foreground capitalize">
            {service.serviceType.replace('_', ' ')}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(service)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifica
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          {service.providerName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>{service.providerName}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>
              {service.finalPrice
                ? `€ ${service.finalPrice.toLocaleString()}`
                : service.quotedPrice
                  ? `€ ${service.quotedPrice.toLocaleString()} (Prev.)`
                  : 'Prezzo non definito'}
            </span>
          </div>

          {service.deliveryDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(service.deliveryDate, 'd MMM yyyy', { locale: it })}
                {service.deliveryTime && ` alle ${service.deliveryTime}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Badge className={getStatusColor(service.contractStatus)}>
          {getStatusLabel(service.contractStatus)}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Cambia Stato
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange('requested')}>
              Richiesto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('quoted')}>
              Preventivato
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('contracted')}>
              Contrattualizzato
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('delivered')}>
              Erogato
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
