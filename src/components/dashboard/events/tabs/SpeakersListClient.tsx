'use client'

import { useMemo, useState } from 'react'

export type SpeakerRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  jobTitle: string | null
  confirmationStatus: 'invited' | 'confirmed' | 'declined' | 'tentative'
}

export default function SpeakersListClient({ list }: { list: SpeakerRow[] }) {
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'company'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const items = useMemo(() => {
    const sorted = [...list].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') {
        const an = `${a.lastName} ${a.firstName}`.toLowerCase()
        const bn = `${b.lastName} ${b.firstName}`.toLowerCase()
        cmp = an.localeCompare(bn)
      } else if (sortBy === 'email') {
        cmp = a.email.localeCompare(b.email)
      } else {
        cmp = (a.company || '').localeCompare(b.company || '')
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [list, sortBy, sortDir])

  const headerButton = (label: string, key: 'name' | 'email' | 'company', alignRight = false) => (
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-500">
            <th className="py-2 pr-4">{headerButton('Nome', 'name')}</th>
            <th className="py-2 pr-4">{headerButton('Azienda/Titolo', 'company')}</th>
            <th className="py-2 pr-4">{headerButton('Email', 'email')}</th>
            <th className="py-2 pr-4">Stato</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((s) => (
            <tr key={s.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
              <td className="py-2 pr-4 font-medium text-gray-900">
                {s.lastName} {s.firstName}
              </td>
              <td className="py-2 pr-4 text-gray-700">
                {s.company || '-'}
                {s.jobTitle ? `, ${s.jobTitle}` : ''}
              </td>
              <td className="py-2 pr-4 text-gray-700">{s.email}</td>
              <td className="py-2 pr-4">
                <span
                  className={
                    s.confirmationStatus === 'confirmed'
                      ? 'text-green-700'
                      : s.confirmationStatus === 'invited'
                        ? 'text-blue-700'
                        : s.confirmationStatus === 'tentative'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                  }
                >
                  {s.confirmationStatus === 'confirmed'
                    ? 'Confermato'
                    : s.confirmationStatus === 'invited'
                      ? 'Invitato'
                      : s.confirmationStatus === 'tentative'
                        ? 'Da confermare'
                        : 'Rifiutato'}
                </span>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-600">
                Nessun relatore.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
