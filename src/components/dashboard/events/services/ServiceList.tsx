'use client'

import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { ServiceCard } from '@/components/dashboard/events/services/ServiceCard'
import { ServiceForm } from '@/components/dashboard/events/services/ServiceForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BudgetCategory, Service } from '@/db/libsql-schemas/events'

interface ServiceListProps {
  eventId: string
  services: Service[]
  budgetCategories: BudgetCategory[]
}

export function ServiceList({ eventId, services, budgetCategories }: ServiceListProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      service.providerName?.toLowerCase().includes(search.toLowerCase())

    const matchesType = typeFilter === 'all' || service.serviceType === typeFilter
    const matchesStatus = statusFilter === 'all' || service.contractStatus === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setEditingService(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca servizi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i tipi</SelectItem>
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="requested">Richiesto</SelectItem>
              <SelectItem value="quoted">Preventivato</SelectItem>
              <SelectItem value="contracted">Contrattualizzato</SelectItem>
              <SelectItem value="delivered">Erogato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Servizio
        </Button>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-muted-foreground">Nessun servizio trovato.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <ServiceForm
        eventId={eventId}
        service={editingService}
        budgetCategories={budgetCategories}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setEditingService(null)
        }}
      />
    </div>
  )
}
