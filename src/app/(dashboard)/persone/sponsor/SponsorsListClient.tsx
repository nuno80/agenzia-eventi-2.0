/**
 * FILE: src/app/(dashboard)/persone/sponsor/SponsorsListClient.tsx
 * TYPE: Client Component
 * PURPOSE: Client-side filtering for sponsors list (livello, contratto, pagamento)
 */
'use client'

import { useMemo, useState } from 'react'

function levelClasses(level: SponsorItem['sponsorshipLevel']): string {
  switch (level) {
    case 'platinum':
      return 'bg-purple-100 text-purple-700'
    case 'gold':
      return 'bg-amber-100 text-amber-700'
    case 'silver':
      return 'bg-gray-200 text-gray-700'
    case 'bronze':
      return 'bg-orange-100 text-orange-700'
    case 'partner':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export type SponsorItem = {
  id: string
  companyName: string
  contactPerson: string | null
  email: string
  sponsorshipLevel: 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner'
  sponsorshipAmount: number
  contractSigned: boolean
  paymentStatus: 'pending' | 'partial' | 'paid'
}

type Level = SponsorItem['sponsorshipLevel'] | 'all'
type Pay = SponsorItem['paymentStatus'] | 'all'
type Contract = 'all' | 'signed' | 'unsigned'

export default function SponsorsListClient({ sponsors }: { sponsors: SponsorItem[] }) {
  const [sortBy, setSortBy] = useState<
    'company' | 'contact' | 'email' | 'level' | 'contract' | 'payment' | 'amount'
  >('company')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [level, setLevel] = useState<Level>('all')
  const [contract, setContract] = useState<Contract>('all')
  const [payment, setPayment] = useState<Pay>('all')

  const items = useMemo(() => {
    const filtered = sponsors.filter((s) => {
      if (level !== 'all' && s.sponsorshipLevel !== level) return false
      if (contract === 'signed' && !s.contractSigned) return false
      if (contract === 'unsigned' && s.contractSigned) return false
      if (payment !== 'all' && s.paymentStatus !== payment) return false
      return true
    })
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'company':
          cmp = a.companyName.localeCompare(b.companyName)
          break
        case 'contact':
          cmp = (a.contactPerson || '').localeCompare(b.contactPerson || '')
          break
        case 'email':
          cmp = a.email.localeCompare(b.email)
          break
        case 'level':
          cmp = a.sponsorshipLevel.localeCompare(b.sponsorshipLevel)
          break
        case 'contract':
          cmp = Number(a.contractSigned) - Number(b.contractSigned)
          break
        case 'payment': {
          const ord = { paid: 2, partial: 1, pending: 0 } as const
          cmp = (ord[a.paymentStatus] ?? 0) - (ord[b.paymentStatus] ?? 0)
          break
        }
        case 'amount':
          cmp = a.sponsorshipAmount - b.sponsorshipAmount
          break
        default:
          cmp = 0
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [sponsors, level, contract, payment, sortBy, sortDir])

  const money = (v: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v)

  const headerButton = (label: string, key: typeof sortBy, alignRight = false) => (
    <button
      type="button"
      className={`inline-flex items-center gap-1 cursor-pointer ${alignRight ? 'justify-end w-full' : ''}`}
      title={`Ordina per ${label}`}
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

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <span className="text-gray-600">Livello</span>
            <select
              className="border rounded px-2 py-1"
              aria-label="Filtra per livello"
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
            >
              <option value="all">Tutti</option>
              <option value="platinum">Platinum</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="partner">Partner</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2">
            <span className="text-gray-600">Contratto</span>
            <select
              className="border rounded px-2 py-1"
              aria-label="Filtra per contratto"
              value={contract}
              onChange={(e) => setContract(e.target.value as Contract)}
            >
              <option value="all">Tutti</option>
              <option value="signed">Firmato</option>
              <option value="unsigned">Non firmato</option>
            </select>
          </label>

          <label className="inline-flex items-center gap-2">
            <span className="text-gray-600">Pagamento</span>
            <select
              className="border rounded px-2 py-1"
              aria-label="Filtra per pagamento"
              value={payment}
              onChange={(e) => setPayment(e.target.value as Pay)}
            >
              <option value="all">Tutti</option>
              <option value="paid">Pagato</option>
              <option value="partial">Parziale</option>
              <option value="pending">Da pagare</option>
            </select>
          </label>
        </div>
        <div className="text-xs text-gray-600">
          Mostrando {items.length} di {sponsors.length}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-500">
            <th className="py-2 px-4">{headerButton('Azienda', 'company')}</th>
            <th className="py-2 px-4">{headerButton('Contatto', 'contact')}</th>
            <th className="py-2 px-4">{headerButton('Email', 'email')}</th>
            <th className="py-2 px-4">{headerButton('Livello', 'level')}</th>
            <th className="py-2 px-4">{headerButton('Contratto', 'contract')}</th>
            <th className="py-2 px-4">{headerButton('Pagamento', 'payment')}</th>
            <th className="py-2 px-4 text-right">{headerButton('Importo', 'amount', true)}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((s) => (
            <tr key={s.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
              <td className="py-2 px-4 font-medium text-gray-900">{s.companyName}</td>
              <td className="py-2 px-4 text-gray-700">{s.contactPerson || '-'}</td>
              <td className="py-2 px-4 text-gray-700">{s.email}</td>
              <td className="py-2 px-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${levelClasses(s.sponsorshipLevel)}`}
                >
                  {s.sponsorshipLevel}
                </span>
              </td>
              <td className="py-2 px-4">
                <span className={s.contractSigned ? 'text-green-700' : 'text-gray-600'}>
                  {s.contractSigned ? 'Firmato' : 'Non firmato'}
                </span>
              </td>
              <td className="py-2 px-4">
                <span
                  className={
                    s.paymentStatus === 'paid'
                      ? 'text-green-700'
                      : s.paymentStatus === 'partial'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                  }
                >
                  {s.paymentStatus === 'paid'
                    ? 'Pagato'
                    : s.paymentStatus === 'partial'
                      ? 'Parziale'
                      : 'Da pagare'}
                </span>
              </td>
              <td className="py-2 px-4 text-right">{money(s.sponsorshipAmount)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-600">
                Nessun sponsor corrispondente ai filtri.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
