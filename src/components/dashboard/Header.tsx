/**
 * src/components/dashboard/Header.tsx
 * COMPONENT: Header
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Handles mobile menu toggle interaction
 * - Manages search input state
 * - Dropdown menus for notifications and user menu
 * - Fetches organization data on mount
 *
 * PROPS:
 * - onMobileMenuToggle: () => void - Callback to open mobile sidebar
 *
 * RESPONSIVE:
 * - Desktop (lg+): Full width with search bar, menu always visible
 * - Mobile: Compact header with hamburger button
 *
 * FEATURES:
 * - Mobile hamburger menu
 * - Search bar (desktop only, placeholder for now)
 * - Notifications bell with real data from API
 * - User dropdown menu with organization name
 *
 * USAGE:
 * <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
 */

'use client'

import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMobileMenuToggle: () => void
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  type: 'deadline' | 'payment' | 'info'
  link?: string
}

interface HeaderData {
  organizationName: string
  organizationEmail: string | null
  notifications: Notification[]
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [headerData, setHeaderData] = useState<HeaderData>({
    organizationName: 'EventHub',
    organizationEmail: null,
    notifications: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Fetch header data on mount
  useEffect(() => {
    async function fetchHeaderData() {
      try {
        const response = await fetch('/api/header-data')
        if (response.ok) {
          const data = await response.json()
          setHeaderData(data)
        }
      } catch (error) {
        console.error('Failed to fetch header data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeaderData()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = headerData.notifications.filter((n) => n.unread).length

  // Get initials from organization name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Apri menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search bar (hidden on mobile) */}
          <div className="hidden lg:flex items-center flex-1 max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca eventi, partecipanti, sponsor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Mobile search button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Cerca"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              aria-label="Notifiche"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Notifiche</h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {headerData.notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {isLoading ? 'Caricamento...' : 'Nessuna notifica'}
                      </p>
                    </div>
                  ) : (
                    <ul>
                      {headerData.notifications.map((notification) => (
                        <li key={notification.id}>
                          {notification.link ? (
                            <Link
                              href={notification.link}
                              onClick={() => setShowNotifications(false)}
                              className={cn(
                                'block w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-4',
                                notification.unread
                                  ? 'border-blue-500 bg-blue-50/50'
                                  : 'border-transparent'
                              )}
                            >
                              <NotificationContent notification={notification} />
                            </Link>
                          ) : (
                            <div
                              className={cn(
                                'w-full px-4 py-3 text-left border-l-4',
                                notification.unread
                                  ? 'border-blue-500 bg-blue-50/50'
                                  : 'border-transparent'
                              )}
                            >
                              <NotificationContent notification={notification} />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-gray-200">
                  <Link
                    href="/dashboard"
                    onClick={() => setShowNotifications(false)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Visualizza tutte
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User menu dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 lg:space-x-3 p-1 lg:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {isLoading ? '...' : getInitials(headerData.organizationName)}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {isLoading ? 'Caricamento...' : headerData.organizationName}
                </p>
                <p className="text-xs text-gray-500">Organizzatore</p>
              </div>
              <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User info (mobile only) */}
                <div className="lg:hidden px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{headerData.organizationName}</p>
                  {headerData.organizationEmail && (
                    <p className="text-xs text-gray-500">{headerData.organizationEmail}</p>
                  )}
                </div>

                <ul>
                  <li>
                    <Link
                      href="/impostazioni"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profilo</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/impostazioni"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Impostazioni</span>
                    </Link>
                  </li>
                </ul>

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar (expandable) */}
      <div className="lg:hidden px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </header>
  )
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
      </div>
    </div>
  )
}
