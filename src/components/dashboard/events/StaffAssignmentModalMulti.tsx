'use client'

import { X } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { createAssignmentsBatch } from '@/app/actions/staff-assignments'
import { Button } from '@/components/ui/button'
import { toRoleLabel } from '@/lib/utils'

type StaffLite = { id: string; firstName: string; lastName: string; role: string }

interface Props {
  eventId: string
  staff: StaffLite[]
}

export function StaffAssignmentModalMulti({ eventId, staff }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentTerms, setPaymentTerms] = useState<
    'custom' | 'immediate' | '30_days' | '60_days' | '90_days'
  >('custom')
  const [paymentDueDate, setPaymentDueDate] = useState('')
  const [paymentAmount, setPaymentAmount] = useState<string>('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return staff.filter((s) => {
      const matchesQuery = q ? `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) : true
      const matchesRole = role ? s.role === role : true
      return matchesQuery && matchesRole
    })
  }, [staff, search, role])

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const onSubmit = () => {
    if (!selected.length || !startTime || !endTime) return
    startTransition(async () => {
      const res = await createAssignmentsBatch({
        eventId,
        staffIds: selected,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
        paymentTerms,
        paymentDueDate: paymentDueDate ? new Date(paymentDueDate) : null,
        paymentAmount: paymentAmount ? Number(paymentAmount) : null,
      })
      if (res.success) {
        setOpen(false)
        setSelected([])
        setSearch('')
        setRole('')
        setStartTime('')
        setEndTime('')
        setNotes('')
        setPaymentTerms('custom')
        setPaymentDueDate('')
        setPaymentAmount('')
      } else {
        alert(res.message)
      }
    })
  }

  return (
    <>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpen(true)}>
        Assegna staff
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-base font-semibold">Assegna staff all'evento</h3>
              <button
                aria-label="Chiudi"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  placeholder="Cerca per nome"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border rounded px-3 py-2 text-sm col-span-2"
                />
                <select
                  className="border rounded px-3 py-2 text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Tutti i ruoli</option>
                  {Array.from(new Set(staff.map((s) => s.role))).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-gray-600 self-center">
                  Selezionati: {selected.length}
                </div>
              </div>

              <div className="max-h-64 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="text-left p-2 w-8"></th>
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Ruolo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selected.includes(s.id)}
                            onChange={() => toggle(s.id)}
                          />
                        </td>
                        <td className="p-2">
                          {s.lastName} {s.firstName}
                        </td>
                        <td className="p-2 capitalize">{toRoleLabel(s.role)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Inizio</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="border rounded px-3 py-2 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fine</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="border rounded px-3 py-2 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Note (opzionale)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border rounded px-3 py-2 text-sm w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-xs text-gray-500 mb-1">Scadenza pagamento</label>
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
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annulla
              </Button>
              <Button
                onClick={onSubmit}
                disabled={!selected.length || !startTime || !endTime || isPending}
              >
                Crea assegnazioni
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
