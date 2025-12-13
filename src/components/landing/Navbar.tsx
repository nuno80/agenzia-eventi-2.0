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
import { ArrowRight, LogIn, LogOut, Phone, User } from 'lucide-react'
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
    { name: 'Servizi', id: 'services' },
    { name: 'Processo', id: 'process' },
    { name: 'Casi Studio', id: 'case-studies' },
    { name: 'Blog', href: '/blog' },
    { name: 'Files', href: '/files' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Contatti', id: 'contact-form' },
  ]

  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

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
      className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <p className="font-bold text-inherit text-slate-900">EventiPro</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={index}>
            {item.href ? (
              <Link
                href={item.href}
                className="text-slate-700 hover:text-amber-600 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <button
                onClick={() => item.id && handleScrollToSection(item.id)}
                className="text-slate-700 hover:text-amber-600 transition-colors"
              >
                {item.name}
              </button>
            )}
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
                <span className="text-sm">{session.user.name || session.user.email}</span>
              </NavbarItem>
              <NavbarItem>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-700 hover:text-red-600 transition-colors px-3 py-2 rounded-md border border-slate-200 hover:border-red-300"
                >
                  <LogOut size={16} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </NavbarItem>
            </>
          ) : (
            <NavbarItem>
              <Link
                href="/login"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                <LogIn size={16} />
                <span>Accedi</span>
              </Link>
            </NavbarItem>
          ))}

        <NavbarItem className="hidden lg:flex">
          <button
            onClick={() => handleScrollToSection('contact-form')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Preventivo Gratuito
          </button>
        </NavbarItem>
        <NavbarItem>
          <a
            href="tel:+393401234567"
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2 rounded-md transition-colors inline-flex items-center justify-center"
          >
            <Phone size={18} className="block" />
          </a>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            {item.href ? (
              <Link
                href={item.href}
                className="w-full text-left py-2 text-slate-700 hover:text-amber-600 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <button
                onClick={() => item.id && handleScrollToSection(item.id)}
                className="w-full text-left py-2 text-slate-700 hover:text-amber-600 transition-colors"
              >
                {item.name}
              </button>
            )}
          </NavbarMenuItem>
        ))}

        {/* Mobile auth */}
        {!isPending && (
          <NavbarMenuItem>
            {session ? (
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 text-red-600 border border-red-200 px-4 py-2 rounded-md transition-colors"
              >
                <LogOut size={16} />
                Logout ({session.user.email})
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                <LogIn size={16} />
                Accedi
              </Link>
            )}
          </NavbarMenuItem>
        )}

        <NavbarMenuItem>
          <button
            onClick={() => handleScrollToSection('contact-form')}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
          >
            Preventivo Gratuito
            <ArrowRight size={16} className="ml-2" />
          </button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}

export default CustomNavbar
