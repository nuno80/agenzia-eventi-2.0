/**
 * FILE: src/app/(dashboard)/persone/partecipanti/ParticipantsListClient.tsx
 * TYPE: Client Component
 * PURPOSE: Client-side sorting for participants list with optional "solo check-in" toggle
 */
'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDateTimeShort } from '@/lib/utils'

export type ParticipantItem = {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  registrationStatus: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'free'
  checkedIn: boolean
  registrationDate: Date | string | number | null
  checkinTime: Date | string | number | null
  ticketPrice: number | null
}

export default function ParticipantsListClient({
  participants,
}: {
  participants: ParticipantItem[]
}) {
  const [sortBy, setSortBy] = useState<
    'name' | 'email' | 'company' | 'price' | 'registered' | 'checkin'
  >('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [onlyCheckedIn, setOnlyCheckedIn] = useState(false)

  const items = useMemo(() => {
    const filtered = onlyCheckedIn ? participants.filter((p) => p.checkedIn) : participants
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') {
        const an = `${a.lastName} ${a.firstName}`.toLowerCase()
        const bn = `${b.lastName} ${b.firstName}`.toLowerCase()
        cmp = an.localeCompare(bn)
      } else if (sortBy === 'email') {
        cmp = a.email.localeCompare(b.email)
      } else if (sortBy === 'company') {
        cmp = (a.company || '').localeCompare(b.company || '')
      } else if (sortBy === 'price') {
        const ap = a.ticketPrice ?? 0
        const bp = b.ticketPrice ?? 0
        cmp = ap - bp
      } else if (sortBy === 'registered') {
        const toTs = (v: Date | string | number | null) =>
          v instanceof Date
            ? v.getTime()
            : typeof v === 'string' || typeof v === 'number'
              ? new Date(v).getTime()
              : 0
        const ar = toTs(a.registrationDate)
        const br = toTs(b.registrationDate)
        cmp = ar - br
      } else if (sortBy === 'checkin') {
        const toTs = (v: Date | string | number | null) =>
          v instanceof Date
            ? v.getTime()
            : typeof v === 'string' || typeof v === 'number'
              ? new Date(v).getTime()
              : 0
        const ad = toTs(a.checkinTime)
        const bd = toTs(b.checkinTime)
        cmp = ad - bd
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [participants, onlyCheckedIn, sortBy, sortDir])

  const headerButton = (
    label: string,
    key: 'name' | 'email' | 'company' | 'price' | 'registered' | 'checkin',
    alignRight = false
  ) => (
    <button
      type="button"
      className={`inline-flex items-center gap-1 cursor-pointer ${alignRight ? 'justify-end w-full' : ''}`}
      title={`Ordina per ${label}`}
      aria-label={`Ordina per ${label} (${sortBy === key ? (sortDir === 'asc' ? 'ascendente' : 'discendente') : 'non attivo'})`}
      onClick={() => {
        setSortBy(key)
        setSortDir((d) => (sortBy === key ? (d === 'asc' ? 'desc' : 'asc') : d))
      }}
    >
      {label}
      <span aria-hidden className={`${sortBy === key ? 'text-gray-700' : 'text-gray-300'}`}>
        {sortBy === key ? (sortDir === 'asc' ? '▲' : '▼') : '•'}
      </span>
    </button>
  )

  const money = (v: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v)

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Top bar minimal */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="text-sm text-gray-700">Partecipanti</div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Esporta CSV"
            onClick={() => {
              const rows = items.map((p) => ({
                id: p.id,
                name: `${p.lastName} ${p.firstName}`,
                email: p.email,
                company: p.company ?? '',
                registrationStatus: p.registrationStatus,
                paymentStatus: p.paymentStatus,
                checkedIn: p.checkedIn,
                registrationDate: p.registrationDate
                  ? p.registrationDate instanceof Date
                    ? p.registrationDate.toISOString()
                    : String(p.registrationDate)
                  : '',
                checkinTime: p.checkinTime
                  ? p.checkinTime instanceof Date
                    ? p.checkinTime.toISOString()
                    : String(p.checkinTime)
                  : '',
                ticketPrice: p.ticketPrice ?? '',
              }))
              if (rows.length === 0) return
              const headers = Object.keys(rows[0])
              const esc = (v: unknown) =>
                typeof v === 'string' ? `"${v.replaceAll('"', '""')}"` : String(v ?? '')
              const csv = [
                headers.join(','),
                ...rows.map((r) =>
                  headers.map((h) => esc((r as Record<string, unknown>)[h])).join(',')
                ),
              ].join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'participants.csv'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
          >
            Esporta CSV
          </Button>
          <label className="inline-flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={onlyCheckedIn}
              onChange={(e) => setOnlyCheckedIn(e.target.checked)}
              aria-label="Mostra solo utenti con check-in"
            />
            Solo check-in
          </label>
          <div className="text-xs text-gray-600">
            Mostrando {items.length} di {participants.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-500">
            <th
              className="py-2 px-4"
              aria-sort={
                sortBy === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              }
            >
              {headerButton('Nome', 'name')}
            </th>
            <th
              className="py-2 px-4"
              aria-sort={
                sortBy === 'email' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              }
            >
              {headerButton('Email', 'email')}
            </th>
            <th
              className="py-2 px-4"
              aria-sort={
                sortBy === 'company' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              }
            >
              {headerButton('Azienda', 'company')}
            </th>
            <th className="py-2 px-4">Iscrizione</th>
            <th className="py-2 px-4">Pagamento</th>
            <th
              className="py-2 px-4"
              aria-sort={
                sortBy === 'registered' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              }
            >
              {headerButton('Data registrazione', 'registered')}
            </th>
            <th
              className="py-2 px-4"
              aria-sort={
                sortBy === 'checkin' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              }
            >
              {headerButton('Check-in data', 'checkin')}
            </th>
            <th
              className="py-2 px-4 text-right"
              aria-sort={
                sortBy === 'price' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              }
            >
              {headerButton('Prezzo', 'price', true)}
            </th>
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
              <td className="py-2 px-4">
                {p.registrationDate
                  ? formatDateTimeShort(
                      typeof p.registrationDate === 'number'
                        ? new Date(p.registrationDate)
                        : p.registrationDate
                    )
                  : '—'}
              </td>
              <td className="py-2 px-4">
                {p.checkedIn && p.checkinTime
                  ? formatDateTimeShort(
                      typeof p.checkinTime === 'number' ? new Date(p.checkinTime) : p.checkinTime
                    )
                  : 'No'}
              </td>
              <td className="py-2 px-4 text-right">
                {p.ticketPrice != null ? money(p.ticketPrice) : '-'}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="py-8 text-center text-gray-600">
                Nessun partecipante.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
