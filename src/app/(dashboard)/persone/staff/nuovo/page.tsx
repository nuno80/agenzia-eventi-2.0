/**
 * FILE: src/app/(dashboard)/persone/staff/nuovo/page.tsx
 *
 * VERSION: 1.0
 *
 * PAGE: Crea nuovo Staff
 * TYPE: Server Page
 *
 * WHY SERVER:
 * - Wrapper che rende il form client
 * - Nessun dato sensibile esposto
 */

import { redirect } from 'next/navigation'
import { StaffForm } from '@/components/dashboard/staff/StaffForm'

export default async function NewStaffPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuovo membro dello staff</h1>
      <StaffForm
        mode="create"
        onSuccess={(id) => {
          if (id) redirect(`/persone/staff/${id}/overview`)
        }}
      />
    </div>
  )
}
