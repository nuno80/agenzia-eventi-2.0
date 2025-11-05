/**
 * FILE: src/app/(dashboard)/persone/partecipanti/ParticipantsListClient.tsx
 * TYPE: Client Component
 * PURPOSE: Client-side filtering and rendering for participants list
 */
'use client'

import { useMemo, useState } from 'react'

export type ParticipantItem = {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  registrationStatus: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'free'
  checkedIn: boolean
  ticketPrice: number | null
}

type Reg = ParticipantItem['registrationStatus'] | 'all'
type Pay = ParticipantItem['paymentStatus'] | 'all'

export default function ParticipantsListClient({
  participants,
}: {
  participants: ParticipantItem[]
}) {
  const [reg, setReg] = useState<Reg>('all')
  const [pay, setPay] = useState<Pay>('all')
  const [checked, setChecked] = useState<'all' | 'in' | 'out'>('all')
  const [q, setQ] = useState('')

  const items = useMemo(() => {
    const query = q.trim().toLowerCase()
    return participants.filter((p) => {
      if (reg !== 'all' && p.registrationStatus !== reg) return false
      if (pay !== 'all' && p.paymentStatus !== pay) return false
      if (checked === 'in' && !p.checkedIn) return false
      if (checked === 'out' && p.checkedIn) return false
      if (query) {
        const hay = `${p.firstName} ${p.lastName} ${p.email} ${p.company ?? ''}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
  }, [participants, reg, pay, checked, q])

  const money = (v: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v)

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <span className="text-gray-600">Stato iscrizione</span>
            <select
              className="border rounded px-2 py-1"
              aria-label="Filtra per stato iscrizione"
              value={reg}
              onChange={(e) => setReg(e.target.value as Reg)}
            >
              <option value="all">Tutti</option>
              <option value="confirmed">Confermati</option>
              <option value="pending">In attesa</option>
              <option value="waitlist">Lista attesa</option>
              <option value="cancelled">Cancellati</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2">
            <span className="text-gray-600">Pagamento</span>
            <select
              className="border rounded px-2 py-1"
              aria-label="Filtra per pagamento"
              value={pay}
              onChange={(e) => setPay(e.target.value as Pay)}
            >
              <option value="all">Tutti</option>
              <option value="paid">Pagato</option>
              <option value="pending">Da pagare</option>
              <option value="free">Gratuito</option>
              <option value="refunded">Rimborsato</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2">
            <span className="text-gray-600">Check-in</span>
            <select
              className="border rounded px-2 py-1"
              aria-label="Filtra per check-in"
              value={checked}
              onChange={(e) => setChecked(e.target.value as 'all' | 'in' | 'out')}
            >
              <option value="all">Tutti</option>
              <option value="in">Check-in effettuato</option>
              <option value="out">Non check-in</option>
            </select>
          </label>

          <input
            className="border rounded px-2 py-1"
            placeholder="Cerca nome/email/azienda..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cerca partecipanti"
          />
        </div>
        <div className="text-xs text-gray-600">
          Mostrando {items.length} di {participants.length}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-500">
            <th className="py-2 px-4">Nome</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Azienda</th>
            <th className="py-2 px-4">Iscrizione</th>
            <th className="py-2 px-4">Pagamento</th>
            <th className="py-2 px-4">Check-in</th>
            <th className="py-2 px-4 text-right">Prezzo</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((p) => (
            <tr key={p.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
              <td className="py-2 px-4 font-medium text-gray-900">
                {p.lastName} {p.firstName}
              </td>
              <td className="py-2 px-4 text-gray-700">{p.email}</td>
              <td className="py-2 px-4 text-gray-700">{p.company || '-'}</td>
              <td className="py-2 px-4">
                <span
                  className={
                    p.registrationStatus === 'confirmed'
                      ? 'text-green-700'
                      : p.registrationStatus === 'pending'
                        ? 'text-yellow-700'
                        : p.registrationStatus === 'waitlist'
                          ? 'text-blue-700'
                          : 'text-red-700'
                  }
                >
                  {p.registrationStatus === 'confirmed'
                    ? 'Confermato'
                    : p.registrationStatus === 'pending'
                      ? 'In attesa'
                      : p.registrationStatus === 'waitlist'
                        ? 'Lista attesa'
                        : 'Cancellato'}
                </span>
              </td>
              <td className="py-2 px-4">
                <span
                  className={
                    p.paymentStatus === 'paid'
                      ? 'text-green-700'
                      : p.paymentStatus === 'pending'
                        ? 'text-red-700'
                        : 'text-gray-700'
                  }
                >
                  {p.paymentStatus === 'paid'
                    ? 'Pagato'
                    : p.paymentStatus === 'pending'
                      ? 'Da pagare'
                      : p.paymentStatus === 'free'
                        ? 'Gratuito'
                        : 'Rimborsato'}
                </span>
              </td>
              <td className="py-2 px-4">{p.checkedIn ? 'Sì' : 'No'}</td>
              <td className="py-2 px-4 text-right">
                {p.ticketPrice != null ? money(p.ticketPrice) : '-'}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-gray-600">
                Nessun partecipante corrispondente ai filtri.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
