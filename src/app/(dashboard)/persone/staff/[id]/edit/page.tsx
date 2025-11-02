/**
 * FILE: src/app/(dashboard)/persone/staff/[id]/edit/page.tsx
 *
 * VERSION: 1.0
 *
 * PAGE: Modifica Staff
 * TYPE: Server Page
 *
 * WHY SERVER:
 * - Carica i dati dal DAL e passa defaultValues al form
 */

import { notFound } from 'next/navigation'
import { StaffForm } from '@/components/dashboard/staff/StaffForm'
import { getStaffById } from '@/lib/dal/staff'

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const staff = await getStaffById(params.id)
  if (!staff) notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modifica membro dello staff</h1>
      <StaffForm
        mode="edit"
        defaultValues={{ id: staff.id, ...staff }}
      />
    </div>
  )
}
