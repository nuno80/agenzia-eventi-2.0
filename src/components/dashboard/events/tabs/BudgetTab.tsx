// ============================================================================
// BUDGET TAB COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/tabs/BudgetTab.tsx
//
// PURPOSE: Display and manage budget for an event
// FEATURES:
// - Budget overview with income and expenses
// - Add, edit, delete budget items
// - Visual representation of budget allocation
// ============================================================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Plus,
  Euro,
  ArrowUpCircle,
  ArrowDownCircle,
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

// Mock data for budget items - in a real app, this would come from an API call
type BudgetItem = {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  notes?: string
  status: 'planned' | 'confirmed' | 'paid'
}

type BudgetTabProps = {
  eventId: string
}

export function BudgetTab({ eventId }: BudgetTabProps) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Mock data - in a real app, this would be fetched from an API
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      id: '1',
      description: 'Sponsorizzazione MediTech',
      amount: 15000,
      type: 'income',
      category: 'Sponsorizzazioni',
      date: '2023-09-15',
      status: 'confirmed',
    },
    {
      id: '2',
      description: 'Sponsorizzazione BioPharm',
      amount: 10000,
      type: 'income',
      category: 'Sponsorizzazioni',
      date: '2023-09-20',
      status: 'paid',
    },
    {
      id: '3',
      description: 'Quote di iscrizione',
      amount: 25000,
      type: 'income',
      category: 'Iscrizioni',
      date: '2023-10-10',
      status: 'planned',
    },
    {
      id: '4',
      description: 'Affitto location',
      amount: 12000,
      type: 'expense',
      category: 'Location',
      date: '2023-09-01',
      status: 'paid',
      notes: 'Include servizi tecnici e personale',
    },
    {
      id: '5',
      description: 'Catering',
      amount: 8500,
      type: 'expense',
      category: 'Ristorazione',
      date: '2023-10-15',
      status: 'confirmed',
    },
    {
      id: '6',
      description: 'Materiali promozionali',
      amount: 3500,
      type: 'expense',
      category: 'Marketing',
      date: '2023-09-25',
      status: 'paid',
    },
  ])

  // Calculate budget summary
  const totalIncome = budgetItems
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)

  const totalExpenses = budgetItems
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)

  const balance = totalIncome - totalExpenses

  // Group expenses by category for chart
  const expensesByCategory = budgetItems
    .filter((item) => item.type === 'expense')
    .reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = 0
        }
        acc[item.category] += item.amount
        return acc
      },
      {} as Record<string, number>
    )

  // Handle adding a new budget item
  const handleAddBudgetItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // In a real app, this would be a server action or API call
    const newBudgetItem: BudgetItem = {
      id: `${budgetItems.length + 1}`,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      type: formData.get('type') as BudgetItem['type'],
      category: formData.get('category') as string,
      date: formData.get('date') as string,
      notes: (formData.get('notes') as string) || undefined,
      status: formData.get('status') as BudgetItem['status'],
    }

    setBudgetItems([...budgetItems, newBudgetItem])
    setIsAddDialogOpen(false)

    toast({
      title: 'Voce di budget aggiunta',
      description: `${newBudgetItem.description} è stata aggiunta al budget.`,
    })
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: BudgetItem['status'] }) => {
    const statusConfig = {
      planned: { label: 'Pianificato', variant: 'secondary' as const },
      confirmed: { label: 'Confermato', variant: 'outline' as const },
      paid: { label: 'Pagato', variant: 'success' as const },
    }

    const config = statusConfig[status]

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Entrate Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUpCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-2xl font-bold">€{totalIncome.toLocaleString('it-IT')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Uscite Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-2xl font-bold">€{totalExpenses.toLocaleString('it-IT')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Bilancio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="h-4 w-4 text-blue-500 mr-2" />
              <span
                className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                €{balance.toLocaleString('it-IT')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Items Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Voci di Budget</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Voce
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrizione</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="w-[80px]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nessuna voce di budget trovata
                  </TableCell>
                </TableRow>
              ) : (
                budgetItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.type === 'income' ? (
                          <ArrowUpCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>{item.description}</span>
                      </div>
                      {item.notes && <p className="text-xs text-gray-500 mt-1">{item.notes}</p>}
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString('it-IT')}</TableCell>
                    <TableCell
                      className={item.type === 'income' ? 'text-green-600' : 'text-red-600'}
                    >
                      {item.type === 'income' ? '+' : '-'}€{item.amount.toLocaleString('it-IT')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
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
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" /> Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Budget Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Voce di Budget</DialogTitle>
            <DialogDescription>Inserisci i dettagli della nuova voce di budget.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddBudgetItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <Select name="type" defaultValue="expense">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Entrata</SelectItem>
                    <SelectItem value="expense">Uscita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrizione
                </Label>
                <Input id="description" name="description" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Importo (€)
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoria
                </Label>
                <Input id="category" name="category" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data
                </Label>
                <Input id="date" name="date" type="date" className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Stato
                </Label>
                <Select name="status" defaultValue="planned">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleziona stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Pianificato</SelectItem>
                    <SelectItem value="confirmed">Confermato</SelectItem>
                    <SelectItem value="paid">Pagato</SelectItem>
                  </SelectContent>
                </Select>
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
