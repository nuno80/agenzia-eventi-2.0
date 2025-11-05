'use client'

import { CalendarClock, CheckCircle2 } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { markPaid, postponePayment } from '@/app/actions/staff-assignments'
import { PaymentQuickActions, PaymentStatusBadge } from '@/components/dashboard/staff'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { formatDateTime, toRoleLabel } from '@/lib/utils'

export type AssignmentLite = {
  id: string
  startTime: Date | string
  endTime: Date | string
  assignmentStatus: string
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'not_due'
  paymentTerms: 'custom' | 'immediate' | '30_days' | '60_days' | '90_days'
  paymentDueDate: Date | string | null
  paymentDate: Date | string | null
  staff?: { id: string; firstName: string; lastName: string; role: string } | null
}

export function StaffAssignmentsClient({ items }: { items: AssignmentLite[] }) {
  const [sortBy, _setSortBy] = useState<'name' | 'date'>('name')
  const [sortDir, _setSortDir] = useState<'asc' | 'desc'>('asc')
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [openBatch, setOpenBatch] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Batch form state
  const [paymentTerms, setPaymentTerms] = useState<
    'custom' | 'immediate' | '30_days' | '60_days' | '90_days'
  >('custom')
  const [paymentDueDate, setPaymentDueDate] = useState<string>('')
  const [paymentAmount, setPaymentAmount] = useState<string>('')

  const allSelected = useMemo(
    () => selected.length > 0 && selected.length === items.length,
    [selected, items.length]
  )

  const toggleAll = () => {
    if (allSelected) setSelected([])
    else setSelected(items.map((i) => i.id))
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const batchMarkPaid = () => {
    if (!selected.length) return
    if (!window.confirm(`Segnare pagato ${selected.length} assegnazioni?`)) return
    startTransition(async () => {
      let ok = 0
      for (const id of selected) {
        const res = await markPaid({
          assignmentId: id,
          paymentDate: new Date(),
          paymentNotes: undefined,
        })
        if (res?.success) ok++
      }
      toast({
        title: 'Operazione completata',
        description: `${ok}/${selected.length} pagamenti registrati`,
      })
      setSelected([])
    })
  }

  const batchSetDue = () => {
    if (!selected.length) return
    startTransition(async () => {
      let ok = 0
      for (const id of selected) {
        const res = await postponePayment({
          assignmentId: id,
          newDueDate:
            paymentTerms === 'custom' && paymentDueDate ? new Date(paymentDueDate) : new Date(),
          reason: 'Batch update',
        })
        if (res?.success) ok++
      }
      toast({
        title: 'Scadenze aggiornate',
        description: `${ok}/${selected.length} assegnazioni aggiornate`,
      })
      setOpenBatch(false)
      setSelected([])
      setPaymentTerms('custom')
      setPaymentDueDate('')
      setPaymentAmount('')
    })
  }

  return (
    <div className="space-y-3">
      {/* Mass actions bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Selezionati: {selected.length} / Totale: {items.length}
        </div>
        <div className="flex items-center gap-2">
          <label className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-600">
            <input
              type="checkbox"
              className="mr-1"
              checked={criticalOnly}
              onChange={(e) => setCriticalOnly(e.target.checked)}
            />
            Pagamenti critici
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenBatch(true)}
            disabled={!selected.length || isPending}
          >
            <CalendarClock className="w-4 h-4 mr-1" /> Imposta scadenza
          </Button>
          <Button size="sm" onClick={batchMarkPaid} disabled={!selected.length || isPending}>
            <CheckCircle2 className="w-4 h-4 mr-1" /> Segna pagato
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="divide-y">
        <div className="py-2 flex items-center gap-4">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            aria-label="Seleziona tutte le assegnazioni"
          />
          <button
            type="button"
            className="text-left text-xs font-medium text-gray-500 w-1/3 inline-flex items-center gap-1 focus:outline-none"
            onClick={() => {
              setSortBy('name')
              setSortDir((d) => (sortBy === 'name' ? (d === 'asc' ? 'desc' : 'asc') : d))
            }}
            aria-label={`Ordina per nome (${sortBy === 'name' ? (sortDir === 'asc' ? 'ascendente' : 'discendente') : 'non attivo'})`}
          >
            Staff
            {sortBy === 'name' ? (
              <span aria-hidden className="inline-block">
                {sortDir === 'asc' ? '▲' : '▼'}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="text-left text-xs font-medium text-gray-500 w-1/3 inline-flex items-center gap-1 focus:outline-none"
            onClick={() => {
              setSortBy('date')
              setSortDir((d) => (sortBy === 'date' ? (d === 'asc' ? 'desc' : 'asc') : d))
            }}
            aria-label={`Ordina per periodo (${sortBy === 'date' ? (sortDir === 'asc' ? 'ascendente' : 'discendente') : 'non attivo'})`}
          >
            Periodo
            {sortBy === 'date' ? (
              <span aria-hidden className="inline-block">
                {sortDir === 'asc' ? '▲' : '▼'}
              </span>
            ) : null}
          </button>
          <div className="text-xs font-medium text-gray-500 flex-1">Pagamento</div>
        </div>
        {[
          ...(criticalOnly
            ? items.filter((i) => i.paymentStatus === 'pending' || i.paymentStatus === 'overdue')
            : items),
        ]
          .sort((a, b) => {
            if (sortBy === 'name') {
              const aLast = a.staff?.lastName?.toLowerCase() || ''
              const bLast = b.staff?.lastName?.toLowerCase() || ''
              const cmp = aLast.localeCompare(bLast)
              return sortDir === 'asc' ? cmp : -cmp
            }
            const aDate = new Date(a.startTime).getTime()
            const bDate = new Date(b.startTime).getTime()
            const cmp = aDate - bDate
            return sortDir === 'asc' ? cmp : -cmp
          })
          .map((a) => (
            <div key={a.id} className="py-3 flex items-center gap-4">
              <input
                type="checkbox"
                checked={selected.includes(a.id)}
                onChange={() => toggleOne(a.id)}
                aria-label={`Seleziona assegnazione per ${a.staff ? `${a.staff.lastName} ${a.staff.firstName}` : 'membro dello staff'}`}
              />
              <div className="w-1/3 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {a.staff ? `${a.staff.lastName} ${a.staff.firstName}` : 'Membro dello staff'}
                </div>
                {a.staff?.role ? (
                  <div className="mt-0.5">
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px] font-medium">
                      {toRoleLabel(a.staff.role)}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="w-1/3 text-xs text-gray-600">
                {formatDateTime(a.startTime)} → {formatDateTime(a.endTime)}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <PaymentStatusBadge
                  paymentTerms={a.paymentTerms}
                  paymentDueDate={a.paymentDueDate}
                  paymentDate={a.paymentDate}
                  assignmentStatus={a.assignmentStatus}
                  endTime={a.endTime}
                />
                <PaymentQuickActions
                  assignmentId={a.id}
                  currentDueDate={a.paymentDueDate}
                  isPaid={a.paymentStatus === 'paid'}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Batch modal */}
      {openBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-4 border-b text-base font-semibold">Imposta scadenza pagamento</div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Termini di pagamento</label>
                <select
                  className="border rounded px-3 py-2 text-sm w-full"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as any)}
                >
                  <option value="custom">Personalizzato</option>
                  <option value="immediate">Immediato</option>
                  <option value="30_days">30 giorni</option>
                  <option value="60_days">60 giorni</option>
                  <option value="90_days">90 giorni</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Scadenza (se personalizzato)
                </label>
                <input
                  type="date"
                  className="border rounded px-3 py-2 text-sm w-full disabled:opacity-50"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  disabled={paymentTerms !== 'custom'}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Importo (opzionale)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="border rounded px-3 py-2 text-sm w-full"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenBatch(false)}>
                Annulla
              </Button>
              <Button onClick={batchSetDue} disabled={!selected.length || isPending}>
                Applica
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
