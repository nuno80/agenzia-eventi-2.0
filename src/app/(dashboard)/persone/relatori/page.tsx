/**
 * FILE: src/app/(dashboard)/persone/relatori/page.tsx
 * ROUTE: /persone/relatori
 * TYPE: Server Page (App Router)
 */

import { getAllSpeakers } from '@/lib/dal/speakers'
import SpeakersListClient from './SpeakersListClient'

export default async function AllSpeakersPage() {
  const list = await getAllSpeakers()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Relatori</h1>
        <p className="text-sm text-gray-600">Elenco relatori globali su tutti gli eventi</p>
      </div>

      <SpeakersListClient
        speakers={list.map((s) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          company: s.company,
          jobTitle: s.jobTitle,
          confirmationStatus: s.confirmationStatus,
        }))}
      />
    </div>
  )
}
