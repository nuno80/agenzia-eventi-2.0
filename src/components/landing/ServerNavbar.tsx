// src/components/landing/ServerNavbar.tsx
// Server Component version of Navbar - static version without interactivity

import { Phone } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const ServerNavbar = () => {
  const menuItems = [
    { name: 'Servizi', href: '#services' },
    { name: 'Processo', href: '#process' },
    { name: 'Casi Studio', href: '#case-studies' },
    { name: 'Blog', href: '/blog' },
    { name: 'Files', href: '/files' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contatti', href: '#contact-form' },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="font-bold text-slate-900">EventiPro</span>
            </div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-slate-700 hover:text-amber-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="#contact-form"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Preventivo Gratuito
            </Link>
            <a
              href="tel:+393401234567"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2 rounded-md transition-colors inline-flex items-center justify-center"
            >
              <Phone size={18} />
            </a>
          </div>

          <div className="sm:hidden flex items-center">
            <a
              href="tel:+393401234567"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2 rounded-md transition-colors inline-flex items-center justify-center"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default ServerNavbar
