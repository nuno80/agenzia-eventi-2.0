/**
 * COMPONENT: Header
 * TYPE: Client Component
 * 
 * WHY CLIENT:
 * - Handles mobile menu toggle interaction
 * - Manages search input state
 * - Dropdown menus for notifications and user menu
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
 * - Notifications bell with badge
 * - User dropdown menu
 * 
 * USAGE:
 * <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
 */

'use client';

import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock notifications (sostituire con dati reali)
  const notifications = [
    {
      id: 1,
      title: 'Nuova iscrizione',
      message: 'Giovanni Rossi si è iscritto a "Tech Summit 2024"',
      time: '5 min fa',
      unread: true,
    },
    {
      id: 2,
      title: 'Scadenza imminente',
      message: 'Il contratto con lo sponsor scade tra 2 giorni',
      time: '1 ora fa',
      unread: true,
    },
    {
      id: 3,
      title: 'Budget aggiornato',
      message: 'Il budget per "Workshop AI" è stato modificato',
      time: '3 ore fa',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

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
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nessuna notifica</p>
                    </div>
                  ) : (
                    <ul>
                      {notifications.map((notification) => (
                        <li key={notification.id}>
                          <button
                            className={cn(
                              "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-4",
                              notification.unread
                                ? "border-blue-500 bg-blue-50/50"
                                : "border-transparent"
                            )}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Visualizza tutte
                  </button>
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
                <span className="text-sm font-medium text-white">A</span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User info (mobile only) */}
                <div className="lg:hidden px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@eventhub.com</p>
                </div>

                <ul>
                  <li>
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4" />
                      <span>Profilo</span>
                    </button>
                  </li>
                  <li>
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Impostazioni</span>
                    </button>
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
  );
}