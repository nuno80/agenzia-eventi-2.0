// ============================================================================
// DASHBOARD HEADER
// ============================================================================
// FILE: src/components/dashboard/DashboardHeader.tsx
//
// PURPOSE: Header for the dashboard with user profile and actions
// FEATURES:
// - User profile dropdown
// - Mobile navigation toggle
// - Notifications
// ============================================================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BellIcon, MenuIcon, UserIcon } from 'lucide-react'

export function DashboardHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>

        {/* Title - Mobile Only */}
        <h1 className="text-lg font-bold md:hidden">EventMaster</h1>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <BellIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifiche</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Nessuna notifica</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profilo</DropdownMenuItem>
              <DropdownMenuItem>Impostazioni</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="/" className="block px-2 py-1 hover:bg-gray-100 rounded">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/eventi" className="block px-2 py-1 hover:bg-gray-100 rounded">
                  Eventi
                </a>
              </li>
              <li>
                <a href="/partecipanti" className="block px-2 py-1 hover:bg-gray-100 rounded">
                  Partecipanti
                </a>
              </li>
              {/* Add more navigation items as needed */}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
