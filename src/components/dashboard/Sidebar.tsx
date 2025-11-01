/**
 * COMPONENT: Sidebar
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Uses usePathname() hook to highlight active route
 * - Handles mobile menu close interaction
 * - Needs state for UI interactions
 *
 * PROPS:
 * - isMobileOpen: boolean - Controls mobile sidebar visibility
 * - onMobileClose: () => void - Callback to close mobile menu
 *
 * RESPONSIVE:
 * - Desktop (lg+): Fixed sidebar, always visible (w-64)
 * - Mobile: Overlay sidebar, controlled by isMobileOpen prop
 *
 * USAGE:
 * <Sidebar
 *   isMobileOpen={isMobileMenuOpen}
 *   onMobileClose={() => setIsMobileMenuOpen(false)}
 * />
 */

'use client'

import {
  Building2,
  Calendar,
  ChevronDown,
  Euro,
  FileText,
  LayoutDashboard,
  Mic,
  Settings,
  Users,
  UsersRound,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isMobileOpen: boolean
  onMobileClose: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Eventi',
    href: '/eventi',
    icon: Calendar,
  },
  {
    label: 'Persone',
    href: '/persone',
    icon: Users,
    children: [
      {
        label: 'Partecipanti',
        href: '/persone/partecipanti',
        icon: Users,
      },
      {
        label: 'Relatori',
        href: '/persone/relatori',
        icon: Mic,
      },
      {
        label: 'Sponsor',
        href: '/persone/sponsor',
        icon: Building2,
      },
      {
        label: 'Staff',
        href: '/persone/staff',
        icon: UsersRound,
      },
    ],
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: Euro,
  },
  {
    label: 'Report',
    href: '/report',
    icon: FileText,
  },
  {
    label: 'Impostazioni',
    href: '/impostazioni',
    icon: Settings,
  },
]

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const isExpanded = (label: string) => expandedItems.includes(label)

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200',
          'flex flex-col transition-transform duration-300 ease-in-out',
          // Mobile: slide in/out
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Chiudi menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const expanded = isExpanded(item.label)
              const hasChildren = item.children && item.children.length > 0

              return (
                <li key={item.href}>
                  {hasChildren ? (
                    <>
                      {/* Parent item with children */}
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform',
                            expanded && 'transform rotate-180'
                          )}
                        />
                      </button>

                      {/* Children submenu */}
                      {expanded && (
                        <ul className="mt-1 ml-6 space-y-1">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon
                            const childActive = isActive(child.href)

                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onMobileClose}
                                  className={cn(
                                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    childActive
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  )}
                                >
                                  <ChildIcon className="w-4 h-4 flex-shrink-0" />
                                  <span>{child.label}</span>
                                  {child.badge && (
                                    <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                      {child.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    // Simple link without children
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer - User info placeholder */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@eventhub.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
