/**
 * FILE: src/app/(dashboard)/persone/staff/[id]/edit/page.tsx
 *
 * VERSION: 1.1
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

  const defaultValues = {
    id: staff.id,
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    phone: staff.phone ?? '',
    photoUrl: staff.photoUrl ?? '',
    role: staff.role as any,
    specialization: staff.specialization ?? '',
    hourlyRate: staff.hourlyRate ?? null,
    preferredPaymentMethod: staff.preferredPaymentMethod ?? '',
    isActive: staff.isActive,
    notes: staff.notes ?? '',
    // Passiamo i tag come stringa di input (tagsText), NON come "tags" (che nel form schema è una string trasformata)
    tagsText: Array.isArray(staff.tags) ? staff.tags.join(', ') : '',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modifica membro dello staff</h1>
      <StaffForm mode="edit" defaultValues={defaultValues} />
    </div>
  )
}
