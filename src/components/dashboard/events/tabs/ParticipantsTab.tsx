// ============================================================================
// PARTICIPANTS TAB COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/tabs/ParticipantsTab.tsx
//
// PURPOSE: Display and manage participants for an event
// FEATURES:
// - List of participants with key information
// - Filtering and sorting options
// - Actions (add, edit, delete participants)
// ============================================================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { MoreHorizontal, Plus, Search, UserPlus } from 'lucide-react'

// Mock data for participants - in a real app, this would come from an API call
type Participant = {
  id: string
  name: string
  email: string
  phone?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  role?: string
  notes?: string
}

type ParticipantsTabProps = {
  eventId: string
}

export function ParticipantsTab({ eventId }: ParticipantsTabProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Mock data - in a real app, this would be fetched from an API
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Marco Rossi',
      email: 'marco.rossi@example.com',
      phone: '+39 123 456 7890',
      status: 'confirmed',
      role: 'Delegato',
      notes: 'Richiesto menu vegetariano',
    },
    {
      id: '2',
      name: 'Giulia Bianchi',
      email: 'giulia.bianchi@example.com',
      phone: '+39 234 567 8901',
      status: 'pending',
      role: 'Ospite',
    },
    {
      id: '3',
      name: 'Luca Verdi',
      email: 'luca.verdi@example.com',
      phone: '+39 345 678 9012',
      status: 'cancelled',
      role: 'Relatore',
      notes: 'Ha cancellato per motivi di salute',
    },
  ])

  // Filter participants based on search query and status filter
  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (participant.phone && participant.phone.includes(searchQuery))

    const matchesStatus = statusFilter === 'all' || participant.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Handle adding a new participant
  const handleAddParticipant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // In a real app, this would be a server action or API call
    const newParticipant: Participant = {
      id: `${participants.length + 1}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      status: 'pending',
      role: formData.get('role') as string,
      notes: formData.get('notes') as string,
    }

    setParticipants([...participants, newParticipant])
    setIsAddDialogOpen(false)

    toast({
      title: 'Partecipante aggiunto',
      description: `${newParticipant.name} è stato aggiunto all'evento.`,
    })
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: Participant['status'] }) => {
    const statusConfig = {
      confirmed: { label: 'Confermato', variant: 'success' as const },
      pending: { label: 'In attesa', variant: 'warning' as const },
      cancelled: { label: 'Cancellato', variant: 'destructive' as const },
    }

    const config = statusConfig[status]

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cerca partecipanti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[250px]"
          />
        </div>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="confirmed">Confermati</SelectItem>
              <SelectItem value="pending">In attesa</SelectItem>
              <SelectItem value="cancelled">Cancellati</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Aggiungi
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="w-[80px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Nessun partecipante trovato
                </TableCell>
              </TableRow>
            ) : (
              filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      {participant.phone && (
                        <p className="text-sm text-gray-500">{participant.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>{participant.role || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={participant.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Azioni</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Modifica</DropdownMenuItem>
                        <DropdownMenuItem>Cambia stato</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Rimuovi</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Participant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Partecipante</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del nuovo partecipante per l'evento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddParticipant}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" name="email" type="email" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telefono
                </Label>
                <Input id="phone" name="phone" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Ruolo
                </Label>
                <Input id="role" name="role" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Note
                </Label>
                <Textarea id="notes" name="notes" className="col-span-3" rows={3} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annulla
              </Button>
              <Button type="submit">Aggiungi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
