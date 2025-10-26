// ============================================================================
// DASHBOARD NAVIGATION
// ============================================================================
// FILE: src/components/dashboard/DashboardNav.tsx
//
// PURPOSE: Sidebar navigation for the dashboard
// FEATURES:
// - Links to all dashboard sections
// - Active state highlighting
// - Collapsible on mobile
// ============================================================================

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CalendarIcon,
  UsersIcon,
  MicIcon,
  BuildingIcon,
  ReceiptIcon,
  ClockIcon,
  MessageSquareIcon,
  BarChartIcon,
  CheckSquareIcon,
  CalendarDaysIcon,
  HomeIcon,
} from 'lucide-react'

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: HomeIcon,
  },
  {
    title: 'Eventi',
    href: '/eventi',
    icon: CalendarIcon,
  },
  {
    title: 'Partecipanti',
    href: '/partecipanti',
    icon: UsersIcon,
  },
  {
    title: 'Relatori',
    href: '/relatori',
    icon: MicIcon,
  },
  {
    title: 'Sponsor',
    href: '/sponsor',
    icon: BuildingIcon,
  },
  {
    title: 'Budget',
    href: '/budget',
    icon: ReceiptIcon,
  },
  {
    title: 'Scadenze',
    href: '/scadenze',
    icon: ClockIcon,
  },
  {
    title: 'Comunicazioni',
    href: '/comunicazioni',
    icon: MessageSquareIcon,
  },
  {
    title: 'Questionari',
    href: '/questionari',
    icon: BarChartIcon,
  },
  {
    title: 'Check-in',
    href: '/checkin',
    icon: CheckSquareIcon,
  },
  {
    title: 'Agenda',
    href: '/agenda',
    icon: CalendarDaysIcon,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 hidden md:block">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">EventMaster</h2>
      </div>

      <div className="px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
