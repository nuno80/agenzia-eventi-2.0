/**
 * FILE: src/components/auth/AdminGuard.tsx
 * TYPE: Client Component
 *
 * PURPOSE: Protects routes that require admin access
 * Redirects non-admin users to home page
 */

'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/lib/auth-client'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  // Get user role (custom field added to Better Auth)
  const userRole = (session?.user as { role?: string } | undefined)?.role

  useEffect(() => {
    if (!isPending && session) {
      const role = (session.user as { role?: string })?.role

      // Not admin - redirect to home
      if (role !== 'admin') {
        router.push('/?error=unauthorized')
      }
    } else if (!isPending && !session) {
      // No session - redirect to login
      router.push('/login')
    }
  }, [session, isPending, router])

  // Loading state
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Verifica accesso...</p>
        </div>
      </div>
    )
  }

  // No session or not admin
  if (!session || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Reindirizzamento...</p>
        </div>
      </div>
    )
  }

  // Admin access granted
  return <>{children}</>
}
