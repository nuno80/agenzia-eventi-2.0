'use client'
/**
 * FILE: src/components/dashboard/staff/StaffTabs.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: StaffTabs
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Evidenziazione tab attiva con pathname
 * - Navigazione tra tab interattiva
 *
 * PROPS:
 * - staffId: string - ID staff per costruire gli URL
 * - currentTab: string - Tab attiva
 *
 * TABS:
 * - overview: Dati principali del profilo
 * - assegnazioni: Prossime assegnazioni
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, LayoutPanelTop } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StaffTabsProps {
  staffId: string
  currentTab: string
}

export function StaffTabs({ staffId, currentTab }: StaffTabsProps) {
  const _pathname = usePathname()

  const tabs = [
    { slug: 'overview', label: 'Overview', icon: LayoutPanelTop },
    { slug: 'assegnazioni', label: 'Prossime assegnazioni', icon: ClipboardList },
  ] as const

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
      <div className="overflow-x-auto scrollbar-hide">
        <nav className="flex space-x-1 px-4 lg:px-6 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.slug
            return (
              <Link
                key={tab.slug}
                href={`/persone/staff/${staffId}/${tab.slug}`}
                className={cn(
                  'flex items-center space-x-2 px-4 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  )
}
