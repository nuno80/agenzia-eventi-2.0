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
 *
 * STRUCTURE:
 * - Sidebar: Fixed left on desktop, overlay on mobile
 * - Header: Sticky top bar with search and user menu
 * - Main: Content area with padding and gray background
 *
 * RESPONSIVE BEHAVIOR:
 * - Desktop (lg+): Sidebar always visible, main content offset by 256px (w-64)
 * - Mobile: Sidebar hidden by default, toggles via hamburger menu
 *
 * CHILDREN:
 * - All pages under (dashboard) route group will render inside <main>
 *
 * USAGE:
 * This layout wraps all dashboard pages automatically via Next.js App Router
 */

'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/layout/Sidebar';
import { Header } from '@/components/dashboard/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main content area - Offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        {/* Sticky header */}
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
