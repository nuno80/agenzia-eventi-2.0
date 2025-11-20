/**
 * FILE: src/app/(dashboard)/persone/partecipanti/page.tsx
 * ROUTE: /persone/partecipanti
 * TYPE: Server Page (App Router)
 */

import { getAllParticipants } from '@/lib/dal/participants'
import ParticipantsListClient from './ParticipantsListClient'

export default async function AllParticipantsPage() {
  const list = await getAllParticipants()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Partecipanti</h1>
        <p className="text-sm text-gray-600">Elenco globale dei partecipanti su tutti gli eventi</p>
      </div>

      <ParticipantsListClient
        participants={list.map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          company: p.company ?? null,
          registrationStatus: p.registrationStatus,
          paymentStatus: p.paymentStatus ?? 'pending',
          checkedIn: Boolean(p.checkedIn),
          registrationDate: p.registrationDate ?? null,
          checkinTime: p.checkinTime ?? null,
          ticketPrice: p.ticketPrice ?? null,
        }))}
      />
    </div>
  )
}
