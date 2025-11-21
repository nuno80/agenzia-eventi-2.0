import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StaffListFetcher } from './StaffListFetcher'

export default function StaffPage() {
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
          <StaffListFetcher />
        </Suspense>
      </Card>
    </div>
  )
}
