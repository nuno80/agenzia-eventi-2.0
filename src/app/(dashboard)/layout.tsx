// ============================================================================
// DASHBOARD LAYOUT
// ============================================================================
// FILE: src/app/(dashboard)/layout.tsx
//
// PURPOSE: Provides the layout wrapper for all dashboard pages
// FEATURES:
// - Sidebar navigation
// - Header with user profile
// - Consistent styling across dashboard
// ============================================================================

import type { ReactNode } from 'react'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
