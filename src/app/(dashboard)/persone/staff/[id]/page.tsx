// ============================================================================
// STAFF DETAIL PAGE (Redirect)
// ============================================================================
// FILE: src/app/(dashboard)/persone/staff/[id]/page.tsx
// PURPOSE: Redirect alla tab di default (overview) del dettaglio staff
// ============================================================================

import { redirect } from 'next/navigation'

export default async function StaffDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/persone/staff/${id}/overview`)
}
