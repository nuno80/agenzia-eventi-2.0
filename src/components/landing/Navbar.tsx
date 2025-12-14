'use client'

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/navbar'
import { ArrowRight, LogIn, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { signOut, useSession } from '@/lib/auth-client'

type MenuItem = {
  name: string
  id?: string
  href?: string
}

const CustomNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, isPending } = useSession()

  // Check if user is admin
  const isAdmin = session?.user && (session.user as { role?: string }).role === 'admin'

  const menuItems: MenuItem[] = [
    // Dashboard only visible to admins
    ...(isAdmin ? [{ name: 'Dashboard', href: '/dashboard' }] : []),
    { name: 'Servizi', href: '/servizi' },
    { name: 'Processo', href: '/processo' },
    { name: 'Casi Studio', href: '/casi-studio' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contatti', href: '/#contact' },
  ]

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/'
        },
      },
    })
  }

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm supports-[backdrop-filter]:bg-white/60"
      classNames={{
        item: [
          'flex',
          'relative',
          'h-full',
          'items-center',
          "data-[active=true]:after:content-['']",
          'data-[active=true]:after:absolute',
          'data-[active=true]:after:bottom-0',
          'data-[active=true]:after:left-0',
          'data-[active=true]:after:right-0',
          'data-[active=true]:after:h-[2px]',
          'data-[active=true]:after:rounded-[2px]',
          'data-[active=true]:after:bg-amber-500',
        ],
      }}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden"
        />
        <NavbarBrand>
          <Link
            href="/"
            className="font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              StarterKit
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex gap-6" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={index}>
            <Link
              href={item.href || '#'}
              className="text-slate-600 hover:text-amber-600 font-medium transition-colors text-sm tracking-wide"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        {/* Auth buttons */}
        {!isPending &&
          (session ? (
            <>
              <NavbarItem className="hidden md:flex items-center gap-2 text-slate-600">
                <User size={16} />
                <span className="text-sm font-medium">
                  {session.user.name || session.user.email}
                </span>
              </NavbarItem>
              <NavbarItem>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-700 hover:text-red-600 transition-colors px-3 py-2 rounded-md border border-slate-200 hover:border-red-200 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span className="hidden md:inline text-sm font-medium">Logout</span>
                </button>
              </NavbarItem>
            </>
          ) : (
            <NavbarItem>
              <Link
                href="/login"
                className="flex items-center gap-2 text-slate-700 hover:text-amber-600 font-medium transition-colors px-3 py-2"
              >
                <LogIn size={18} />
                <span className="hidden sm:inline">Accedi</span>
              </Link>
            </NavbarItem>
          ))}

        <NavbarItem className="hidden sm:flex">
          <Link
            href="/contatti"
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-sm"
          >
            Preventivo Gratuito
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="pt-6 bg-white/95 backdrop-blur-xl">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              href={item.href || '#'}
              className="w-full text-left py-3 text-lg font-medium text-slate-700 hover:text-amber-600 transition-colors border-b border-slate-100 block"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}

        {/* Mobile auth */}
        {!isPending && (
          <NavbarMenuItem className="mt-4">
            {session ? (
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 text-red-600 border border-red-200 px-4 py-3 rounded-xl transition-colors font-medium"
              >
                <LogOut size={18} />
                Logout ({session.user.email})
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-100 text-slate-900 px-4 py-3 rounded-xl font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn size={18} />
                Accedi
              </Link>
            )}
          </NavbarMenuItem>
        )}

        <NavbarMenuItem>
          <Link
            href="/contatti"
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center shadow-lg"
            onClick={() => setIsMenuOpen(false)}
          >
            Preventivo Gratuito
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}

export default CustomNavbar
