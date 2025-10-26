// ============================================================================
// EVENT TABS COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventTabs.tsx
//
// PURPOSE: Tabs for navigating between different sections of event details
// FEATURES:
// - Tab navigation for event details, participants, speakers, etc.
// - Active tab highlighting
// ============================================================================

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type EventTabsProps = {
  eventId: string
}

type Tab = {
  label: string
  href: string
  exact?: boolean
}

export function EventTabs({ eventId }: EventTabsProps) {
  const pathname = usePathname()

  const tabs: Tab[] = [
    {
      label: 'Dettagli',
      href: `/eventi/${eventId}`,
      exact: true,
    },
    {
      label: 'Partecipanti',
      href: `/eventi/${eventId}/partecipanti`,
    },
    {
      label: 'Relatori',
      href: `/eventi/${eventId}/relatori`,
    },
    {
      label: 'Sponsor',
      href: `/eventi/${eventId}/sponsor`,
    },
    {
      label: 'Budget',
      href: `/eventi/${eventId}/budget`,
    },
    {
      label: 'Scadenze',
      href: `/eventi/${eventId}/scadenze`,
    },
    {
      label: 'Agenda',
      href: `/eventi/${eventId}/agenda`,
    },
  ]

  return (
    <div className="border-b">
      <nav className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 py-2 text-sm font-medium whitespace-nowrap',
                isActive
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
