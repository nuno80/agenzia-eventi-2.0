/**
 * FILE: src/app/(dashboard)/layout.tsx
 *
 * COMPONENT: DashboardLayout
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Manages mobile menu state (isMobileMenuOpen)
 * - Passes callbacks to Sidebar and Header components
 * - Needs useState for interactive UI state management
 */

'use client'

import { Suspense, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <Suspense
        fallback={
          <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 bg-white border-r" />
        }
      >
        <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
      </Suspense>

      {/* Main content area - Offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        {/* Sticky header */}
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
