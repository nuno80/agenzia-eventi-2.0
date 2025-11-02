// =============================================================================
// STAFF LIST PAGE
// =============================================================================
// FILE: src/app/(dashboard)/persone/staff/page.tsx
// PURPOSE: Pagina server che mostra la lista dello staff con filtri client-side
// PATTERN: Server Page -> fetch DAL -> pass props a Client component
// =============================================================================

import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getAllStaff } from '@/lib/dal/staff'
import { StaffListClient } from './StaffListClient'

export default async function StaffPage() {
  const staff = await getAllStaff()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff</h1>
        <Link href="/persone/staff/nuovo">
          <Button>Nuovo Membro</Button>
        </Link>
      </div>

      <Card className="p-6">
        <Suspense fallback={<div>Caricamento staff...</div>}>
          <StaffListClient staff={staff} />
        </Suspense>
      </Card>
    </div>
  )
}
