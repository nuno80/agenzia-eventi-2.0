// src/components/landing/ServerNavbar.tsx
// Server Component version of Navbar - static version without interactivity

import Link from 'next/link'

const ServerNavbar = () => {
  const menuItems = [
    { name: 'Servizi', href: '/servizi' },
    { name: 'Processo', href: '/processo' },
    { name: 'Casi Studio', href: '/casi-studio' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contatti', href: '/#contact' },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-slate-900 tracking-tight flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                  StarterKit
                </span>
              </Link>
            </div>
            <div className="hidden lg:block ml-10">
              <div className="flex space-x-8">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-slate-600 hover:text-amber-600 font-medium transition-colors text-sm tracking-wide"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-slate-700 hover:text-amber-600 font-medium transition-colors px-3 py-2 text-sm"
            >
              Accedi
            </Link>
            <Link
              href="/contatti"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-sm"
            >
              Preventivo Gratuito
            </Link>
          </div>

          <div className="lg:hidden flex items-center">
            {/* Mobile menu logic would go here, but this is server component only */}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default ServerNavbar
