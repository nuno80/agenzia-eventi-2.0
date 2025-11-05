/**
 * FILE: src/app/(dashboard)/persone/relatori/SpeakersListClient.tsx
 * TYPE: Client Component
 * PURPOSE: Client-side filtering for speakers list (status, search)
 */
'use client'

import { useMemo, useState } from 'react'

export type SpeakerItem = {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string | null
  jobTitle: string | null
  confirmationStatus: 'invited' | 'confirmed' | 'declined' | 'tentative'
}

type Status = SpeakerItem['confirmationStatus'] | 'all'

export default function SpeakersListClient({ speakers }: { speakers: SpeakerItem[] }) {
  const [status, setStatus] = useState<Status>('all')
  const [q, setQ] = useState('')

  const items = useMemo(() => {
    const query = q.trim().toLowerCase()
    return speakers.filter((s) => {
      if (status !== 'all' && s.confirmationStatus !== status) return false
      if (query) {
        const hay =
          `${s.firstName} ${s.lastName} ${s.email} ${s.company ?? ''} ${s.jobTitle ?? ''}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
  }, [speakers, status, q])

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <span className="text-gray-600">Stato</span>
            <select
              className="border rounded px-2 py-1"
              aria-label="Filtra per stato"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="all">Tutti</option>
              <option value="confirmed">Confermati</option>
              <option value="invited">Invitati</option>
              <option value="tentative">Da confermare</option>
              <option value="declined">Rifiutati</option>
            </select>
          </label>

          <input
            className="border rounded px-2 py-1"
            placeholder="Cerca nome/email/azienda..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cerca relatori"
          />
        </div>
        <div className="text-xs text-gray-600">
          Mostrando {items.length} di {speakers.length}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs text-gray-500">
            <th className="py-2 px-4">Nome</th>
            <th className="py-2 px-4">Azienda/Titolo</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Stato</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((s) => (
            <tr key={s.id} className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200">
              <td className="py-2 px-4 font-medium text-gray-900">
                {s.lastName} {s.firstName}
              </td>
              <td className="py-2 px-4 text-gray-700">
                {s.company || '-'}
                {s.jobTitle ? `, ${s.jobTitle}` : ''}
              </td>
              <td className="py-2 px-4 text-gray-700">{s.email}</td>
              <td className="py-2 px-4">
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
                Nessun relatore corrispondente ai filtri.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
