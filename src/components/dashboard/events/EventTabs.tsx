/**
 * FILE: src/components/dashboard/events/EventTabs.tsx
 *
 * COMPONENT: EventTabs
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Uses usePathname() to highlight active tab
 * - Interactive tab navigation
 * - Responsive scroll behavior
 *
 * PROPS:
 * - eventId: string - Event ID for building URLs
 * - currentTab: string - Currently active tab slug
 *
 * FEATURES:
 * - 10 tabs for different event sections
 * - Active tab highlighting
 * - Responsive: horizontal scroll on mobile
 * - Icons for each tab
 *
 * TABS:
 * - overview: Panoramica generale
 * - partecipanti: Lista partecipanti
 * - relatori: Speaker/relatori
 * - sponsor: Sponsor evento
 * - agenda: Programma/schedule
 * - servizi: Servizi (catering, AV, etc.)
 * - budget: Budget dettagliato
 * - comunicazioni: Email/notifiche
 * - sondaggi: Questionari feedback
 * - checkin: Check-in partecipanti
 *
 * USAGE:
 * <EventTabs eventId={event.id} currentTab={tab} />
 */

'use client'

import {
  Building2,
  CalendarDays,
  Euro,
  FileText,
  LayoutDashboard,
  Mail,
  Mic,
  QrCode,
  Users,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Tab {
  slug: string
  label: string
  icon: React.ElementType
}

const tabs: Tab[] = [
  {
    slug: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    slug: 'partecipanti',
    label: 'Partecipanti',
    icon: Users,
  },
  {
    slug: 'relatori',
    label: 'Relatori',
    icon: Mic,
  },
  {
    slug: 'sponsor',
    label: 'Sponsor',
    icon: Building2,
  },
  {
    slug: 'agenda',
    label: 'Agenda',
    icon: CalendarDays,
  },
  {
    slug: 'staff',
    label: 'Staff',
    icon: Users,
  },
  {
    slug: 'servizi',
    label: 'Servizi',
    icon: Wrench,
  },
  {
    slug: 'budget',
    label: 'Budget',
    icon: Euro,
  },
  {
    slug: 'comunicazioni',
    label: 'Comunicazioni',
    icon: Mail,
  },
  {
    slug: 'sondaggi',
    label: 'Sondaggi',
    icon: FileText,
  },
  {
    slug: 'checkin',
    label: 'Check-in',
    icon: QrCode,
  },
]

interface EventTabsProps {
  eventId: string
  currentTab: string
}

export function EventTabs({ eventId, currentTab }: EventTabsProps) {
  const _pathname = usePathname()

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
      {/* Tabs container with horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <nav className="flex space-x-1 px-4 lg:px-6 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentTab === tab.slug

            return (
              <Link
                key={tab.slug}
                href={`/eventi/${eventId}/${tab.slug}`}
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

      {/* Mobile: Scroll indicator hint */}
      <div className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  )
}
