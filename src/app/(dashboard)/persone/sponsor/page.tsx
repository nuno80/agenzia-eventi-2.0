/**
 * FILE: src/app/(dashboard)/persone/sponsor/page.tsx
 * ROUTE: /persone/sponsor
 * TYPE: Server Page (App Router)
 *
 * WHY SERVER:
 * - Read-only list pulled via DAL on the server
 */

import { getAllSponsors } from '@/lib/dal/sponsors'
import SponsorsListClient from './SponsorsListClient'

export default async function SponsorsPeoplePage() {
  const sponsors = await getAllSponsors()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Sponsor</h1>
        <p className="text-sm text-gray-600">Elenco sponsor registrati sugli eventi</p>
      </div>

      <SponsorsListClient
        sponsors={sponsors.map((s) => ({
          id: s.id,
          companyName: s.companyName,
          contactPerson: s.contactPerson,
          email: s.email,
          sponsorshipLevel: s.sponsorshipLevel,
          sponsorshipAmount: s.sponsorshipAmount,
          contractSigned: s.contractSigned,
          paymentStatus: s.paymentStatus,
        }))}
      />
    </div>
  )
}
