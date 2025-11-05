'use client'

import { useMemo, useState } from 'react'

export type SponsorRow = {
  id: string
  companyName: string
  contactPerson: string | null
  email: string
  sponsorshipLevel: string
  contractSigned: boolean
  paymentStatus: 'pending' | 'partial' | 'paid'
  sponsorshipAmount: number
}

export default function SponsorsListClient({ list }: { list: SponsorRow[] }) {
  const [sortBy, setSortBy] = useState<
    'company' | 'email' | 'level' | 'contract' | 'payment' | 'amount'
  >('company')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const items = useMemo(() => {
    const sorted = [...list].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'company':
          cmp = a.companyName.localeCompare(b.companyName)
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
  }, [list, sortBy, sortDir])

  const headerButton = (
    label: string,
    key: 'company' | 'email' | 'level' | 'contract' | 'payment' | 'amount',
    alignRight = false
  ) => (
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

  const paymentLabel = (s: SponsorRow['paymentStatus']) =>
    s === 'paid' ? 'Pagato' : s === 'partial' ? 'Parziale' : 'Da pagare'

  const paymentClass = (s: SponsorRow['paymentStatus']) =>
    s === 'paid' ? 'text-green-700' : s === 'partial' ? 'text-yellow-700' : 'text-red-700'

  const money = (v: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-500">
            <th className="py-2 pr-4">{headerButton('Azienda', 'company')}</th>
            <th className="py-2 pr-4">{headerButton('Email', 'email')}</th>
            <th className="py-2 pr-4">{headerButton('Livello', 'level')}</th>
            <th className="py-2 pr-4">{headerButton('Contratto', 'contract')}</th>
            <th className="py-2 pr-4">{headerButton('Pagamento', 'payment')}</th>
            <th className="py-2 pr-4 text-right">{headerButton('Importo', 'amount', true)}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((s) => (
            <tr key={s.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
              <td className="py-2 pr-4">
                <div className="font-medium text-gray-900">{s.companyName}</div>
                <div className="text-xs text-gray-500">
                  {[s.contactPerson || null, s.email].filter(Boolean).join(' · ')}
                </div>
              </td>
              <td className="py-2 pr-4 text-gray-700">{s.email}</td>
              <td className="py-2 pr-4">
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[11px] font-medium">
                  {s.sponsorshipLevel}
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className={s.contractSigned ? 'text-green-700' : 'text-gray-600'}>
                  {s.contractSigned ? 'Firmato' : 'Non firmato'}
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className={paymentClass(s.paymentStatus)}>
                  {paymentLabel(s.paymentStatus)}
                </span>
              </td>
              <td className="py-2 pr-4 text-right">{money(s.sponsorshipAmount)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-600">
                Nessuno sponsor presente.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
