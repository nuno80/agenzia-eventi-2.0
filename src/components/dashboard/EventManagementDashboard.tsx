'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EventManagementDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Reindirizza alla dashboard principale
    router.push('/eventi')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Reindirizzamento...</h2>
        <p className="text-gray-500">Stai per essere reindirizzato alla dashboard.</p>
      </div>
    </div>
  )
}
