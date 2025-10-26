// ============================================================================
// DEADLINES TAB COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/tabs/DeadlinesTab.tsx
//
// PURPOSE: Display and manage deadlines for an event
// FEATURES:
// - List of deadlines with key information
// - Add, edit, delete deadlines
// - Status tracking and filtering
// ============================================================================

'use client'

import { useState } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { format, isAfter, isBefore, isToday } from 'date-fns'
import { it } from 'date-fns/locale'
import {
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data for deadlines - in a real app, this would come from an API call
type Deadline = {
  id: string
  title: string
  description?: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'overdue'
  assignedTo?: string
  category?: string
}

type DeadlinesTabProps = {
  eventId: string
}

export function DeadlinesTab({ eventId }: DeadlinesTabProps) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock data - in a real app, this would be fetched from an API
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    {
      id: '1',
      title: 'Conferma location',
      description: "Finalizzare il contratto con la location e versare l'acconto",
      dueDate: '2023-08-15',
      priority: 'high',
      status: 'completed',
      assignedTo: 'Marco Rossi',
      category: 'Logistica',
    },
    {
      id: '2',
      title: 'Invio inviti ai relatori',
      description: 'Inviare gli inviti ufficiali a tutti i relatori confermati',
      dueDate: '2023-09-01',
      priority: 'high',
      status: 'completed',
      assignedTo: 'Giulia Bianchi',
      category: 'Comunicazione',
    },
    {
      id: '3',
      title: 'Deadline early bird registrazioni',
      dueDate: '2023-09-30',
      priority: 'medium',
      status: 'pending',
      category: 'Marketing',
    },
    {
      id: '4',
      title: 'Finalizzare menu catering',
      description: 'Confermare le scelte del menu e le opzioni per diete speciali',
      dueDate: '2023-10-15',
      priority: 'medium',
      status: 'pending',
      assignedTo: 'Luca Verdi',
      category: 'Catering',
    },
    {
      id: '5',
      title: 'Chiusura registrazioni',
      dueDate: '2023-10-25',
      priority: 'high',
      status: 'pending',
      category: 'Marketing',
    },
  ])

  // Update deadline statuses based on current date
  const today = new Date()
  const updatedDeadlines = deadlines.map((deadline) => {
    if (deadline.status === 'completed') return deadline

    const dueDate = new Date(deadline.dueDate)
    if (isBefore(dueDate, today) && !isToday(dueDate)) {
      return { ...deadline, status: 'overdue' as const }
    }
    return deadline
  })

  // Filter deadlines based on status filter
  const filteredDeadlines =
    statusFilter === 'all'
      ? updatedDeadlines
      : updatedDeadlines.filter((deadline) => deadline.status === statusFilter)

  // Sort deadlines by due date (closest first) and then by priority
  const sortedDeadlines = [...filteredDeadlines].sort((a, b) => {
    // First sort by status (overdue first, then pending, then completed)
    const statusOrder = { overdue: 0, pending: 1, completed: 2 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    // Then sort by due date
    const dateA = new Date(a.dueDate)
    const dateB = new Date(b.dueDate)
    const dateDiff = dateA.getTime() - dateB.getTime()
    if (dateDiff !== 0) return dateDiff

    // Finally sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Handle adding a new deadline
  const handleAddDeadline = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const dueDate = formData.get('dueDate') as string
    const dueDateObj = new Date(dueDate)

    // Determine status based on due date
    let status: Deadline['status'] = 'pending'
    if (isBefore(dueDateObj, today) && !isToday(dueDateObj)) {
      status = 'overdue'
    }

    // In a real app, this would be a server action or API call
    const newDeadline: Deadline = {
      id: `${deadlines.length + 1}`,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      dueDate,
      priority: formData.get('priority') as Deadline['priority'],
      status,
      assignedTo: (formData.get('assignedTo') as string) || undefined,
      category: (formData.get('category') as string) || undefined,
    }

    setDeadlines([...deadlines, newDeadline])
    setIsAddDialogOpen(false)

    toast({
      title: 'Scadenza aggiunta',
      description: `${newDeadline.title} è stata aggiunta all'evento.`,
    })
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: Deadline['status'] }) => {
    const statusConfig = {
      pending: { label: 'In attesa', variant: 'outline' as const },
      completed: { label: 'Completata', variant: 'success' as const },
      overdue: { label: 'Scaduta', variant: 'destructive' as const },
    }

    const config = statusConfig[status]

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: Deadline['priority'] }) => {
    const priorityConfig = {
      high: { label: 'Alta', variant: 'destructive' as const },
      medium: { label: 'Media', variant: 'warning' as const },
      low: { label: 'Bassa', variant: 'secondary' as const },
    }

    const config = priorityConfig[priority]

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Scadenze</h2>

        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtra per stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="pending">In attesa</SelectItem>
              <SelectItem value="completed">Completate</SelectItem>
              <SelectItem value="overdue">Scadute</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Scadenza</TableHead>
              <TableHead>Priorità</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Assegnato a</TableHead>
              <TableHead className="w-[80px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDeadlines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nessuna scadenza trovata
                </TableCell>
              </TableRow>
            ) : (
              sortedDeadlines.map((deadline) => {
                const dueDate = new Date(deadline.dueDate)
                const formattedDate = format(dueDate, 'dd MMM yyyy', { locale: it })

                return (
                  <TableRow key={deadline.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deadline.title}</p>
                        {deadline.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {deadline.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{deadline.category || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{formattedDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={deadline.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={deadline.status} />
                    </TableCell>
                    <TableCell>{deadline.assignedTo || '-'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Azioni</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" /> Modifica
                          </DropdownMenuItem>
                          {deadline.status !== 'completed' && (
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" /> Segna come completata
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Deadline Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Scadenza</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli della nuova scadenza per l'evento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddDeadline}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titolo
                </Label>
                <Input id="title" name="title" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrizione
                </Label>
                <Textarea id="description" name="description" className="col-span-3" rows={3} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Data scadenza
                </Label>
                <Input id="dueDate" name="dueDate" type="date" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priorità
                </Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleziona priorità" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Bassa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoria
                </Label>
                <Input id="category" name="category" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedTo" className="text-right">
                  Assegnato a
                </Label>
                <Input id="assignedTo" name="assignedTo" className="col-span-3" />
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
